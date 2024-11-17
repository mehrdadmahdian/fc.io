package box_service

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
)

type BoxService struct {
	boxRepository  *repositories.BoxRepository
	cardRepository *repositories.CardRepository
}

func NewBoxService(boxRepository *repositories.BoxRepository, cardRepository *repositories.CardRepository) (*BoxService, error) {
	return &BoxService{
		boxRepository:   boxRepository,
		cardRepository:  cardRepository,
		stageRepository: stageRepository,
	}, nil
}

func (boxService *BoxService) SetupBoxForUser(ctx context.Context, user *models.User) error {
	box := models.NewBox("Box 1", user.ID)
	stages, err := models.GetListOfBasicStages(box.IDString())
	if err != nil {
		return err
	}
	box.Cards = make([]models.Card, 0)

	_, err := boxService.boxRepository.InsertBox(context.TODO(), box)
	if err != nil {
		return err
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

func (boxService *BoxService) AddCardToBox(ctx context.Context, box *models.Box, card *models.Card) error {
	return boxService.boxRepository.AddCardToBox(ctx, box.ID, card)
}

func (boxService *BoxService) RenderUserBoxes(ctx context.Context, user *models.User) ([]*models.Box, error) {
	boxes, err := boxService.boxRepository.GetAllBoxesForUser(ctx, user)
	if err != nil {
		return nil, err
	}
	return boxes, nil
}

func (boxService *BoxService) GetBoxCards(ctx context.Context, box *models.Box) (*models.Box, error) {
	box, err := boxService.boxRepository.GetAllCardsOfTheBox(ctx, box)
	if err != nil {
		return nil, err
	}

	return box, nil
}
