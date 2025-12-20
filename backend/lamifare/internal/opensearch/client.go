package opensearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/opensearch-project/opensearch-go"
	"github.com/opensearch-project/opensearch-go/opensearchapi"
	"github.com/theqly/reverie/backend/lamifare/internal/config"
	"go.uber.org/zap"
)

type Client struct {
	client *opensearch.Client
	log    *zap.Logger
}

func New(log *zap.Logger) (*Client, error) {
	cfg := opensearch.Config{
		Addresses: []string{config.CFG.OpenSearchURL},
	}
	c, err := opensearch.NewClient(cfg)
	if err != nil {
		return nil, err
	}
	return &Client{client: c, log: log}, nil
}

func readAll(r io.ReadCloser) string {
	if r == nil {
		return ""
	}
	defer r.Close()
	b, _ := io.ReadAll(r)
	return string(b)
}

func (c *Client) Upsert(ctx context.Context, index, id string, doc interface{}) error {
	b, err := json.Marshal(doc)
	if err != nil {
		c.log.Error("marshal failed in Upsert", zap.String("index", index), zap.Error(err))
		return err
	}

	req := opensearchapi.IndexRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader(b),
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		c.log.Error("request.Do failed in Upsert", zap.String("index", index), zap.Error(err))
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch Upsert error: status=%d body=%s", res.StatusCode, readAll(res.Body))
	}

	return nil
}

func (c *Client) Update(ctx context.Context, index, id string, partial map[string]interface{}) error {
	body := map[string]interface{}{
		"doc":           partial,
		"doc_as_upsert": true,
	}

	b, err := json.Marshal(body)
	if err != nil {
		c.log.Error("marshal failed in Update", zap.String("index", index), zap.Error(err))
		return err
	}

	req := opensearchapi.UpdateRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader(b),
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		c.log.Error("request.Do failed in Update", zap.String("index", index), zap.Error(err))
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch Update error: status=%d body=%s", res.StatusCode, readAll(res.Body))
	}

	return nil
}

func (c *Client) Delete(ctx context.Context, index, id string) error {
	req := opensearchapi.DeleteRequest{
		Index:      index,
		DocumentID: id,
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		c.log.Error("request.Do failed in Delete", zap.String("index", index), zap.Error(err))
		return err
	}
	defer res.Body.Close()

	if res.StatusCode == 404 {
		return nil
	}

	if res.IsError() {
		return fmt.Errorf("opensearch Delete error: status=%d body=%s", res.StatusCode, readAll(res.Body))
	}

	return nil
}

func (c *Client) UpdateCounter(ctx context.Context, index, id, field string, delta int) error {
	script := fmt.Sprintf("if (ctx._source.%s == null) { ctx._source.%s = params.delta } else { ctx._source.%s += params.delta }", field, field, field)
	body := map[string]interface{}{
		"script": map[string]interface{}{
			"source": script,
			"lang":   "painless",
			"params": map[string]interface{}{"delta": delta},
		},
		"upsert": map[string]interface{}{field: delta},
	}

	b, err := json.Marshal(body)
	if err != nil {
		c.log.Error("marshal failed in UpdateCounter", zap.String("index", index), zap.Error(err))
		return err
	}

	req := opensearchapi.UpdateRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader(b),
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, c.client)
	if err != nil {
		c.log.Error("request.Do failed in UpdateCounter", zap.String("index", index), zap.Error(err))
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch UpdateCounter error: status=%d body=%s", res.StatusCode, readAll(res.Body))
	}

	return nil
}
