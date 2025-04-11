package routers

import (
	"content-service/internal/handler"

	"github.com/gin-gonic/gin"
)

func NewPinRouter(router *gin.Engine,
	pinHandler *handler.PinHandler) {

	bookingapi := router.Group("/content")

	bookingapi.GET("/pin_create", pinHandler.Create)
}
