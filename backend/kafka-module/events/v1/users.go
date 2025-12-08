package events

// аватар не отправляем

type UserCreated struct {
	BaseEvent
	UserID      string  `json:"user_id"`
	Nickname    string  `json:"nickname"`
	NickTag     string  `json:"nick_tag"`
	Email       string  `json:"email,omitempty"`
	Description string  `json:"description,omitempty"`
	UserRating  float64 `json:"user_rating"`
	Status      string  `json:"status"` // "active" или "deleted"
}

type UserUpdated struct {
	BaseEvent
	UserID         string  `json:"user_id"`
	Nickname       string  `json:"nickname,omitempty"`
	NickTag        string  `json:"nick_tag,omitempty"`
	ProfilePicture string  `json:"profile_picture,omitempty"`
	Description    string  `json:"description,omitempty"`
	UserRating     float64 `json:"user_rating,omitempty"`
	Status         string  `json:"status,omitempty"`
}

// в опенсерч надо поставить статус deleted
type UserDeleted struct {
	BaseEvent
	UserID string `json:"user_id"`
}

type FollowCreated struct {
	BaseEvent
	UserID     string `json:"user_id"`     // на кого подписались
	FollowerID string `json:"follower_id"` // кто подписался
}

type FollowDeleted struct {
	BaseEvent
	UserID     string `json:"user_id"`     // от кого отписались
	FollowerID string `json:"follower_id"` // кто отписался
}
