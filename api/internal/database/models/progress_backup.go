package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ProgressBackup represents a backup of learning progress before reset operations
type ProgressBackup struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	BackupType  string             `bson:"backup_type"` // "card", "box", "bulk"
	Description string             `bson:"description"`
	CreatedAt   time.Time          `bson:"created_at"`
	ExpiresAt   *time.Time         `bson:"expires_at,omitempty"` // Auto-cleanup after X days

	// Backup data
	CardBackups []CardProgressBackup `bson:"card_backups"`

	// Metadata
	TotalCards     int                 `bson:"total_cards"`
	BoxID          *primitive.ObjectID `bson:"box_id,omitempty"`          // If box-level backup
	BackupReason   string              `bson:"backup_reason"`             // "manual", "pre_reset", "scheduled"
	CompressedData *string             `bson:"compressed_data,omitempty"` // For large backups

	// Restore information
	IsRestored bool                `bson:"is_restored"`
	RestoredAt *time.Time          `bson:"restored_at,omitempty"`
	RestoredBy *primitive.ObjectID `bson:"restored_by,omitempty"`
}

// CardProgressBackup represents the progress data for a single card
type CardProgressBackup struct {
	CardID primitive.ObjectID `bson:"card_id"`
	BoxID  primitive.ObjectID `bson:"box_id"`

	// Card content at time of backup
	Front string `bson:"front"`
	Back  string `bson:"back"`
	Extra string `bson:"extra"`

	// Progress data
	Review        Review `bson:"review"`
	ReverseReview Review `bson:"reverse_review"`

	// Timestamps
	BackupDate        time.Time `bson:"backup_date"`
	OriginalCreatedAt time.Time `bson:"original_created_at"`
	OriginalUpdatedAt time.Time `bson:"original_updated_at"`
}

// ProgressResetLog represents an audit log for reset operations
type ProgressResetLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	ActionType string             `bson:"action_type"` // "card_reset", "box_reset", "bulk_reset", "restore"
	Timestamp  time.Time          `bson:"timestamp"`

	// Reset details
	ResetType  string `bson:"reset_type"`  // "complete", "partial", "progress_only"
	ResetLevel string `bson:"reset_level"` // "review", "reverse_review", "both"

	// Target information
	CardIDs    []primitive.ObjectID `bson:"card_ids,omitempty"`
	BoxID      *primitive.ObjectID  `bson:"box_id,omitempty"`
	TotalCards int                  `bson:"total_cards"`

	// Backup reference
	BackupID *primitive.ObjectID `bson:"backup_id,omitempty"`

	// User context
	IPAddress string `bson:"ip_address"`
	UserAgent string `bson:"user_agent"`

	// Additional metadata
	Reason   string                 `bson:"reason,omitempty"`
	Metadata map[string]interface{} `bson:"metadata,omitempty"`
}

