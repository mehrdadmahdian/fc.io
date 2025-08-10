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
	Front    string   `json:"front" validate:"required"`
	Back     string   `json:"back" validate:"required"`
	Extra    string   `json:"extra"`
	LabelIds []string `json:"labelIds" validate:"required"`
}

type SubmitReviewRequest struct {
	CardId string `json:"cardId" validate:"required"`
	Action int    `json:"action" validate:"required"`
}

type RespondToReviewRequest struct {
	CardId     string `json:"cardId" validate:"required"`
	Difficulty string `json:"difficulty" validate:"required"`
}

type CreateCardRequest struct {
	Front string `json:"front" validate:"required"`
	Back  string `json:"back" validate:"required"`
	Extra string `json:"extra"`
	// LabelIds []string `json:"labelIds" validate:"required"`
}

type EditCardRequest struct {
	Front string `json:"front" validate:"required"`
	Back  string `json:"back" validate:"required"`
	Extra string `json:"extra"`
	// LabelIds []string `json:"labelIds" validate:"required"`
}

type CreateBoxRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
}

type UpdateBoxRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}
