package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	Processed = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "reverie_processed_total",
			Help: "Number of processed events"},
		[]string{"type"},
	)

	Errors = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "reverie_errors_total",
		Help: "Number of processing errors",
	})
)

func Init() {
	prometheus.MustRegister(Processed, Errors)
}

func Handler() http.Handler {
	return promhttp.Handler()
}
