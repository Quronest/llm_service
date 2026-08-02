.PHONY: dev docker

docker:
	docker compose down
	docker compose up -d

dev: docker
	npm run dev
