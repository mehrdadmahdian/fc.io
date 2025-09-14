package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLogAction string

const (
	AuditActionCardMigration AuditLogAction = "card_migration"
	AuditActionCardCreated   AuditLogAction = "card_created"
	AuditActionCardUpdated   AuditLogAction = "card_updated"
	AuditActionCardDeleted   AuditLogAction = "card_deleted"
	AuditActionCardArchived  AuditLogAction = "card_archived"
)

type AuditLog struct {
	ID         primitive.ObjectID     `bson:"_id,omitempty"`
	UserID     primitive.ObjectID     `bson:"user_id"`
	Action     AuditLogAction         `bson:"action"`
	EntityType string                 `bson:"entity_type"`
	EntityID   primitive.ObjectID     `bson:"entity_id"`
	OldValues  map[string]interface{} `bson:"old_values,omitempty"`
	NewValues  map[string]interface{} `bson:"new_values,omitempty"`
	Metadata   map[string]interface{} `bson:"metadata,omitempty"`
	IPAddress  string                 `bson:"ip_address,omitempty"`
	UserAgent  string                 `bson:"user_agent,omitempty"`
	CreatedAt  time.Time              `bson:"created_at"`
}

func NewAuditLog(
	userID primitive.ObjectID,
	action AuditLogAction,
	entityType string,
	entityID primitive.ObjectID,
) *AuditLog {
	return &AuditLog{
		ID:         primitive.NewObjectID(),
		UserID:     userID,
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		OldValues:  make(map[string]interface{}),
		NewValues:  make(map[string]interface{}),
		Metadata:   make(map[string]interface{}),
		CreatedAt:  time.Now(),
	}
}

func (model *AuditLog) IDString() string {
	return model.ID.Hex()
}

func (model *AuditLog) SetOldValue(key string, value interface{}) {
	if model.OldValues == nil {
		model.OldValues = make(map[string]interface{})
	}
	model.OldValues[key] = value
}

func (model *AuditLog) SetNewValue(key string, value interface{}) {
	if model.NewValues == nil {
		model.NewValues = make(map[string]interface{})
	}
	model.NewValues[key] = value
}

func (model *AuditLog) SetMetadata(key string, value interface{}) {
	if model.Metadata == nil {
		model.Metadata = make(map[string]interface{})
	}
	model.Metadata[key] = value
}
