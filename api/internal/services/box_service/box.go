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

func (boxService *BoxService) RenderUserBoxes(ctx context.Context, user *models.User) ([]*models.Box, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}
	return boxes, nil
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

func (boxService *BoxService) SubmitReview(
	ctx context.Context,
	cardId string,
	difficulty int,
) error {
	card, err := boxService.cardRepository.FindById(ctx, cardId)
	if err != nil {
		return err
	}

	currentInterval := card.Review.Interval
	if (currentInterval == 0) {
		currentInterval = 1
	}
	currentEaseFactor := card.Review.EaseFactor
	if (currentEaseFactor == 0.0) {
		currentEaseFactor = 2.5
	}

	var NewInterval int
	var NewEaseFactor float64
	var nextReviewDate time.Time
	
	NewInterval, NewEaseFactor = calculateNewIntervalAndEaseFactor(
		currentInterval, 
		currentEaseFactor,
		difficulty,
	)
	
	nextReviewDate = time.Now().Add(time.Duration(NewInterval) * 24 * time.Hour)

	reviewHistoryRecord := &models.ReviewHistoryRecord{
		Date:   time.Now(),
		Action: difficulty,
		OldInterval: currentInterval,
		OldEaseFactor: currentEaseFactor,
		NewInterval: NewInterval,
		NewEaseFactor: NewEaseFactor,
	}

	err = boxService.cardRepository.UpdateCardReview(
		ctx,
		card,
		nextReviewDate,
		NewInterval,
		NewEaseFactor,
		reviewHistoryRecord,
	)
	if err != nil {
		return err
	}

	return nil
}

func calculateNewIntervalAndEaseFactor(currentInterval int, easeFactor float64, difficulty int) (int, float64) {
	multipliers := map[int]float64{
		4: 0.5,
		3: 1.0,
		2: 3.0,
		1: 10.0,
	}

	k := 0.1

	if difficulty < 1 || difficulty > 4 {
		return currentInterval, easeFactor
	}

	multiplier := multipliers[difficulty]
	newInterval := float64(currentInterval) * easeFactor * multiplier

	newEaseFactor := easeFactor + k*float64(difficulty-3)


	if newEaseFactor < 1.3 {
		newEaseFactor = 1.3
	}

	return int(newInterval), newEaseFactor
}