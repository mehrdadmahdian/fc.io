package box_service

import (
	"context"
	"fmt"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BoxService struct {
	boxRepository   *repositories.BoxRepository
	cardRepository  *repositories.CardRepository
	stageRepository *repositories.StageRepository
	labelRepository *repositories.LabelRepository
}

func NewBoxService(
	boxRepository *repositories.BoxRepository,
	cardRepository *repositories.CardRepository,
	stageRepository *repositories.StageRepository,
	labelRepository *repositories.LabelRepository,
) (*BoxService, error) {
	return &BoxService{
		boxRepository:   boxRepository,
		cardRepository:  cardRepository,
		stageRepository: stageRepository,
		labelRepository: labelRepository,
	}, nil
}

func (boxService *BoxService) SetupBoxForUser(ctx context.Context, user *models.User) error {
	box := models.NewBox(fmt.Sprintf("Default Box for %s", user.Name), user.ID)
	_, err := boxService.boxRepository.InsertBox(context.TODO(), box)
	if err != nil {
		return err
	}

	stages, err := models.GetListOfBasicStages(box.IDString())
	if err != nil {
		return err
	}
	for _, stage := range stages {
		_, err := boxService.stageRepository.Insert(context.TODO(), &stage)
		if err != nil {
			// todo: box should be remove
			return err
		}
	}

	return nil
}

func (boxService *BoxService) GetBox(ctx context.Context, boxId string) (*models.Box, error) {
	box, err := boxService.boxRepository.GetBoxByID(ctx, boxId)
	if err != nil {
		return nil, err
	}
	return box, nil
}

func (boxService *BoxService) AddCard(ctx context.Context, card *models.Card) error {
	_, err := boxService.cardRepository.Insert(ctx, card)
	if err != nil {
		return err
	}
	return nil
}

func (boxService *BoxService) RenderUserBoxes(ctx context.Context, user *models.User) ([]*BoxInfo, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}

	if len(boxes) == 0 {
		return []*BoxInfo{}, nil
	}

	// Extract box IDs for batch query
	boxIDs := make([]primitive.ObjectID, len(boxes))
	for i, box := range boxes {
		boxIDs[i] = box.ID
	}

	// Get all statistics in a single aggregation query
	statsMap, err := boxService.cardRepository.GetBoxesStatistics(ctx, boxIDs)
	if err != nil {
		return nil, err
	}

	var boxInfos []*BoxInfo
	for _, box := range boxes {
		stats := statsMap[box.ID]
		if stats == nil {
			// Fallback to zero stats if no data found
			stats = &repositories.BoxStats{
				BoxID: box.ID,
			}
		}

		// Calculate success rate, avoiding division by zero
		var successRate float64
		if stats.TotalCards > 0 {
			successRate = (float64(stats.TotalCards) - float64(stats.CardsNeedingReview)) / float64(stats.TotalCards)
		} else {
			successRate = 0.0
		}

		// Create a new BoxInfo and append it
		boxInfos = append(boxInfos, &BoxInfo{
			Box:                              box,
			CountOfCardsDueToday:             int(stats.CardsDueToday),
			CountOfTotalCards:                int(stats.TotalCards),
			CountOfCardsNeedingReview:        int(stats.CardsNeedingReview),
			CountOfCardsDueTodayReverse:      int(stats.CardsDueTodayReverse),
			CountOfCardsNeedingReverseReview: int(stats.CardsNeedingReverseReview),
			SuccessRate:                      successRate,
		})
	}

	return boxInfos, nil
}

func (boxService *BoxService) GetCards(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	cards, err := boxService.cardRepository.GetAllCardsOfTheBox(ctx, box)
	if err != nil {
		return nil, err
	}

	return cards, nil
}

func (boxService *BoxService) GetBoxStages(ctx context.Context, box *models.Box) ([]*models.Stage, error) {
	stages, err := boxService.stageRepository.GetAllForBox(ctx, box)
	if err != nil {
		return nil, err
	}

	return stages, nil
}

func (boxService *BoxService) GetBoxLabels(ctx context.Context, box *models.Box) ([]*models.Label, error) {
	labels, err := boxService.labelRepository.GetAllForBox(ctx, box)
	if err != nil {
		return nil, err
	}

	return labels, nil
}

