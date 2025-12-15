package opensearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/opensearch-project/opensearch-go"
	"github.com/theqly/reverie/backend/lamifare/internal/config"
	"go.uber.org/zap"
)

type Client struct {
	client *opensearch.Client
	log    *zap.Logger
}

func NewClient(log *zap.Logger) (*Client, error) {
	cfg := opensearch.Config{
		Addresses: []string{config.CFG.OpenSearchURL},
	}
	c, err := opensearch.NewClient(cfg)
	if err != nil {
		return nil, err
	}
	return &Client{client: c, log: log}, nil
}

func (c *Client) Upsert(ctx context.Context, index, id string, doc map[string]interface{}) error {
	b, _ := json.Marshal(doc)

	res, err := c.client.Index(index, bytes.NewReader(b), c.client.Index.WithDocumentID(id))
	if err != nil {
		return err
	}

	defer res.Body.Close()

	if res.StatusCode >= 300 {
		body, _ := io.ReadAll(res.Body)
		c.log.Error("openserach index failed", zap.Int("status", res.StatusCode), zap.ByteString("body", body))
		return fmt.Errorf("opensearch index status %d", res.StatusCode)
	}

	return nil
}

func (c *Client) UpdateIfNewer(ctx context.Context, index, id string, payload map[string]interface{}, eventTs string) (bool, error) {
	body := map[string]interface{}{
		"script": map[string]interface{}{
			"source": `if (ctx._source.updated_at == null || params.ev_ts >= ctx._source.updated_at) { ctx._source.putAll(params.payload) } else { ctx.op = "none" }`,
			"params": map[string]interface{}{
				"ev_ts":   eventTs,
				"payload": payload,
			},
		},
		"upsert": payload,
	}

	b, _ := json.Marshal(body)

	res, err := c.client.Update(index, id, bytes.NewReader(b))
	if err != nil {
		return false, err
	}

	defer res.Body.Close()

	if res.StatusCode >= 300 {
		respBody, _ := io.ReadAll(res.Body)
		c.log.Error("opensearch update failed", zap.Int("status", res.StatusCode), zap.ByteString("body", respBody))
		return false, fmt.Errorf("opensearch update status %d", res.StatusCode)
	}

	type updResp struct {
		Result string `json:"result"`
	}

	var r updResp
	_ = json.NewDecoder(res.Body).Decode(&r)

	return r.Result != "noop", nil
}

func (c *Client) Delete(ctx context.Context, index, id string) error {
	res, err := c.client.Delete(index, id)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	if res.StatusCode >= 300 {
		body, _ := io.ReadAll(res.Body)
		c.log.Error("opensearch delete failed", zap.Int("status", res.StatusCode), zap.ByteString("body", body))
		return fmt.Errorf("opensearch delete status %d", res.StatusCode)
	}

	return nil
}
