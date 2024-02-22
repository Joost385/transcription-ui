#!make

env ?= dev
device ?= cpu

.PHONY: validate-args
validate-args:
	@if [ "$(env)" != "dev" ] && [ "$(env)" != "prod" ]; then \
		echo "Error: 'env' should be 'dev' or 'prod'."; \
		exit 1; \
	fi
	@if [ "$(device)" != "cpu" ] && [ "$(device)" != "cuda" ]; then \
		echo "Error: 'device' should be 'cpu' or 'cuda'."; \
		exit 1; \
	fi

define docker_compose
	docker compose -f docker-compose.yaml \
				   -f docker-compose.$(env).yaml \
				   -f docker-compose.$(device).yaml $(1)
endef

.PHONY: up
up: validate-args
	@$(call docker_compose, up -d)

.PHONY: down
down: validate-args
	@$(call docker_compose, down -v)

.PHONY: start
start: validate-args
	@$(call docker_compose, start)

.PHONY: stop
stop: validate-args
	@$(call docker_compose, stop)

.PHONY: restart
restart: validate-args
	@$(call docker_compose, restart)

.PHONY: logs
logs: validate-args
	@$(call docker_compose, logs -f $(container))

.PHONY: remove-build
remove-build:
	@docker volume rm transcription-ui_app-build

.PHONY: mariadb
mariadb: validate-args
	@$(call docker_compose, exec -it mariadb mariadb -u root -p)

.PHONY: admin
admin: validate-args
	@$(call docker_compose, exec -it api python main.py create-admin)

.PHONY: db-create-all
db-create-all: validate-args
	@$(call docker_compose, exec -it api python main.py db-create-all)

.PHONY: db-drop-all
db-drop-all: validate-args
	@$(call docker_compose, exec -it api python main.py db-drop-all)

.PHONY: download-whisper-models
download-whisper-models: validate-args
	@$(call docker_compose, exec -it api python main.py download-whisper-models)

.PHONY: download-nemo-models
download-nemo-models:
	@mkdir -p data/models
	@wget --content-disposition 'https://api.ngc.nvidia.com/v2/models/org/nvidia/team/nemo/diar_msdd_telephonic/1.0.1/files?redirect=true&path=diar_msdd_telephonic.nemo' \
		-O data/models/diar_msdd_telephonic.nemo
	@wget --content-disposition 'https://api.ngc.nvidia.com/v2/models/org/nvidia/team/nemo/vad_multilingual_marblenet/1.10.0/files?redirect=true&path=vad_multilingual_marblenet.nemo' \
		-O data/models/vad_multilingual_marblenet.nemo
	@wget --content-disposition 'https://api.ngc.nvidia.com/v2/models/org/nvidia/team/nemo/titanet_large/v1/files?redirect=true&path=titanet-l.nemo' \
		-O data/models/titanet-l.nemo

.PHONY: backup
backup:
	@if [ -d data ]; then \
	    echo "Starting backup..."; \
	    mkdir -p backup; \
	    TIMESTAMP=`date +"%Y-%m-%d_%H-%M-%S"`; \
	    zip -r "backup/data_$$TIMESTAMP.zip" data -x "data/whisper/*"; \
	    echo "Backup successful."; \
	else \
	    echo "No data found."; \
	fi