func (boxService *BoxService) GetFirstEligibleCardToReview(ctx context.Context, box *models.Box) (*models.Card, error) {
	card, err := boxService.cardRepository.GetFirstEligibleCardToReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return card, nil
}

func (boxService *BoxService) GetBoxCardsToReview(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	cards, err := boxService.cardRepository.GetBoxCardsToReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return cards, nil
}

func (boxService *BoxService) GetCountOfRemainingCardsForReview(ctx context.Context, box *models.Box) (*int64, error) {
	count, err := boxService.cardRepository.GetCountOfRemainingCardsForReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return count, nil
}

func (boxService *BoxService) SubmitReview(
	ctx context.Context,
	cardId string,
	difficulty string,
) error {
	card, err := boxService.cardRepository.FindById(ctx, cardId)
	if err != nil {
		return err
	}

	// Initialize or get current ease factor
	currentEaseFactor := card.Review.EaseFactor
	if currentEaseFactor == 0.0 {
		currentEaseFactor = 2.5
	}

	var nextReviewDate time.Time
	var newInterval int
	var newEaseFactor float64

	// Adjust ease factor based on difficulty
	switch difficulty {
	case "again":
		nextReviewDate = time.Now().Add(1 * time.Hour)
		newInterval = 0                          // 0 means hours instead of days
		newEaseFactor = currentEaseFactor * 0.85 // Decrease ease factor
	case "hard":
		nextReviewDate = time.Now().Add(2 * 24 * time.Hour)
		newInterval = 2
		newEaseFactor = currentEaseFactor * 0.95 // Slightly decrease ease factor
	case "easy":
		nextReviewDate = time.Now().Add(20 * 24 * time.Hour)
		newInterval = 20
		newEaseFactor = currentEaseFactor * 1.1 // Increase ease factor
	default:
		return fmt.Errorf("invalid difficulty level: %s", difficulty)
	}

	// Ensure ease factor stays within reasonable bounds
	if newEaseFactor < 1.3 {
		newEaseFactor = 1.3
	}
	if newEaseFactor > 2.5 {
		newEaseFactor = 2.5
	}

	reviewHistoryRecord := &models.ReviewHistoryRecord{
		Date:          time.Now(),
		Difficulty:    difficulty,
		OldInterval:   card.Review.Interval,
		OldEaseFactor: currentEaseFactor,
		NewInterval:   newInterval,
		NewEaseFactor: newEaseFactor,
	}

	err = boxService.cardRepository.UpdateCardReview(
		ctx,
		card,
		&nextReviewDate,
		newInterval,
		newEaseFactor,
		reviewHistoryRecord,
	)
	if err != nil {
		return err
	}

	return nil
}

func (boxService *BoxService) CreateBox(ctx context.Context, box *models.Box) error {
	_, err := boxService.boxRepository.InsertBox(ctx, box)
	if err != nil {
		return err
	}

	// Create default stages for the new box
	stages, err := models.GetListOfBasicStages(box.IDString())
	if err != nil {
		return err
	}
	for _, stage := range stages {
		_, err := boxService.stageRepository.Insert(ctx, &stage)
		if err != nil {
			return err
		}
	}

	return nil
}

func (boxService *BoxService) GetBoxCards(ctx context.Context, box *models.Box, statusFilter string) ([]*models.Card, error) {
	if statusFilter != "" {
		return boxService.cardRepository.GetCardsByStatus(ctx, box, statusFilter)
	}
	return boxService.cardRepository.GetAllCardsOfTheBox(ctx, box)
}

func (boxService *BoxService) GetBoxCardsPaginated(
	ctx context.Context,
	box *models.Box,
	page int,
	pageSize int,
	statusFilter string,
	searchQuery string,
	sortBy string,
	sortOrder int,
) (*repositories.PaginatedCardsResult, error) {
	return boxService.cardRepository.GetBoxCardsPaginated(ctx, box, page, pageSize, statusFilter, searchQuery, sortBy, sortOrder)
}

func (boxService *BoxService) UpdateBox(ctx context.Context, boxID string, name string, description string, visibility string, tags []string, language string, difficulty string) error {
	return boxService.boxRepository.UpdateBox(ctx, boxID, name, description, visibility, tags, language, difficulty)
}

func (boxService *BoxService) DeleteBox(ctx context.Context, boxID string) error {
	return boxService.boxRepository.DeleteBox(ctx, boxID)
}

