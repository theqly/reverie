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
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch index error: status=%d body=%s", res.StatusCode, readAll(res.Body))
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
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch update error: status=%d body=%s", res.StatusCode, readAll(res.Body))
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
		return err
	}
	defer res.Body.Close()

	if res.StatusCode == 404 {
		return nil
	}

	if res.IsError() {
		return fmt.Errorf("opensearch delete error: status=%d body=%s", res.StatusCode, readAll(res.Body))
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
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("opensearch updateCounter error: status=%d body=%s", res.StatusCode, readAll(res.Body))
	}

	return nil
}