// ScheduledReset represents a scheduled reset operation
type ScheduledReset struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`

	// Schedule configuration
	CronExpression string     `bson:"cron_expression"`
	NextRunTime    time.Time  `bson:"next_run_time"`
	LastRunTime    *time.Time `bson:"last_run_time,omitempty"`

	// Reset configuration
	ResetType   string              `bson:"reset_type"`  // "complete", "partial", "progress_only"
	ResetLevel  string              `bson:"reset_level"` // "review", "reverse_review", "both"
	TargetBoxID *primitive.ObjectID `bson:"target_box_id,omitempty"`

	// Filters for bulk resets
	Filters ScheduledResetFilters `bson:"filters,omitempty"`

	// Settings
	CreateBackup bool `bson:"create_backup"`
	IsActive     bool `bson:"is_active"`

	// Timestamps
	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}

// ScheduledResetFilters defines filters for scheduled resets
type ScheduledResetFilters struct {
	// Performance filters
	MinSuccessRate  *float64 `bson:"min_success_rate,omitempty"`
	MaxSuccessRate  *float64 `bson:"max_success_rate,omitempty"`
	MinReviewsCount *int     `bson:"min_reviews_count,omitempty"`
	MaxReviewsCount *int     `bson:"max_reviews_count,omitempty"`

	// Date filters
	CreatedAfter     *time.Time `bson:"created_after,omitempty"`
	CreatedBefore    *time.Time `bson:"created_before,omitempty"`
	LastReviewAfter  *time.Time `bson:"last_review_after,omitempty"`
	LastReviewBefore *time.Time `bson:"last_review_before,omitempty"`

	// Content filters
	LabelIDs        []primitive.ObjectID `bson:"label_ids,omitempty"`
	ExcludeLabelIDs []primitive.ObjectID `bson:"exclude_label_ids,omitempty"`

	// Progress filters
	IntervalMin   *int     `bson:"interval_min,omitempty"`
	IntervalMax   *int     `bson:"interval_max,omitempty"`
	EaseFactorMin *float64 `bson:"ease_factor_min,omitempty"`
	EaseFactorMax *float64 `bson:"ease_factor_max,omitempty"`
}

// NewProgressBackup creates a new progress backup
func NewProgressBackup(userID primitive.ObjectID, backupType string, description string, reason string) *ProgressBackup {
	now := time.Now()
	expiresAt := now.AddDate(0, 0, 90) // 90 days retention by default

	return &ProgressBackup{
		ID:           primitive.NewObjectID(),
		UserID:       userID,
		BackupType:   backupType,
		Description:  description,
		CreatedAt:    now,
		ExpiresAt:    &expiresAt,
		CardBackups:  []CardProgressBackup{},
		TotalCards:   0,
		BackupReason: reason,
		IsRestored:   false,
	}
}

// NewProgressResetLog creates a new reset log entry
func NewProgressResetLog(userID primitive.ObjectID, actionType string, resetType string, resetLevel string) *ProgressResetLog {
	return &ProgressResetLog{
		ID:         primitive.NewObjectID(),
		UserID:     userID,
		ActionType: actionType,
		Timestamp:  time.Now(),
		ResetType:  resetType,
		ResetLevel: resetLevel,
		CardIDs:    []primitive.ObjectID{},
		TotalCards: 0,
		Metadata:   make(map[string]interface{}),
	}
}

// NewScheduledReset creates a new scheduled reset
func NewScheduledReset(userID primitive.ObjectID, name string, cronExpression string) *ScheduledReset {
	now := time.Now()

	return &ScheduledReset{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		Name:           name,
		CronExpression: cronExpression,
		NextRunTime:    now, // Will be calculated based on cron
		ResetType:      "complete",
		ResetLevel:     "both",
		CreateBackup:   true,
		IsActive:       true,
		CreatedAt:      now,
		UpdatedAt:      now,
		Filters:        ScheduledResetFilters{},
	}
}

// Helper methods for ProgressBackup
func (pb *ProgressBackup) IDString() string {
	return pb.ID.Hex()
}

func (pb *ProgressBackup) AddCardBackup(card *Card) {
	cardBackup := CardProgressBackup{
		CardID:            card.ID,
		BoxID:             card.BoxID,
		Front:             card.Front,
		Back:              card.Back,
		Extra:             card.Extra,
		Review:            card.Review,
		ReverseReview:     card.ReverseReview,
		BackupDate:        time.Now(),
		OriginalCreatedAt: card.CreatedAt,
		OriginalUpdatedAt: card.UpdatedAt,
	}

	pb.CardBackups = append(pb.CardBackups, cardBackup)
	pb.TotalCards = len(pb.CardBackups)
}

// Helper methods for ProgressResetLog
func (prl *ProgressResetLog) IDString() string {
	return prl.ID.Hex()
}

func (prl *ProgressResetLog) AddCardID(cardID primitive.ObjectID) {
	prl.CardIDs = append(prl.CardIDs, cardID)
	prl.TotalCards = len(prl.CardIDs)
}

// Helper methods for ScheduledReset
func (sr *ScheduledReset) IDString() string {
	return sr.ID.Hex()
}
