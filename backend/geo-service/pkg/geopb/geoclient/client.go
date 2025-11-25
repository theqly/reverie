package geoclient

import (
	"context"

	"github.com/theqly/reverie/backend/geo-service/pkg/geopb"
	"google.golang.org/grpc"
)

type Client struct {
	conn   *grpc.ClientConn
	client geopb.GeoServiceClient
}

func New(serverAddr string) (*Client, error) {
	conn, err := grpc.Dial(serverAddr, grpc.WithInsecure()) // В продакшене используй WithTransportCredentials
	if err != nil {
		return nil, err
	}

	return &Client{
		conn:   conn,
		client: geopb.NewGeoServiceClient(conn),
	}, nil
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func (c *Client) Geocode(ctx context.Context, address string) (*GeocodeResult, error) {
	resp, err := c.client.Geocode(ctx, &geopb.GeocodeRequest{
		Address: address,
	})
	if err != nil {
		return nil, err
	}

	return &GeocodeResult{
		Lat:         resp.Lat,
		Lon:         resp.Lon,
		DisplayName: resp.DisplayName,
		Address: Address{
			Country:     resp.Address.Country,
			City:        resp.Address.City,
			Street:      resp.Address.Street,
			HouseNumber: resp.Address.HouseNumber,
			Postcode:    resp.Address.Postcode,
		},
	}, nil
}

func (c *Client) ReverseGeocode(ctx context.Context, lat float64, lon float64) (*ReverseGeocodeResult, error) {
	resp, err := c.client.ReverseGeocode(ctx, &geopb.ReverseGeocodeRequest{
		Lat: lat,
		Lon: lon,
	})
	if err != nil {
		return nil, err
	}

	return &ReverseGeocodeResult{
		Lat:         resp.Lat,
		Lon:         resp.Lon,
		DisplayName: resp.DisplayName,
		Address: Address{
			Country:     resp.Address.Country,
			City:        resp.Address.City,
			Street:      resp.Address.Street,
			HouseNumber: resp.Address.HouseNumber,
			Postcode:    resp.Address.Postcode,
		},
	}, nil
}

func (c *Client) BulkGeocode(ctx context.Context, addresses []string) ([]*GeocodeResult, error) {
	// TODO
	resp, err := c.client.BulkGeocode(ctx, &geopb.BulkGeocodeRequest{
		Addresses: addresses,
	})
	if err != nil {
		return nil, err
	}

	var results []*GeocodeResult
	for _, r := range resp.Results {
		results = append(results, &GeocodeResult{
			Lat:         r.Lat,
			Lon:         r.Lon,
			DisplayName: r.DisplayName,
			Address: Address{
				Country:     r.Address.Country,
				City:        r.Address.City,
				Street:      r.Address.Street,
				HouseNumber: r.Address.HouseNumber,
				Postcode:    r.Address.Postcode,
			},
		})
	}

	return results, nil
}
