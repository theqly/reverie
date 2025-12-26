package resolver

import "feed-service/internal/os_client"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	OSClient *os_client.Client
}
