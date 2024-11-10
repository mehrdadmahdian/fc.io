package box_service

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
)

type BoxService struct {
	boxRepository *repositories.BoxRepository
}

func NewBoxService(boxRepository *repositories.BoxRepository) (*BoxService, error) {
	return &BoxService{
		boxRepository: boxRepository,
	}, nil
}

func (boxService *BoxService) SetupBoxForUser(user *models.User) error {
	box := models.NewBox("Box 1", user.ID)
	box.Stages = models.GetListOfBasicStages()
	box.Cards = make([]models.Card, 0)

	_, err := boxService.boxRepository.InsertBox(context.TODO(), box)
	if err != nil {
		return err
	}

	return nil
}
