package middleware

import (
	"context"
	"errors"
	"github.com/MicahParks/keyfunc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

var jwks *keyfunc.JWKS

func InitJWKS(jwksURL string) error {
	var err error
	jwks, err = keyfunc.Get(jwksURL, keyfunc.Options{})
	return err
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, jwks.Keyfunc)
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		userIDStr, ok := claims["sub"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "sub claim not found"})
			return
		}

		userID, err := uuid.Parse(userIDStr) // put here uuid to parse into uuid, is better?
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user id"})
			return
		}

		ctx := context.WithValue(c.Request.Context(), "userID", userID) // gin context does not provide auto injection into context
		c.Request = c.Request.WithContext(ctx)

		c.Set("userID", userID) // let it be

		c.Next()
	}
}

func GetUserID(ctx context.Context) (uuid.UUID, error) {
	val := ctx.Value("userID")
	id, ok := val.(uuid.UUID)
	if !ok {
		return uuid.Nil, errors.New("no user id in context")
	}
	return id, nil
}
