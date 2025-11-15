# 🛠 Руководство разработчика Yess! Loyalty

## 🚀 Начало работы

### Prerequisites
- Python 3.9+
- .NET 7 SDK
- Docker
- Kubernetes (опционально)

### Клонирование репозитория
```bash
git clone https://github.com/your-org/yess-loyalty.git
cd yess-loyalty
```

## 🔧 Локальная разработка

### Backend (Python)
```bash
cd yess-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest
```

### Frontend (.NET MAUI)
```bash
cd YessLoyaltyApp
dotnet restore
dotnet build
dotnet test
```

## 🐳 Docker Development

### Сборка backend
```bash
docker build -t yess-backend:dev yess-backend
docker-compose -f docker-compose.dev.yml up
```

## 🧪 Тестирование

### Backend
- Unittest: `pytest`
- Coverage: `pytest --cov=app`
- Линтинг: `flake8`, `black`, `mypy`

### Frontend
- Unit Tests: `dotnet test`
- Линтинг: `dotnet format`

## 🚢 Деплой

### Staging
```bash
kubectl apply -f k8s/staging/
```

### Production
```bash
kubectl apply -f k8s/production/
```

## 📦 Зависимости

### Обновление backend
```bash
pip-compile requirements.in
pip-sync
```

### Обновление frontend
```bash
dotnet restore
dotnet update package
```

## 🔒 Безопасность

- Всегда используйте `.env.example`
- Никогда не коммитьте креденшалы
- Используйте vault для секретов

## 📝 Соглашения

- PEP 8 для Python
- C# Code Conventions
- Conventional Commits
- Pull Request Template

---

**© 2025 Yess! Loyalty - Технологии с душой** 🇰🇬
