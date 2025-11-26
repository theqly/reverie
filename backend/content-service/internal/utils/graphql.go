package utils

import (
	"context"
	"slices"

	"github.com/99designs/gqlgen/graphql"
)

func DoesItNeedFields(ctx context.Context, neededFields ...string) map[string]bool {
	if graphql.GetFieldContext(ctx) == nil {
		return nil
	}
	requestedFields := graphql.CollectAllFields(ctx)
	needFieldMap := make(map[string]bool, len(neededFields))
	for _, field := range neededFields {
		if slices.Contains(requestedFields, field) {
			needFieldMap[field] = true
		}
	}
	return needFieldMap
}
