package card_service

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
)

type CardService struct {
	cardRepository *repositories.CardRepository
}

func NewCardService(cardRepository *repositories.CardRepository) (*CardService, error) {
	return &CardService{
		cardRepository: cardRepository,
	}, nil
}

func (cardService *CardService) GetCard(ctx context.Context, cardID string) (*models.Card, error) {
	return cardService.cardRepository.FindById(ctx, cardID)
}

func (cardService *CardService) ArchiveCard(ctx context.Context, cardID string) error {
	return cardService.cardRepository.SetArchived(ctx, cardID)
}

func (cardService *CardService) UpdateCard(ctx context.Context, card *models.Card) error {
	return cardService.cardRepository.UpdateCard(ctx, card)
}
