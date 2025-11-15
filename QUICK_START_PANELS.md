# ⚡ Быстрый старт - Admin и Partner панели

## 🎯 Цель

Подключить Admin Panel и Partner Panel к бэкенду из репозитория [Yess-Go-App-Backend](https://github.com/Amanch1ik/Yess-Go-App-Backend.git).

## ✅ Шаги

### 1. Убедитесь, что бэкенд запущен

Бэкенд должен быть запущен и доступен на `http://localhost:8000`

```bash
# Проверка доступности бэкенда
curl http://localhost:8000/api/v1/health
```

### 2. Создайте .env файлы

**Admin Panel:**
```bash
cd admin-panel
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_ENV=development
EOF
```

**Partner Panel:**
```bash
cd partner-panel
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_ENV=development
EOF
```

**Windows PowerShell:**
```powershell
# Admin Panel
cd admin-panel
@"
VITE_API_URL=http://localhost:8000
VITE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8

# Partner Panel
cd ..\partner-panel
@"
VITE_API_URL=http://localhost:8000
VITE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

### 3. Установите зависимости

**Admin Panel:**
```bash
cd admin-panel
npm install
```

**Partner Panel:**
```bash
cd partner-panel
npm install
```

### 4. Запустите панели

**Admin Panel:**
```bash
cd admin-panel
npm run dev
```
🌐 Откройте: http://localhost:3001

**Partner Panel:**
```bash
cd partner-panel
npm run dev
```
🌐 Откройте: http://localhost:3002

## 🔍 Проверка подключения

1. Откройте панель в браузере
2. Откройте DevTools (F12)
3. Перейдите на вкладку **Network**
4. Попробуйте войти в систему
5. Проверьте, что запросы идут на `http://localhost:8000/api/v1/...`

## 🐛 Решение проблем

### Ошибка: "Network Error" или "CORS Error"

**Решение:**
- Убедитесь, что бэкенд запущен
- Проверьте, что CORS настроен на бэкенде
- Проверьте значение `VITE_API_URL` в `.env` файле

### Ошибка: "401 Unauthorized"

**Решение:**
- Проверьте учетные данные
- Убедитесь, что токен сохраняется в localStorage
- Проверьте DevTools → Application → Local Storage

### Ошибка: "503 Service Unavailable"

**Решение:**
- Проверьте подключение к базе данных на бэкенде
- Убедитесь, что PostgreSQL и Redis запущены

## 📚 Дополнительная информация

- **Полная документация:** [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
- **API Endpoints:** См. раздел "API Endpoints" в BACKEND_INTEGRATION.md
- **Настройка Production:** Обновите `VITE_API_URL` в `.env` файлах

## 🎉 Готово!

Теперь обе панели подключены к бэкенду и готовы к работе!

