package models

type Pin struct {
	PinID            string  `json:"pin_id"`
	Name             string  `json:"name"`
	OwnerID          string  `json:"owner_id"`
	Description      string  `json:"description"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	Address          string  `json:"address"`
	Rating           float64 `json:"rating"`
	CreatedAt        string  `json:"created_at"`
	SavedAt          string  `json:"saved_at"`
	AccessLevel      string  `json:"access_level"`
	PlaceID          string  `json:"place_id"`
	PlaceName        string  `json:"place_name"`
	PlaceLatitude    float64 `json:"place_latitude"`
	PlaceLongitude   float64 `json:"place_longitude"`
	PlaceAddress     string  `json:"place_address"`
	PlacePurposeName string  `json:"place_purpose_name"`
	PlaceType        string  `json:"place_type"`
	LikesCount       int     `json:"likes_count"`
	CommentsCount    int     `json:"comments_count"`
	BookmarksCount   int     `json:"bookmarks_count"`
}

type Board struct {
	BoardID        string   `json:"board_id"`
	Name           string   `json:"name"`
	AccessLevel    string   `json:"access_level"`
	OwnerID        string   `json:"owner_id"`
	OwnerType      string   `json:"owner_type"`
	CreatedAt      string   `json:"created_at"`
	SavedAt        string   `json:"saved_at"`
	LikesCount     int      `json:"likes_count"`
	CommentsCount  int      `json:"comments_count"`
	BookmarksCount int      `json:"bookmarks_count"`
	PinIDs         []string `json:"pin_ids"`
	GroupMemberIDs []string `json:"group_member_ids"`
}

type User struct {
	UserID          string  `json:"user_id"`
	Nickname        string  `json:"nickname"`
	NickTag         string  `json:"nick_tag"`
	Email           string  `json:"email"`
	Description     string  `json:"description"`
	UserRating      float64 `json:"user_rating"`
	Status          string  `json:"status"`
	FollowersCount  int     `json:"followers_count"`
	FollowingsCount int     `json:"followings_count"`
}
