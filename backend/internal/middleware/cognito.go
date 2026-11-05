package middleware

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CognitoAuthorizer struct {
	issuer   string
	clientID string
	jwksURL  string
	client   *http.Client
	mu       sync.Mutex
	keys     map[string]*rsa.PublicKey
}

func NewCognitoAuthorizer(region, poolID, clientID string) *CognitoAuthorizer {
	issuer := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", region, poolID)
	return &CognitoAuthorizer{
		issuer:   issuer,
		clientID: clientID,
		jwksURL:  issuer + "/.well-known/jwks.json",
		client:   &http.Client{Timeout: 5 * time.Second},
		keys:     map[string]*rsa.PublicKey{},
	}
}

func (c *CognitoAuthorizer) Subject(token string) (string, error) {
	parsed, err := jwt.Parse(token, c.keyFunc, jwt.WithValidMethods([]string{"RS256"}))
	if err != nil || !parsed.Valid {
		return "", ErrUnauthenticated
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrUnauthenticated
	}
	if claims["iss"] != c.issuer || claims["token_use"] != "id" {
		return "", ErrUnauthenticated
	}
	aud, _ := claims["aud"].(string)
	if aud != c.clientID {
		return "", ErrUnauthenticated
	}
	sub, _ := claims["sub"].(string)
	if sub == "" {
		return "", ErrUnauthenticated
	}
	return sub, nil
}

func (c *CognitoAuthorizer) keyFunc(token *jwt.Token) (any, error) {
	kid, _ := token.Header["kid"].(string)
	if kid == "" {
		return nil, ErrUnauthenticated
	}
	if key := c.cached(kid); key != nil {
		return key, nil
	}
	if err := c.refresh(); err != nil {
		return nil, err
	}
	if key := c.cached(kid); key != nil {
		return key, nil
	}
	return nil, ErrUnauthenticated
}

func (c *CognitoAuthorizer) cached(kid string) *rsa.PublicKey {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.keys[kid]
}

type jwksDoc struct {
	Keys []struct {
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
		Kty string `json:"kty"`
	} `json:"keys"`
}

func (c *CognitoAuthorizer) refresh() error {
	resp, err := c.client.Get(c.jwksURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	var doc jwksDoc
	if err := json.NewDecoder(resp.Body).Decode(&doc); err != nil {
		return err
	}
	next := map[string]*rsa.PublicKey{}
	for _, key := range doc.Keys {
		if key.Kty != "RSA" || key.Kid == "" {
			continue
		}
		pub, err := rsaPublicKey(key.N, key.E)
		if err != nil {
			continue
		}
		next[key.Kid] = pub
	}
	c.mu.Lock()
	c.keys = next
	c.mu.Unlock()
	return nil
}

func rsaPublicKey(nB64, eB64 string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nB64)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eB64)
	if err != nil {
		return nil, err
	}
	n := new(big.Int).SetBytes(nBytes)
	e := new(big.Int).SetBytes(eBytes)
	return &rsa.PublicKey{N: n, E: int(e.Int64())}, nil
}
