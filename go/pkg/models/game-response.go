package models

type GameResponse struct {
	Game    Game    `json:"game"`
	Groups  []Group `json:"groups"`
	Matches []Match `json:"matches"`
}
