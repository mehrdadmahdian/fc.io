package requests

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Name                 string `json:"name" validate:"required"`
	Email                string `json:"email" validate:"required,email"`
	Password             string `json:"password" validate:"required"`
	ConfirmationPassword string `json:"confirmationPassword" validate:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type StoreCardRequest struct {
	Front   string `json:"front" validate:"required"`
	Back    string `json:"back" validate:"required"`
	Extra   string `json:"extra"`
	StageId string `json:"stageId" validate:"required"`
	LabelIds []string `json:"labelIds" validate:"required"`
}