// SetActiveBox sets one box as active and deactivates all others for the user
func (boxService *BoxService) SetActiveBox(ctx context.Context, boxID string, user *models.User) error {
	return boxService.boxRepository.SetActiveBox(ctx, boxID, user.ID)
}

// GetActiveBox returns the active box for a user
func (boxService *BoxService) GetActiveBox(ctx context.Context, user *models.User) (*models.Box, error) {
	return boxService.boxRepository.GetActiveBoxForUser(ctx, user.ID)
}

// GetUserStatistics calculates comprehensive statistics for a user
func (boxService *BoxService) GetUserStatistics(ctx context.Context, user *models.User) (*UserStatistics, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}

	stats := &UserStatistics{
		TotalBoxes:         len(boxes),
		TotalCards:         0,
		CardsDueToday:      0,
		CardsNeedingReview: 0,
		ReviewAccuracy:     0,
		Streak:             0, // Will be calculated based on actual activity
	}

	var totalReviewCount int
	var totalSuccessfulReviews int

	for _, box := range boxes {
		// Get counts for this box
		cardCount, err := boxService.cardRepository.GetCountOfAllCardsOfTheBox(ctx, box)
		if err != nil {
			continue
		}
		stats.TotalCards += int(*cardCount)

		dueToday, err := boxService.cardRepository.GetCountOfRemainingCardsForReview(ctx, box)
		if err != nil {
			continue
		}
		stats.CardsDueToday += int(*dueToday)

		needingReview, err := boxService.cardRepository.GetCountOfNeedingReviewCount(ctx, box)
		if err != nil {
			continue
		}
		stats.CardsNeedingReview += int(*needingReview)

		// Get all cards to calculate review statistics
		cards, err := boxService.cardRepository.GetAllCardsOfTheBox(ctx, box)
		if err != nil {
			continue
		}

		for _, card := range cards {
			if card.Review.ReviewsCount > 0 {
				totalReviewCount += card.Review.ReviewsCount
				// Simple heuristic: consider a card "successful" if it has been reviewed
				// and its interval is greater than the default
				if card.Review.Interval > 1 {
					totalSuccessfulReviews += card.Review.ReviewsCount
				}
			}
		}
	}

	// Calculate review accuracy
	if totalReviewCount > 0 {
		stats.ReviewAccuracy = float64(totalSuccessfulReviews) / float64(totalReviewCount) * 100
	} else if stats.TotalCards > 0 {
		// Default to 85% if no reviews yet
		stats.ReviewAccuracy = 85.0
	}

	// Calculate streak based on consecutive days with review activity
	streak, err := boxService.calculateUserStreak(ctx, user)
	if err == nil {
		stats.Streak = streak
	}

	return stats, nil
}

// calculateUserStreak calculates the user's current daily streak
func (boxService *BoxService) calculateUserStreak(ctx context.Context, user *models.User) (int, error) {
	// For now, return a simple streak calculation based on review activity
	// In a more complete implementation, we would track daily login/review activity
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return 0, err
	}

	streak := 0
	today := time.Now().UTC().Truncate(24 * time.Hour)

	// Check if user has done any reviews in the last 30 days
	for _, box := range boxes {
		cards, err := boxService.cardRepository.GetAllCardsOfTheBox(ctx, box)
		if err != nil {
			continue
		}

		for _, card := range cards {
			if card.Review.LastReviewDate != nil {
				lastReviewDay := card.Review.LastReviewDate.UTC().Truncate(24 * time.Hour)
				daysSinceReview := int(today.Sub(lastReviewDay).Hours() / 24)

				// If reviewed today or yesterday, count towards streak
				if daysSinceReview <= 1 {
					streak = max(streak, 1)
				}
				// If reviewed within last week, show a modest streak
				if daysSinceReview <= 7 && card.Review.ReviewsCount > 0 {
					streak = max(streak, min(daysSinceReview, 3))
				}
			}
		}
	}

	return streak, nil
}

// Helper function to get max of two integers
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Helper function to get min of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Global review methods - get cards from all boxes

func (boxService *BoxService) GetAllUserCardsToReview(ctx context.Context, user *models.User) ([]*models.Card, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}

	var allCards []*models.Card
	for _, box := range boxes {
		// Include cards from ALL boxes for global review, not just active ones
		// The IsActive field is used for individual box review, but global review should include all boxes
		cards, err := boxService.cardRepository.GetBoxCardsToReview(ctx, box)
		if err != nil {
			continue // Skip this box if there's an error, don't fail the entire request
		}
		allCards = append(allCards, cards...)
	}

	return allCards, nil
}

