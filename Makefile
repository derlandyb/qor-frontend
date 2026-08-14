IMAGE := qor-frontend

.DEFAULT_GOAL := help

.PHONY: help image format lint static-analysis unit-tests test ui-e2e-tests build coverage

help:
	@printf '%s\n' 'qor-frontend commands:' \
		'  make format            apply Prettier formatting' \
		'  make lint              check ESLint + Prettier (no changes)' \
		'  make static-analysis   run tsc --noEmit' \
		'  make unit-tests        run the Vitest suite' \
		'  make test              alias for unit-tests' \
		'  make ui-e2e-tests      run the Playwright suite' \
		'  make build             production build (tsc + vite build)' \
		'  make coverage          run the Vitest suite with coverage (>=80%)' \
		'All targets run inside the project Docker image — nothing is installed on the host.'

image:
	docker build -t $(IMAGE) .

format: image
	docker run --rm $(IMAGE) pnpm format

lint: image
	docker run --rm $(IMAGE) sh -c "pnpm lint && pnpm format:check"

static-analysis: image
	docker run --rm $(IMAGE) pnpm typecheck

unit-tests: image
	docker run --rm $(IMAGE) pnpm test

test: unit-tests

ui-e2e-tests: image
	docker run --rm $(IMAGE) pnpm e2e

build: image
	docker run --rm $(IMAGE) pnpm build

coverage: image
	docker run --rm $(IMAGE) pnpm test:coverage
