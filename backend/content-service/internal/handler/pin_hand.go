package handler

import (
	"content-service/internal/dto"
	"content-service/internal/mapper"
	"content-service/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PinHandler struct {
	service *service.PinService
}

func NewPinHandler(service *service.PinService) *PinHandler {
	return &PinHandler{service: service}
}

func (h *PinHandler) Create(c *gin.Context) {
	var req dto.PinRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pin := mapper.ToPinModel(req)

	if err := h.service.CreatePin(c.Request.Context(), pin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToPinResponse(pin))
}
