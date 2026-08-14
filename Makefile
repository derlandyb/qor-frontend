IMAGE := qor-frontend

.DEFAULT_GOAL := help

.PHONY: help image up preview format lint static-analysis unit-tests test ui-e2e-tests build coverage

help:
	@printf '%s\n' 'qor-frontend commands:' \
		'  make up/preview        build the image and serve the static design-system preview' \
		'  make format            (static-preview stage: no-op, no app yet)' \
		'  make lint              (static-preview stage: no-op, no app yet)' \
		'  make static-analysis   (static-preview stage: no-op, no app yet)' \
		'  make unit-tests        (static-preview stage: no-op, no app yet)' \
		'  make test              alias for unit-tests' \
		'  make ui-e2e-tests      (static-preview stage: no-op, no app yet)' \
		'  make build              (static-preview stage: no-op, no app yet)' \
		'  make coverage           (static-preview stage: no-op, no app yet)' \
		'This repo is at the static design-system-preview stage (see design-system/README.md).' \
		'Root-dispatched quality-gate targets are stubbed until the real Vite/React app scaffold lands.'

image:
	docker build -t $(IMAGE) .

up preview: image
	docker run --rm -p 5174:80 $(IMAGE)

format:
	@echo "qor-frontend: static-preview stage, nothing to format yet"

lint:
	@echo "qor-frontend: static-preview stage, nothing to lint yet"

static-analysis:
	@echo "qor-frontend: static-preview stage, no types to check yet"

unit-tests:
	@echo "qor-frontend: static-preview stage, no unit tests yet"

test: unit-tests

ui-e2e-tests:
	@echo "qor-frontend: static-preview stage, no e2e tests yet"

build:
	@echo "qor-frontend: static-preview stage, nothing to build yet"

coverage:
	@echo "qor-frontend: static-preview stage, no coverage to gate yet"
