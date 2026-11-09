FROM nginx:1.27-alpine

ARG GIT_COMMIT=local
ARG BUILD_TIME=local

WORKDIR /usr/share/nginx/html

COPY index.html app.js style.css ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN printf '%s\n' \
    '// Generated during Docker build. Do not edit manually.' \
    "window.APP_VERSION = { commit: \"${GIT_COMMIT}\", builtAt: \"${BUILD_TIME}\" };" \
    > /usr/share/nginx/html/version.js

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
