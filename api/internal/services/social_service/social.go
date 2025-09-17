package social_service

import (
	"context"
	"errors"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SocialService struct {
	userFollowingRepo *repositories.UserFollowingRepository
	boxForkRepo       *repositories.BoxForkRepository
	boxRatingRepo     *repositories.BoxRatingRepository
	activityFeedRepo  *repositories.ActivityFeedRepository
	boxRepo           *repositories.BoxRepository
	userRepo          *repositories.UserRepository
}

func NewSocialService(
	userFollowingRepo *repositories.UserFollowingRepository,
	boxForkRepo *repositories.BoxForkRepository,
	boxRatingRepo *repositories.BoxRatingRepository,
	activityFeedRepo *repositories.ActivityFeedRepository,
	boxRepo *repositories.BoxRepository,
	userRepo *repositories.UserRepository,
) *SocialService {
	return &SocialService{
		userFollowingRepo: userFollowingRepo,
		boxForkRepo:       boxForkRepo,
		boxRatingRepo:     boxRatingRepo,
		activityFeedRepo:  activityFeedRepo,
		boxRepo:           boxRepo,
		userRepo:          userRepo,
	}
}

// FollowUser creates a follow relationship and generates activity
func (s *SocialService) FollowUser(ctx context.Context, followerID, followingID primitive.ObjectID) error {
	// Create follow relationship
	_, err := s.userFollowingRepo.FollowUser(followerID, followingID)
	if err != nil {
		return err
	}

	// Create activity feed entry
	metadata := map[string]interface{}{
		"following_id": followingID.Hex(),
	}
	_, err = s.activityFeedRepo.CreateActivity(
		followerID,
		models.ActivityTypeUserFollowed,
		followingID,
		"user",
		metadata,
		true,
	)
	if err != nil {
		// Log error but don't fail the follow operation
		// In a production system, you might want to use a message queue for this
	}

	// Update follower counts (in a real system, this might be done asynchronously)
	s.updateUserFollowCounts(followerID, followingID)

	return nil
}

// UnfollowUser removes a follow relationship
func (s *SocialService) UnfollowUser(ctx context.Context, followerID, followingID primitive.ObjectID) error {
	err := s.userFollowingRepo.UnfollowUser(followerID, followingID)
	if err != nil {
		return err
	}

	// Update follower counts
	s.updateUserFollowCounts(followerID, followingID)

	return nil
}

// ForkBox creates a fork of a public box
func (s *SocialService) ForkBox(ctx context.Context, originalBoxID, userID primitive.ObjectID, forkDescription string) (*models.Box, error) {
	// Get original box
	originalBox, err := s.boxRepo.GetBoxByID(context.Background(), originalBoxID.Hex())
	if err != nil {
		return nil, err
	}

	if originalBox == nil {
		return nil, errors.New("original box not found")
	}

	// Check if box is public or unlisted (not private)
	if originalBox.Visibility == models.BoxVisibilityPrivate {
		return nil, errors.New("cannot fork private box")
	}

	// Check if user has already forked this box
	hasForked, err := s.boxForkRepo.HasUserForkedBox(userID, originalBoxID)
	if err != nil {
		return nil, err
	}
	if hasForked {
		return nil, errors.New("user has already forked this box")
	}

	// Create new forked box
	forkedBox := models.NewBox(originalBox.Name+" (Fork)", userID)
	forkedBox.Description = originalBox.Description
	forkedBox.Tags = originalBox.Tags
	forkedBox.Language = originalBox.Language
	forkedBox.Difficulty = originalBox.Difficulty
	forkedBox.IsForked = true
	forkedBox.OriginalBoxID = originalBoxID
	forkedBox.ForkDescription = forkDescription

	// Save forked box
	createdBox, err := s.boxRepo.InsertBox(context.Background(), forkedBox)
	if err != nil {
		return nil, err
	}

	// Create fork relationship
	_, err = s.boxForkRepo.CreateFork(originalBoxID, createdBox.ID, userID, originalBox.UserID, forkDescription)
	if err != nil {
		// Clean up created box if fork relationship creation fails
		s.boxRepo.DeleteBox(context.Background(), createdBox.ID.Hex())
		return nil, err
	}

	// Create activity feed entry
	metadata := map[string]interface{}{
		"original_box_id":   originalBoxID.Hex(),
		"original_box_name": originalBox.Name,
		"fork_description":  forkDescription,
	}
	_, err = s.activityFeedRepo.CreateActivity(
		userID,
		models.ActivityTypeBoxForked,
		createdBox.ID,
		"box",
		metadata,
		true,
	)

	// Update fork count for original box (async in production)
	s.updateBoxForkCount(originalBoxID)

	return createdBox, nil
}

// RateBox creates or updates a rating for a box
func (s *SocialService) RateBox(ctx context.Context, boxID, userID primitive.ObjectID, rating int, review string) (*models.BoxRating, error) {
	// Get box to ensure it exists and is public
	box, err := s.boxRepo.GetBoxByID(context.Background(), boxID.Hex())
	if err != nil {
		return nil, err
	}

	if box == nil {
		return nil, errors.New("box not found")
	}

	// Check if box is public (users can only rate public boxes)
	if box.Visibility != models.BoxVisibilityPublic {
		return nil, errors.New("can only rate public boxes")
	}

	// Prevent users from rating their own boxes
	if box.UserID == userID {
		return nil, errors.New("cannot rate your own box")
	}

	// Create or update rating
	boxRating, err := s.boxRatingRepo.CreateOrUpdateRating(boxID, userID, rating, review)
	if err != nil {
		return nil, err
	}

	// Create activity feed entry (only for new ratings, not updates)
	if boxRating.CreatedAt == boxRating.UpdatedAt {
		metadata := map[string]interface{}{
			"box_name": box.Name,
			"rating":   rating,
			"review":   review,
		}
		_, err = s.activityFeedRepo.CreateActivity(
			userID,
			models.ActivityTypeBoxRated,
			boxID,
			"box",
			metadata,
			true,
		)
	}

	// Update box rating stats (async in production)
	s.updateBoxRatingStats(boxID)

	return boxRating, nil
}

// GetPersonalizedFeed returns a personalized activity feed for a user
func (s *SocialService) GetPersonalizedFeed(ctx context.Context, userID primitive.ObjectID, limit, skip int) ([]*models.ActivityFeed, error) {
	// Get list of users that this user follows
	following, err := s.userFollowingRepo.GetFollowing(userID, 1000, 0) // Get up to 1000 following
	if err != nil {
		return nil, err
	}

	followingIDs := make([]primitive.ObjectID, len(following))
	for i, f := range following {
		followingIDs[i] = f.FollowingID
	}

	// Get personalized feed
	return s.activityFeedRepo.GetUserFeed(userID, followingIDs, limit, skip)
}

// GetPublicBoxes returns discoverable public boxes with filters
func (s *SocialService) GetPublicBoxes(ctx context.Context, tags []string, language string, difficulty string, sortBy string, limit, skip int) ([]*models.Box, error) {
	return s.boxRepo.GetPublicBoxes(ctx, tags, language, difficulty, sortBy, limit, skip)
}

// SearchUsers searches for users by username or display name
func (s *SocialService) SearchUsers(ctx context.Context, query string, limit, skip int) ([]*models.User, error) {
	return s.userRepo.SearchUsers(ctx, query, limit, skip)
}

// Helper methods for updating counts (in production, these should be async)

func (s *SocialService) updateUserFollowCounts(followerID, followingID primitive.ObjectID) {
	// Update follower count for the user being followed
	followerCount, _ := s.userFollowingRepo.GetFollowerCount(followingID)
	// Update following count for the user who is following
	followingCount, _ := s.userFollowingRepo.GetFollowingCount(followerID)

	// In a real implementation, you would update the user documents with these counts
	// This is simplified for the example
	_ = followerCount
	_ = followingCount
}

func (s *SocialService) updateBoxForkCount(boxID primitive.ObjectID) {
	forkCount, _ := s.boxForkRepo.GetForkCount(boxID)
	// Update the box document with the new fork count
	_ = forkCount
}

func (s *SocialService) updateBoxRatingStats(boxID primitive.ObjectID) {
	stats, _ := s.boxRatingRepo.GetBoxRatingStats(boxID)
	// Update the box document with the new rating stats
	_ = stats
}

// GetUserProfile returns a user's public profile information
func (s *SocialService) GetUserProfile(ctx context.Context, userID primitive.ObjectID, viewerID *primitive.ObjectID) (map[string]interface{}, error) {
	user, err := s.userRepo.FindUserById(userID.Hex())
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errors.New("user not found")
	}

	// Check if profile is public or if viewer is the user themselves
	if !user.IsPublic && (viewerID == nil || *viewerID != userID) {
		return nil, errors.New("profile is private")
	}

	profile := map[string]interface{}{
		"id":           user.IDString(),
		"username":     user.Username,
		"display_name": user.DisplayName,
		"bio":          user.Bio,
		"avatar_url":   user.AvatarURL,
		"created_at":   user.CreatedAt,
		"is_public":    user.IsPublic,
	}

	// Add follow counts
	followerCount, _ := s.userFollowingRepo.GetFollowerCount(userID)
	followingCount, _ := s.userFollowingRepo.GetFollowingCount(userID)

	profile["follower_count"] = followerCount
	profile["following_count"] = followingCount

	// Add follow status if viewer is provided
	if viewerID != nil && *viewerID != userID {
		isFollowing, _ := s.userFollowingRepo.IsFollowing(*viewerID, userID)
		profile["is_following"] = isFollowing
	}

	return profile, nil
}