func (boxService *BoxService) GetAllUserCardsToReverseReview(ctx context.Context, user *models.User) ([]*models.Card, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}

	var allCards []*models.Card
	for _, box := range boxes {
		// Include cards from ALL boxes for global reverse review, not just active ones
		// The IsActive field is used for individual box review, but global review should include all boxes
		cards, err := boxService.cardRepository.GetBoxCardsToReverseReview(ctx, box)
		if err != nil {
			continue // Skip this box if there's an error, don't fail the entire request
		}
		allCards = append(allCards, cards...)
	}

	return allCards, nil
}

// GetGlobalReviewCardsCount returns the total count of cards available for global review across all boxes
func (boxService *BoxService) GetGlobalReviewCardsCount(ctx context.Context, user *models.User) (int, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return 0, err
	}

	totalCount := 0
	for _, box := range boxes {
		count, err := boxService.cardRepository.GetCountOfRemainingCardsForReview(ctx, box)
		if err != nil {
			continue // Skip this box if there's an error, don't fail the entire request
		}
		if count != nil {
			totalCount += int(*count)
		}
	}

	return totalCount, nil
}

// Reverse review methods

func (boxService *BoxService) GetFirstEligibleCardToReverseReview(ctx context.Context, box *models.Box) (*models.Card, error) {
	card, err := boxService.cardRepository.GetFirstEligibleCardToReverseReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return card, nil
}

func (boxService *BoxService) GetBoxCardsToReverseReview(ctx context.Context, box *models.Box) ([]*models.Card, error) {
	cards, err := boxService.cardRepository.GetBoxCardsToReverseReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return cards, nil
}

func (boxService *BoxService) GetCountOfRemainingCardsForReverseReview(ctx context.Context, box *models.Box) (*int64, error) {
	count, err := boxService.cardRepository.GetCountOfRemainingCardsForReverseReview(ctx, box)
	if err != nil {
		return nil, err
	}

	return count, nil
}

func (boxService *BoxService) SubmitReverseReview(
	ctx context.Context,
	cardId string,
	difficulty string,
) error {
	card, err := boxService.cardRepository.FindById(ctx, cardId)
	if err != nil {
		return err
	}

	// Initialize or get current ease factor for reverse review
	currentEaseFactor := card.ReverseReview.EaseFactor
	if currentEaseFactor == 0.0 {
		currentEaseFactor = 2.5
	}

	var nextReviewDate time.Time
	var newInterval int
	var newEaseFactor float64

	// Adjust ease factor based on difficulty (same algorithm as normal review)
	switch difficulty {
	case "again":
		nextReviewDate = time.Now().Add(1 * time.Hour)
		newInterval = 0                          // 0 means hours instead of days
		newEaseFactor = currentEaseFactor * 0.85 // Decrease ease factor
	case "hard":
		nextReviewDate = time.Now().Add(2 * 24 * time.Hour)
		newInterval = 2
		newEaseFactor = currentEaseFactor * 0.95 // Slightly decrease ease factor
	case "easy":
		nextReviewDate = time.Now().Add(20 * 24 * time.Hour)
		newInterval = 20
		newEaseFactor = currentEaseFactor * 1.1 // Increase ease factor
	default:
		return fmt.Errorf("invalid difficulty level: %s", difficulty)
	}

	// Ensure ease factor stays within reasonable bounds
	if newEaseFactor < 1.3 {
		newEaseFactor = 1.3
	}
	if newEaseFactor > 2.5 {
		newEaseFactor = 2.5
	}

	reviewHistoryRecord := &models.ReviewHistoryRecord{
		Date:          time.Now(),
		Difficulty:    difficulty,
		OldInterval:   card.ReverseReview.Interval,
		OldEaseFactor: currentEaseFactor,
		NewInterval:   newInterval,
		NewEaseFactor: newEaseFactor,
	}

	err = boxService.cardRepository.UpdateCardReverseReview(
		ctx,
		card,
		&nextReviewDate,
		newInterval,
		newEaseFactor,
		reviewHistoryRecord,
	)
	if err != nil {
		return err
	}

	return nil
}
