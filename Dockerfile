FROM nginx:1.27-alpine

# Static-preview stage only — no Vite app yet. This Dockerfile is expected
# to be replaced by the real Vite dev-server image once the React app
# scaffold lands (see .specs/features/event-feed/design.md's Web slice).
COPY design-system /usr/share/nginx/html/design-system
COPY nginx-redirect.html /usr/share/nginx/html/index.html

EXPOSE 80
