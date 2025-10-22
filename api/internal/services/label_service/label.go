package label_service

import (
	"context"

	"github.com/mehrdadmahdian/fc.io/internal/database/models"
	"github.com/mehrdadmahdian/fc.io/internal/database/repositories"
)

type LabelService struct {
	labelRepository *repositories.LabelRepository
}

func NewLabelService(labelRepository *repositories.LabelRepository) (*LabelService, error) {
	return &LabelService{
		labelRepository: labelRepository,
	}, nil
}

func (labelService *LabelService) CreateLabel(ctx context.Context, label *models.Label) error {
	return labelService.labelRepository.CreateLabel(ctx, label)
}

func (labelService *LabelService) GetBoxLabels(ctx context.Context, boxID string) ([]*models.Label, error) {
	return labelService.labelRepository.GetBoxLabels(ctx, boxID)
}

func (labelService *LabelService) GetLabel(ctx context.Context, labelID string) (*models.Label, error) {
	return labelService.labelRepository.GetLabel(ctx, labelID)
}

func (labelService *LabelService) UpdateLabel(ctx context.Context, labelID string, name string, color string) error {
	return labelService.labelRepository.UpdateLabel(ctx, labelID, name, color)
}

func (labelService *LabelService) DeleteLabel(ctx context.Context, labelID string) error {
	return labelService.labelRepository.DeleteLabel(ctx, labelID)
}
