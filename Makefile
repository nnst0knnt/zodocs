.DEFAULT_GOAL := help

NPM_CMD := npm

## @description プロジェクトをインストールします
## @usage make install
install:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo ""
	@echo "\033[32m ✅ .envファイルがコピーされました。以下の環境変数を確認して、次に進んでください。 [y/N]\033[0m"
	@echo ""
	@echo "┌─────────────────────────────────────────────┐"
	@echo "│ .env                                        │"
	@echo "│                                             │"
	@echo "│ - \033[1m\033[96mAPP_ENV=local\033[0m                             │"
	@echo "│ - \033[1m\033[96mDATABASE_URL=***\033[0m                          │"
	@echo "│ - \033[1m\033[96mPORT=***\033[0m                                  │"
	@echo "│ - \033[1m\033[96mDB_PORT=***\033[0m                               │"
	@echo "│ - \033[1m\033[96mDB_SCHEMA_WEB_PORT=***\033[0m                    │"
	@echo "│ - \033[1m\033[96mOPENAPI_PORT=***\033[0m                          │"
	@echo "└─────────────────────────────────────────────┘"
	@read response; \
	case "$$response" in \
		[Yy]* ) \
			$(MAKE) up db && \
			$(MAKE) i && \
			$(MAKE) seed && \
			$(MAKE) up && \
			echo ""; \
			echo "\033[32m✅ インストールに成功しました。ローカルサーバーを起動してください。\033[0m"; \
			echo ""; \
			echo "\033[32m▶️ make dev\033[0m"; \
			echo ""; \
			;; \
		* ) \
			echo "\033[31mインストールを中止しました。\033[0m"; \
			echo ""; \
			;; \
	esac

## @description プロジェクトをリセットします
## @usage make reset
reset:
	@make destroy
	@make install

## @description コンテナを起動します
## @usage make up something1 something2
up:
	@containers='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$containers" ]; then \
		docker compose up -d $$containers; \
	else \
		docker compose up -d; \
	fi

## @description コンテナを停止します
## @usage make down something1 something2
down:
	@containers='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$containers" ]; then \
		docker compose down $$containers; \
	else \
		docker compose down; \
	fi

## @description コンテナを再起動します
## @usage make restart something1 something2
restart:
	@containers='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$containers" ]; then \
		$(MAKE) down $$containers; \
		$(MAKE) up $$containers; \
	else \
		$(MAKE) down; \
		$(MAKE) up; \
	fi

## @description コンテナの状態を確認します
## @usage make ps
ps:
	docker compose ps

## @description 全てのコンテナを削除します
## @usage make destroy
destroy:
	docker compose down -v --remove-orphans --rmi all

## @description ローカルサーバーを起動します
## @usage make dev
dev:
	@make up
	$(NPM_CMD) run dev

## @description ビルドを実行します
## @usage make build
build:
	$(NPM_CMD) run build

## @description npm installを実行します
## @usage make i
i:
	$(NPM_CMD) install

## @description dependenciesに指定されたライブラリを追加します
## @usage make package something1 something2
package:
	@libs='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$libs" ]; then \
		$(NPM_CMD) install $$libs; \
	fi

## @description devDependenciesに指定されたライブラリを追加します
## @usage make package-dev something1 something2
package-dev:
	@libs='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$libs" ]; then \
		$(NPM_CMD) install -D $$libs; \
	fi

## @description 指定されたライブラリを削除します
## @usage make remove something1 something2
remove:
	@libs='$(filter-out $@,$(MAKECMDGOALS))'; \
	if [ ! -z "$$libs" ]; then \
		$(NPM_CMD) uninstall $$libs; \
	fi

## @description テーブルをマイグレーションします
## @usage make migrate
migrate:
	$(NPM_CMD) run prisma:migrate

## @description データベースを初期化します
## @usage make seed
seed:
	$(NPM_CMD) run seed

## @description フォーマットします
## @usage make format
format:
	$(NPM_CMD) run format

## @description データベースコンテナに接続します
## @usage make db-sh
db-sh:
	docker compose exec db psql -U postgres -d local

## @description APIドキュメントを生成します
## @usage make docs
docs:
	$(NPM_CMD) run docs
	@make restart openapi

help:
	@printf "\n\033[33m%-30s\033[0m %s\n\n" "コマンド一覧:"
	@awk 'BEGIN { description = ""; usage = ""; } \
		/^## @description/ { description = substr($$0, index($$0, $$3)); } \
		/^## @usage/ { usage = substr($$0, index($$0, $$3)); } \
		/^[a-zA-Z0-9_\-]+:/ { \
			helpCommand = $$1; \
			if (description != "") { \
				printf "  \033[32m%-30s\033[0m %s\n", helpCommand, description; \
				if (usage != "") { \
					printf "  \033[36m%-30s\033[0m %s%s\n\n", "", "▶️ ", usage; \
				} \
			} \
			description = ""; usage = ""; \
		}' $(MAKEFILE_LIST)

%:
	@:
