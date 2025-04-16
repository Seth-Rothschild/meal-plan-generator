ifneq (,$(wildcard .env))
	include .env
	export
endif


dockerbuild:
	docker build -t mealplanner:latest .

PORT ?= 3000
dockerrun:
	docker rm -f mealplanner
	docker run -d \
		--name mealplanner \
		-p $(PORT):3000 \
		-e API_URL=${API_URL} \
		-e API_KEY=${API_KEY} \
		-e MODEL=${MODEL} \
		mealplanner:latest
