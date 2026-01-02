package main

import (
	"net/http"
	"strings"
)

// Exemplo de tokens válidos (em produção, use storage seguro)
var validTokens = map[string]string{
	"TOKEN_DO_SERVIDOR": "pal-01",
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := ""
		auth := r.Header.Get("Authorization")
		if strings.HasPrefix(auth, "Bearer ") {
			token = strings.TrimPrefix(auth, "Bearer ")
		}
		if _, ok := validTokens[token]; !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}
