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

		// Create a new BoxInfo and append it
		boxInfos = append(boxInfos, &BoxInfo{
			Box:                  box,
			CountOfCardsDueToday: int(*countOfCardsDueToday),
			CountOfTotalCards:    int(*boxCardsCount),
			CountOfCardsNeedingReview:    int(*CountOfCardsNeedingReview),
			SuccessRate: (float64(*boxCardsCount) - float64(*CountOfCardsNeedingReview)) / float64(*boxCardsCount),
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