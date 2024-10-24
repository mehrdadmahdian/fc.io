FROM golang:latest

WORKDIR /var/www

COPY api/go.mod ./
COPY api/go.sum ./

RUN go install github.com/cespare/reflex@latest

ADD api /var/www

RUN go mod download
RUN go mod tidy
RUN go mod verify

COPY docker/api/entrypoint.sh .
RUN chmod +x entrypoint.sh

ARG API_SERVER_PORT
ENV API_SERVER_PORT=${API_SERVER_PORT}
EXPOSE ${API_SERVER_PORT}

CMD ["./entrypoint.sh"]

