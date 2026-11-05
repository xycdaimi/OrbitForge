package middleware

import (
	"errors"
	"strings"
)

var ErrUnauthenticated = errors.New("unauthenticated")

type Authorizer interface {
	Subject(token string) (string, error)
}

func BearerToken(header string) (string, error) {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return "", ErrUnauthenticated
	}
	token := strings.TrimSpace(strings.TrimPrefix(header, prefix))
	if token == "" {
		return "", ErrUnauthenticated
	}
	return token, nil
}

func SubjectFromAuthorization(auth Authorizer, header string) (string, error) {
	if auth == nil {
		return "", ErrUnauthenticated
	}
	token, err := BearerToken(header)
	if err != nil {
		return "", err
	}
	subject, err := auth.Subject(token)
	if err != nil || subject == "" {
		return "", ErrUnauthenticated
	}
	return subject, nil
}
