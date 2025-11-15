# Workflow Frontend-разработчика

## 🚀 Полный цикл разработки

### 1. Первоначальная настройка

```bash
# Клонирование репозитория
git clone https://github.com/your-username/yess-loyalty.git
cd yess-loyalty

# Создание фронтенд директории
mkdir -p frontend
cd frontend

# Инициализация проекта
npx create-react-app . --template typescript
npm install axios react-router-dom @reduxjs/toolkit
```

### 2. Ежедневный workflow

#### 2.1 Синхронизация с основной веткой
```bash
# Переключение на master и обновление
git checkout master
git pull origin master

# Создание новой feature-ветки
git checkout -b feature/название-фичи
```

#### 2.2 Разработка и коммиты
```bash
# Работа над feature
npm start  # Запуск локального сервера

# Периодические коммиты
git add .
git commit -m "feat: описание изменений"
```

#### 2.3 Регулярные push
```bash
# Push в удаленный репозиторий
git push -u origin feature/название-фичи
```

### 3. Правила коммитов

#### Типы коммитов:
- `feat:` - новая функциональность
- `fix:` - исправление ошибок
- `docs:` - изменения в документации
- `style:` - правки по стилю
- `refactor:` - рефакторинг кода
- `test:` - добавление/изменение тестов
- `chore:` - служебные изменения

#### Пример хорошего коммита:
```bash
git commit -m "feat(partners): add filtering and search functionality

- Implement partner search input
- Add category filtering
- Create PartnerFilter component
- Resolve #123 (номер задачи)
```

### 4. Pull Request (PR)

#### Чек-лист перед созданием PR:
- [ ] Код прошел линтинг
- [ ] Написаны/обновлены тесты
- [ ] Проверена работа всех функций
- [ ] Задокументированы изменения

```bash
# Перед созданием PR
npm run lint
npm test
```

#### Создание PR
1. Push всех изменений
2. Перейти на GitHub
3. Создать Pull Request
4. Заполнить описание:
   - Что было сделано
   - Скриншоты (если применимо)
   - Связанные задачи

### 5. Взаимодействие с Backend

#### Базовый axios-сервис
```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors для обработки токенов
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

### 6. Безопасность и Best Practices

- Никогда не коммитить `.env` с реальными ключами
- Использовать `.env.example`
- Хранить токены в `localStorage`/`sessionStorage`
- Всегда обрабатывать ошибки API
- Использовать TypeScript для типизации

### 7. Деплой и CI/CD

```bash
# Сборка проекта
npm run build

# Деплой (пример)
npm run deploy:staging  # На тестовый сервер
npm run deploy:prod     # На продакшен
```

### 8. Частые команды

```bash
# Установка зависимостей
npm install

# Запуск разработческого сервера
npm start

# Линтинг
npm run lint

# Тесты
npm test

# Сборка
npm run build
```

## 🆘 Поддержка

- Telegram: @frontend_support
- Email: frontend@yessloyalty.com

**Успехов в разработке!** 🚀
