package box_service

import "github.com/mehrdadmahdian/fc.io/internal/database/models"

type BoxInfo struct {
	Box                       *models.Box
	CountOfCardsDueToday      int
	CountOfTotalCards         int
	CountOfCardsNeedingReview int
	SuccessRate               float64
}

type UserStatistics struct {
	TotalBoxes         int     `json:"totalBoxes"`
	TotalCards         int     `json:"totalCards"`
	CardsDueToday      int     `json:"cardsDueToday"`
	CardsNeedingReview int     `json:"cardsNeedingReview"`
	ReviewAccuracy     float64 `json:"reviewAccuracy"`
	Streak             int     `json:"streak"`
}
