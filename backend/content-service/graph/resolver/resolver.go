package resolver

import "content-service/internal/repository"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	BoardRepo    *repository.BoardRepository
	PinRepo      *repository.PinRepository
	ReactionRepo *repository.ReactionRepository
}
