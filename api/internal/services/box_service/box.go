package box_service

import (
	"context"
	"fmt"
	"time"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
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

	var boxInfos []*BoxInfo
	for _, box := range boxes {
		countOfCardsDueToday, err := boxService.cardRepository.GetCountOfRemainingCardsForReview(ctx, box)
		if err != nil {
			return nil, err
		}

		boxCardsCount, err := boxService.cardRepository.GetCountOfAllCardsOfTheBox(ctx, box)
		if err != nil {
			return nil, err
		}

		CountOfCardsNeedingReview, err := boxService.cardRepository.GetCountOfNeedingReviewCount(ctx, box)
		if err != nil {
			return nil, err
		}

		// Calculate success rate, avoiding division by zero
		var successRate float64
		if *boxCardsCount > 0 {
			successRate = (float64(*boxCardsCount) - float64(*CountOfCardsNeedingReview)) / float64(*boxCardsCount)
		} else {
			successRate = 0.0
		}

		// Create a new BoxInfo and append it
		boxInfos = append(boxInfos, &BoxInfo{
			Box:                       box,
			CountOfCardsDueToday:      int(*countOfCardsDueToday),
			CountOfTotalCards:         int(*boxCardsCount),
			CountOfCardsNeedingReview: int(*CountOfCardsNeedingReview),
			SuccessRate:               successRate,
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

func (boxService *BoxService) UpdateBox(ctx context.Context, boxID string, name string, description string) error {
	return boxService.boxRepository.UpdateBox(ctx, boxID, name, description)
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
		Streak:             7, // This would come from user activity tracking
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

	return stats, nil
}
