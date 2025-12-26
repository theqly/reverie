package processor

import (
	"context"
	"time"

	events "github.com/theqly/reverie/backend/kafka-module/events/v1"
)

func (p *Processor) handleUserCreated(ctx context.Context, e *events.UserCreated) error {
	p.log.Info("handling user created event")

	doc := map[string]interface{}{
		"user_id":     e.UserID,
		"nickname":    e.Nickname,
		"nick_tag":    e.NickTag,
		"user_rating": e.UserRating,
		"status":      e.Status,
		"created_at":  e.OccurredAt.Format(time.RFC3339),
		"updated_at":  e.OccurredAt.Format(time.RFC3339),
	}

	return p.osClient.Upsert(ctx, p.usersIndex, e.UserID, doc)
}

func (p *Processor) handleUserUpdated(ctx context.Context, e *events.UserUpdated) error {
	p.log.Info("handling user updated event")

	if e.UserID == "" {
		p.log.Error("user.updated missing user_id")
		return errMalformed
	}

	payload := map[string]interface{}{}
	if e.Nickname != "" {
		payload["nickname"] = e.Nickname
	}
	if e.ProfilePicture != "" {
		payload["profile_picture"] = e.ProfilePicture
	}
	if e.Description != "" {
		payload["description"] = e.Description
	}
	if e.UserRating != 0 {
		payload["user_rating"] = e.UserRating
	}
	if e.Status != "" {
		payload["status"] = e.Status
	}
	payload["updated_at"] = e.OccurredAt.Format(time.RFC3339)

	return p.osClient.Update(ctx, p.usersIndex, e.UserID, payload)
}

func (p *Processor) handleUserDeleted(ctx context.Context, e *events.UserDeleted) error {
	p.log.Info("handling user deleted event")

	if e.UserID == "" {
		p.log.Error("user.deleted missing user_id")
		return errMalformed
	}

	payload := map[string]interface{}{
		"status":     "deleted",
		"updated_at": e.OccurredAt.Format(time.RFC3339),
	}

	return p.osClient.Update(ctx, p.usersIndex, e.UserID, payload)
}

