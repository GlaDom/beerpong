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
