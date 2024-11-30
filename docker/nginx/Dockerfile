FROM nginx:latest

COPY ./docker/nginx/conf.d/app.conf.dev.template /etc/nginx/conf.d/app.conf.dev.template
COPY ./docker/nginx/conf.d/app.conf.prod.template /etc/nginx/conf.d/app.conf.prod.template

COPY ./docker/nginx/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]