package repository

import (
	"sync"
	"time"

	"geo-service/internal/models"
)

type InMemoryCache struct {
	mu    sync.RWMutex
	items map[string]*cacheItem
}

type cacheItem struct {
	value     *models.Location
	expiresAt time.Time
}

func NewInMemoryCache() *InMemoryCache {
	cache := &InMemoryCache{
		items: make(map[string]*cacheItem),
	}

	// горутина для очистки просроченных записей
	go cache.startCleanup()

	return cache
}

func (c *InMemoryCache) Get(key string) (*models.Location, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found || time.Now().After(item.expiresAt) {
		return nil, false
	}

	return item.value, true
}

func (c *InMemoryCache) Set(key string, value *models.Location, ttl int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = &cacheItem{
		value:     value,
		expiresAt: time.Now().Add(time.Duration(ttl) * time.Second),
	}
}

func (c *InMemoryCache) startCleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.cleanup()
	}
}

func (c *InMemoryCache) cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiresAt) {
			delete(c.items, key)
		}
	}
}

// TODO

// type RedisCache struct {
// 	client *redis.Client
// 	ctx    context.Context
// }

// func NewRedisCache(addr, password string, db int) (*RedisCache, error) {
// 	client := redis.NewClient(&redis.Options{
// 		Addr:     addr,
// 		Password: password,
// 		DB:       db,
// 	})

// 	ctx := context.Background()
// 	if err := client.Ping(ctx).Err(); err != nil {
// 		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
// 	}

// 	return &RedisCache{
// 		client: client,
// 		ctx:    ctx,
// 	}, nil
// }

// func (c *RedisCache) Get(key string) (*models.Location, bool) {
// 	data, err := c.client.Get(c.ctx, key).Result()
// 	if err == redis.Nil {
// 		return nil, false
// 	} else if err != nil {
// 		return nil, false
// 	}

// 	var location models.Location
// 	if err := json.Unmarshal([]byte(data), &location); err != nil {
// 		return nil, false
// 	}

// 	return &location, true
// }

// func (c *RedisCache) Set(key string, value *models.Location, ttl int) {
// 	data, err := json.Marshal(value)
// 	if err != nil {
// 		return
// 	}

// 	c.client.Set(c.ctx, key, data, time.Duration(ttl)*time.Second)
// }

func NewCache(cacheType, connectionString string) (models.Cache, error) {
	switch cacheType {
	case "memory":
		return NewInMemoryCache(), nil
	// case "redis":
	// 	return NewRedisCache("localhost:6379", "", 0) // или парсите connectionString
	default:
		return NewInMemoryCache(), nil
	}
}
