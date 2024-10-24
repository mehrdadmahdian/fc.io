FROM golang:latest

WORKDIR /var/www

COPY api/go.mod ./
COPY api/go.sum ./

RUN go install github.com/cespare/reflex@latest


RUN go mod download
RUN go mod tidy
RUN go mod verify

COPY ./docker/api/entrypoint.sh /var/www/entrypoint.sh
RUN chmod +x /var/www/entrypoint.sh

ADD api /var/www


ARG API_SERVER_PORT
ENV API_SERVER_PORT=${API_SERVER_PORT}
EXPOSE ${API_SERVER_PORT}

CMD ["./entrypoint.sh"]
