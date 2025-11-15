#!/bin/bash

# Скрипт для одновременного запуска backend, admin-panel и partner-panel
# Используйте: bash start_panels_and_backend.sh

set -e

echo "Запуск backend..."
# Запуск backend
(cd Yess-Money---app-master/yess-backend && \
  source ../../venv/Scripts/activate && \
  uvicorn app.main:app --reload --port 8000 &
)

sleep 2

echo "Запуск admin-panel..."
(cd Yess-Money---app-master/admin-panel && npm install && npm run dev &)

sleep 2

echo "Запуск partner-panel..."
(cd Yess-Money---app-master/partner-panel && npm install && npm run dev &)

wait
