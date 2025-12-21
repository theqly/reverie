package os_client

import (
	"bytes"
	"context"
	"encoding/json"
	"log"

	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

type Client struct {
	client *opensearch.Client
}

func NewClient() *Client {
	cfg := opensearch.Config{
		Addresses: []string{"http://opensearch:9200"},
	}
	client, err := opensearch.NewClient(cfg)
	if err != nil {
		log.Fatal(err)
	}
	return &Client{client: client}
}

func (c *Client) Search(ctx context.Context, index string, query map[string]interface{}) ([]json.RawMessage, error) {
	body, err := json.Marshal(query)
	if err != nil {
		return nil, err
	}

	res, err := opensearchapi.SearchRequest{
		Index: []string{index},
		Body:  bytes.NewReader(body),
	}.Do(ctx, c.client)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var result struct {
		Hits struct {
			Hits []struct {
				Source json.RawMessage `json:"_source"`
			} `json:"hits"`
		} `json:"hits"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	var sources []json.RawMessage
	for _, hit := range result.Hits.Hits {
		sources = append(sources, hit.Source)
	}
	return sources, nil
}
