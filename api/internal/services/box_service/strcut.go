package box_service

import "github.com/mehrdadmahdian/fc.io/internal/database/models"

type BoxInfo struct {
	Box *models.Box
	CountOfCardsDueToday int
	CountOfTotalCards int
	SuccessRate float64
}