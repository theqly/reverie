FROM golang:1.24.1-alpine AS builder
WORKDIR /app

ARG GITHUB_TOKEN
RUN apk add --no-cache git

RUN git config --global url."https://${GITHUB_TOKEN}@github.com/theqly/reverie".insteadOf "https://github.com/theqly/reverie"

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o lamifare-consumer ./cmd/

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/lamifare-consumer .

EXPOSE 8080

CMD ["./lamifare-consumer"]