func (p *Processor) handleFollowCreated(ctx context.Context, e *events.FollowCreated) error {
	p.log.Info("handling follow created event")

	if e.UserID == "" {
		p.log.Error("follow.created missing user_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.usersIndex, e.UserID, "followers_count", 1)
}

func (p *Processor) handleFollowDeleted(ctx context.Context, e *events.FollowDeleted) error {
	p.log.Info("handling follow deleted event")

	if e.UserID == "" {
		p.log.Error("follow.deleted missing user_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.usersIndex, e.UserID, "followers_count", -1)
}

func (p *Processor) handleBoardCreated(ctx context.Context, e *events.BoardCreated) error {
	p.log.Info("handling board created event")

	if e.BoardID == "" {
		p.log.Error("board.created missing board_id")
		return errMalformed
	}

	doc := map[string]interface{}{
		"board_id":   e.BoardID,
		"name":       e.Name,
		"owner_id":   e.OwnerID,
		"access":     e.AccessLevel,
		"created_at": e.CreatedAt.Format(time.RFC3339),
		"updated_at": e.OccurredAt.Format(time.RFC3339),
	}
	if len(e.PinIDs) > 0 {
		doc["pin_ids"] = e.PinIDs
		doc["pins_count"] = len(e.PinIDs)
	}

	return p.osClient.Upsert(ctx, p.boardsIndex, e.BoardID, doc)
}

func (p *Processor) handleBoardUpdated(ctx context.Context, e *events.BoardUpdated) error {
	p.log.Info("handling board updated event")

	if e.BoardID == "" {
		p.log.Error("board.updated missing board_id")
		return errMalformed
	}

	payload := map[string]interface{}{}
	if e.Name != "" {
		payload["name"] = e.Name
	}
	if e.AccessLevel != "" {
		payload["access"] = e.AccessLevel
	}
	payload["updated_at"] = time.Now().UTC().Format(time.RFC3339)

	return p.osClient.Update(ctx, p.boardsIndex, e.BoardID, payload)
}

func (p *Processor) handleBoardPinsAdded(ctx context.Context, e *events.BoardPinsAdded) error {
	p.log.Info("handling board pins added event")

	if e.BoardID == "" {
		p.log.Error("board.pins.added missing board_id")
		return errMalformed
	}
	if len(e.PinIDs) == 0 {
		p.log.Error("board.pins.added missing pin_ids")
		return errMalformed
	}

	payload := map[string]interface{}{
		"pin_ids":    e.PinIDs,
		"pins_count": len(e.PinIDs),
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	}
	return p.osClient.Update(ctx, p.boardsIndex, e.BoardID, payload)
}

func (p *Processor) handleBoardPinsDeleted(ctx context.Context, e *events.BoardPinsDeleted) error {
	p.log.Info("handling board pins deleted event")

	if e.BoardID == "" {
		p.log.Error("board.pins.deleted missing board_id")
		return errMalformed
	}
	if len(e.PinIDs) == 0 {
		p.log.Error("board.pins.deleted missing pin_ids")
		return errMalformed
	}

	payload := map[string]interface{}{
		"pin_ids":    e.PinIDs,
		"pins_count": len(e.PinIDs),
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	}
	return p.osClient.Update(ctx, p.boardsIndex, e.BoardID, payload)
}

func (p *Processor) handleBoardCommented(ctx context.Context, e *events.BoardCommented) error {
	p.log.Info("handling board commented event")

	if e.BoardID == "" {
		p.log.Error("board.commented missing board_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.boardsIndex, e.BoardID, "comments_count", 1)
}

func (p *Processor) handleBoardCommentDeleted(ctx context.Context, e *events.BoardCommentDeleted) error {
	p.log.Info("handling board comment deleted event")
	return nil //TODO p.osClient.UpdateCounter(ctx, p.boardsIndex, e.boardID, "comments_count", -1)
}

func (p *Processor) handleBoardReactionAdded(ctx context.Context, e *events.BoardReactionAdded) error {
	p.log.Info("handling board reaction added event")

	if e.BoardID == "" {
		p.log.Error("board.reaction.added missing board_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.boardsIndex, e.BoardID, "reactions_count", 1)
}

func (p *Processor) handleBoardReactionDeleted(ctx context.Context, e *events.BoardReactionDeleted) error {
	p.log.Info("handling board reaction deleted event")

	if e.BoardID == "" {
		p.log.Error("board.reaction.deleted missing board_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.boardsIndex, e.BoardID, "reactions_count", -1)
}

func (p *Processor) handleBoardBookmarkAdded(ctx context.Context, e *events.BoardBookmarkAdded) error {
	p.log.Info("handling board bookmark added event")

	if e.BoardID == "" {
		p.log.Error("board.bookmark.added missing board_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.boardsIndex, e.BoardID, "bookmarks_count", 1)
}

func (p *Processor) handleBoardBookmarkDeleted(ctx context.Context, e *events.BoardBookmarkDeleted) error {
	p.log.Info("handling board bookmark deleted event")

	if e.BoardID == "" {
		p.log.Error("board.bookmark.deleted missing board_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.boardsIndex, e.BoardID, "bookmarks_count", -1)
}

func (p *Processor) handleBoardMembersAdded(ctx context.Context, e *events.BoardGroupMembersAdded) error {
	p.log.Info("handling board members added event")

	if e.BoardID == "" {
		p.log.Error("board.members.added missing board_id")
		return errMalformed
	}
	if len(e.GroupMemberIDs) == 0 {
		p.log.Error("board.members.added missing group_member_ids")
		return errMalformed
	}

	payload := map[string]interface{}{
		"member_ids":    e.GroupMemberIDs,
		"members_count": len(e.GroupMemberIDs),
		"updated_at":    time.Now().UTC().Format(time.RFC3339),
	}
	return p.osClient.Update(ctx, p.boardsIndex, e.BoardID, payload)
}

func (p *Processor) handleBoardMembersDeleted(ctx context.Context, e *events.BoardGroupMembersDeleted) error {
	p.log.Info("handling board members deleted event")

	if e.BoardID == "" {
		p.log.Error("board.members.deleted missing board_id")
		return errMalformed
	}
	if len(e.GroupMemberIDs) == 0 {
		p.log.Error("board.members.deleted missing group_member_ids")
		return errMalformed
	}

	payload := map[string]interface{}{
		"member_ids":    e.GroupMemberIDs,
		"members_count": len(e.GroupMemberIDs),
		"updated_at":    time.Now().UTC().Format(time.RFC3339),
	}
	return p.osClient.Update(ctx, p.boardsIndex, e.BoardID, payload)
}

func (p *Processor) handleBoardDeleted(ctx context.Context, e *events.BoardDeleted) error {
	p.log.Info("handling board deleted event")

	if e.BoardID == "" {
		p.log.Error("board.deleted missing board_id")
		return errMalformed
	}

	return p.osClient.Delete(ctx, p.boardsIndex, e.BoardID)
}

func (p *Processor) handlePinCreated(ctx context.Context, e *events.PinCreated) error {
	p.log.Info("handling pin created event")

	if e.PinID == "" {
		p.log.Error("pin.created missing pin_id")
		return errMalformed
	}

	doc := map[string]interface{}{
		"pin_id":      e.PinID,
		"name":        e.Name,
		"description": e.Description,
		"owner_id":    e.OwnerID,
		"rating":      e.Rating,
		"place_id":    e.PlaceID,
		"created_at":  e.CreatedAt.Format(time.RFC3339),
		"updated_at":  e.OccurredAt.Format(time.RFC3339),
	}
	if e.Latitude != 0 || e.Longitude != 0 {
		doc["location"] = map[string]float64{"lat": e.Latitude, "lon": e.Longitude}
	}

	return p.osClient.Upsert(ctx, p.pinsIndex, e.PinID, doc)
}

func (p *Processor) handlePinUpdated(ctx context.Context, e *events.PinUpdated) error {
	p.log.Info("handling pin updated event")

	if e.PinID == "" {
		p.log.Error("pin.updated missing pin_id")
		return errMalformed
	}

	payload := map[string]interface{}{}
	if e.Name != "" {
		payload["name"] = e.Name
	}
	if e.Description != "" {
		payload["description"] = e.Description
	}
	if e.Latitude != 0 || e.Longitude != 0 {
		payload["location"] = map[string]float64{"lat": e.Latitude, "lon": e.Longitude}
	}
	payload["updated_at"] = e.OccurredAt.Format(time.RFC3339)

	return p.osClient.Update(ctx, p.pinsIndex, e.PinID, payload)
}

func (p *Processor) handlePinDeleted(ctx context.Context, e *events.PinDeleted) error {
	p.log.Info("handling pin deleted event")

	if e.PinID == "" {
		p.log.Error("pin.deleted missing pin_id")
		return errMalformed
	}

	return p.osClient.Delete(ctx, p.pinsIndex, e.PinID)
}

func (p *Processor) handlePinCommented(ctx context.Context, e *events.PinCommented) error {
	p.log.Info("handling pin commented event")

	if e.PinID == "" {
		p.log.Error("pin.commented missing pin_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.pinsIndex, e.PinID, "comments_count", 1)
}

func (p *Processor) handlePinCommentDeleted(ctx context.Context, e *events.PinCommentDeleted) error {
	p.log.Info("handling pin comment deleted event")
	return nil // TODO p.osClient.UpdateCounter(ctx, p.pinsIndex, e.pinID, "comments_count", -1)
}

func (p *Processor) handlePinReactionAdded(ctx context.Context, e *events.PinReactionAdded) error {
	p.log.Info("handling pin reaction added event")

	if e.PinID == "" {
		p.log.Error("pin.reaction.added missing pin_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.pinsIndex, e.PinID, "reactions_count", 1)
}

func (p *Processor) handlePinReactionDeleted(ctx context.Context, e *events.PinReactionDeleted) error {
	p.log.Info("handling pin reaction deleted event")

	if e.PinID == "" {
		p.log.Error("pin.reaction.deleted missing pin_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.pinsIndex, e.PinID, "reactions_count", -1)
}

func (p *Processor) handlePinBookmarkAdded(ctx context.Context, e *events.PinBookmarkAdded) error {
	p.log.Info("handling pin bookmark added event")

	if e.PinID == "" {
		p.log.Error("pin.bookmark.added missing pin_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.pinsIndex, e.PinID, "bookmarks_count", 1)
}

func (p *Processor) handlePinBookmarkDeleted(ctx context.Context, e *events.PinBookmarkDeleted) error {
	p.log.Info("handling pin bookmark deleted event")

	if e.PinID == "" {
		p.log.Error("pin.bookmark.deleted missing pin_id")
		return errMalformed
	}

	return p.osClient.UpdateCounter(ctx, p.pinsIndex, e.PinID, "bookmarks_count", -1)
}
