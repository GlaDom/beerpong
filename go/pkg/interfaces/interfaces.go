package interfaces

type NewGame struct {
	Game  Game   `json:"game"`
	Teams []Team `json:"teams" gorm:"foreignKey:game_id"`
}

type GameResponse struct {
	Game    Game    `json:"game"`
	Teams   []Team  `json:"teams" gorm:"foreignKey:game_id"`
	Matches []Match `json:"matches" gorm:"foreignKey:game_id"`
}

type MatchUpdateRequest struct {
	Matches []Match `json:"matches"`
}

type TeamUpdateRequest struct {
	Teams []Team `json:"teams"`
}
