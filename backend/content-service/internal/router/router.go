package routers

import (
	"content-service/internal/handler"

	"github.com/gin-gonic/gin"
)

func NewPinRouter(router *gin.Engine,
	pinHandler *handler.PinHandler) {

	pinapi := router.Group("/content")

	pinapi.POST("/pin_create", pinHandler.Create)
}
