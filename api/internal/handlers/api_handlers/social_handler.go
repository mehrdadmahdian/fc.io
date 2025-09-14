package api_handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/mehrdadmahdian/fc.io/internal/services/social_service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SocialHandler struct {
	socialService *social_service.SocialService
}

func NewSocialHandler(socialService *social_service.SocialService) *SocialHandler {
	return &SocialHandler{
		socialService: socialService,
	}
}

// FollowUser handles POST /api/users/{id}/follow
func (h *SocialHandler) FollowUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	followerID := c.Locals("userID").(string)

	// Convert string IDs to ObjectIDs
	followerObjectID, err := primitive.ObjectIDFromHex(followerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid follower ID",
		})
	}

	followingObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	err = h.socialService.FollowUser(c.Context(), followerObjectID, followingObjectID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Successfully followed user",
	})
}

// UnfollowUser handles DELETE /api/users/{id}/follow
func (h *SocialHandler) UnfollowUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	followerID := c.Locals("userID").(string)

	// Convert string IDs to ObjectIDs
	followerObjectID, err := primitive.ObjectIDFromHex(followerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid follower ID",
		})
	}

	followingObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	err = h.socialService.UnfollowUser(c.Context(), followerObjectID, followingObjectID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Successfully unfollowed user",
	})
}

// ForkBox handles POST /api/boxes/{id}/fork
func (h *SocialHandler) ForkBox(c *fiber.Ctx) error {
	boxID := c.Params("id")
	userID := c.Locals("userID").(string)

	// Parse request body
	var req struct {
		Description string `json:"description"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Convert string IDs to ObjectIDs
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	boxObjectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid box ID",
		})
	}

	forkedBox, err := h.socialService.ForkBox(c.Context(), boxObjectID, userObjectID, req.Description)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message":    "Successfully forked box",
		"forked_box": forkedBox,
	})
}

// RateBox handles POST /api/boxes/{id}/rate
func (h *SocialHandler) RateBox(c *fiber.Ctx) error {
	boxID := c.Params("id")
	userID := c.Locals("userID").(string)

	// Parse request body
	var req struct {
		Rating int    `json:"rating" validate:"required,min=1,max=5"`
		Review string `json:"review"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate rating
	if req.Rating < 1 || req.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Rating must be between 1 and 5",
		})
	}

	// Convert string IDs to ObjectIDs
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	boxObjectID, err := primitive.ObjectIDFromHex(boxID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid box ID",
		})
	}

	rating, err := h.socialService.RateBox(c.Context(), boxObjectID, userObjectID, req.Rating, req.Review)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Successfully rated box",
		"rating":  rating,
	})
}

// GetPublicBoxes handles GET /api/boxes/public
func (h *SocialHandler) GetPublicBoxes(c *fiber.Ctx) error {
	// Parse query parameters
	limitStr := c.Query("limit", "20")
	skipStr := c.Query("skip", "0")
	tags := c.Query("tags", "")
	language := c.Query("language", "")
	difficulty := c.Query("difficulty", "")
	sortBy := c.Query("sort", "created_at")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	skip, err := strconv.Atoi(skipStr)
	if err != nil || skip < 0 {
		skip = 0
	}

	// Parse tags
	var tagList []string
	if tags != "" {
		// Simple comma-separated parsing
		// In production, you might want more sophisticated parsing
		tagList = []string{tags}
	}

	boxes, err := h.socialService.GetPublicBoxes(c.Context(), tagList, language, difficulty, sortBy, limit, skip)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"boxes": boxes,
		"pagination": fiber.Map{
			"limit": limit,
			"skip":  skip,
		},
	})
}

// GetPersonalizedFeed handles GET /api/feed
func (h *SocialHandler) GetPersonalizedFeed(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	// Parse query parameters
	limitStr := c.Query("limit", "20")
	skipStr := c.Query("skip", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	skip, err := strconv.Atoi(skipStr)
	if err != nil || skip < 0 {
		skip = 0
	}

	// Convert string ID to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	feed, err := h.socialService.GetPersonalizedFeed(c.Context(), userObjectID, limit, skip)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"activities": feed,
		"pagination": fiber.Map{
			"limit": limit,
			"skip":  skip,
		},
	})
}

// SearchUsers handles GET /api/users/search
func (h *SocialHandler) SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q", "")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	// Parse query parameters
	limitStr := c.Query("limit", "20")
	skipStr := c.Query("skip", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	skip, err := strconv.Atoi(skipStr)
	if err != nil || skip < 0 {
		skip = 0
	}

	users, err := h.socialService.SearchUsers(c.Context(), query, limit, skip)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"users": users,
		"pagination": fiber.Map{
			"limit": limit,
			"skip":  skip,
		},
	})
}

// GetUserProfile handles GET /api/users/{id}/profile
func (h *SocialHandler) GetUserProfile(c *fiber.Ctx) error {
	userID := c.Params("id")
	viewerID := c.Locals("userID").(string)

	// Convert string IDs to ObjectIDs
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var viewerObjectID *primitive.ObjectID
	if viewerID != "" {
		viewerObjID, err := primitive.ObjectIDFromHex(viewerID)
		if err == nil {
			viewerObjectID = &viewerObjID
		}
	}

	profile, err := h.socialService.GetUserProfile(c.Context(), userObjectID, viewerObjectID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(profile)
}
