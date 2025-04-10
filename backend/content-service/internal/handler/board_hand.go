package handler

import (
	"content-service/internal/dto"
	"content-service/internal/mapper"
	"content-service/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BoardHandler struct {
	service *service.BoardService
}

func NewBoardHandler(service *service.BoardService) *BoardHandler {
	return &BoardHandler{service: service}
}

func (h *BoardHandler) Create(c *gin.Context) {
	var req dto.BoardRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	board := mapper.ToBoardModel(req)

	if err := h.service.CreateBoard(c.Request.Context(), board); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToBoardResponse(board))
}
