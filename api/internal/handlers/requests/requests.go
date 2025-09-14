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

// Card Migration Requests

type MigrateCardRequest struct {
	TargetBoxID      string `json:"target_box_id" validate:"required"`
	PreserveProgress bool   `json:"preserve_progress"`
}

type BulkMigrateCardsRequest struct {
	CardIDs          []string `json:"card_ids" validate:"required,min=1"`
	TargetBoxID      string   `json:"target_box_id" validate:"required"`
	PreserveProgress bool     `json:"preserve_progress"`
}

// Progress Reset Request Structures

type ResetCardProgressRequest struct {
	ResetLevel   string `json:"reset_level" validate:"required,oneof=review reverse_review both"`
	ResetType    string `json:"reset_type" validate:"required,oneof=complete progress_only"`
	CreateBackup bool   `json:"create_backup"`
	Reason       string `json:"reason,omitempty"`
}

type ResetBoxProgressRequest struct {
	ResetLevel   string `json:"reset_level" validate:"required,oneof=review reverse_review both"`
	ResetType    string `json:"reset_type" validate:"required,oneof=complete progress_only"`
	CreateBackup bool   `json:"create_backup"`
	Reason       string `json:"reason,omitempty"`
}

type BulkResetCardsRequest struct {
	CardIDs      []string `json:"card_ids" validate:"required,min=1"`
	ResetLevel   string   `json:"reset_level" validate:"required,oneof=review reverse_review both"`
	ResetType    string   `json:"reset_type" validate:"required,oneof=complete progress_only"`
	CreateBackup bool     `json:"create_backup"`
	Reason       string   `json:"reason,omitempty"`
	Description  string   `json:"description,omitempty"`
}

type RestoreFromBackupRequest struct {
	BackupID string `json:"backup_id" validate:"required"`
}

type CreateBackupRequest struct {
	BackupType  string   `json:"backup_type" validate:"required,oneof=card box bulk"`
	Description string   `json:"description,omitempty"`
	CardIDs     []string `json:"card_ids,omitempty"`
	BoxID       string   `json:"box_id,omitempty"`
}
