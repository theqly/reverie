package utils

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
)

/*
 * Нужна, чтобы получить поля из запроса, которые можно получить только отдельным запросом
 * Например получить доску и все её Пины
 */
func GetPreloads(ctx context.Context) []string {
	if graphql.GetFieldContext(ctx) == nil {
		return nil
	}

	requestedFields := graphql.CollectAllFields(ctx)

	// Можно было конечно сделать не Мапой, а просто приводить к первую букву поля к верхнему регистру
	// Но тогда если в будущем будет бага из-за этого, может быть сложно её найти...
	relationMap := map[string]string{
		"pins":        "Pins",
		"accessLevel": "AccessLevel",
		"ownerType":   "OwnerType",
	}

	var preloads []string
	for _, fieldName := range requestedFields {
		if gormField, ok := relationMap[fieldName]; ok {
			preloads = append(preloads, gormField)
		}
	}

	return preloads
}
