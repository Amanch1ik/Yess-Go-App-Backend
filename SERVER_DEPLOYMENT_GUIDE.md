# Руководство по развертыванию Yess Loyalty App

## Предварительные требования
- Сервер с Ubuntu 20.04+
- Доступ к серверу через SSH
- Доменное имя

## Шаги установки

### 1. Первоначальная настройка
```bash
# Выполнить скрипт server_setup.sh от root
chmod +x server_setup.sh
sudo ./server_setup.sh
```

### 2. Клонирование репозитория
```bash
# Переключиться на пользователя deployer
sudo su - deployer

# Клонировать репозиторий
git clone https://github.com/your-repo/bonus-app.git /opt/yess-loyalty
cd /opt/yess-loyalty
```

### 3. Настройка окружения
```bash
# Скопировать пример конфигурации
cp yess-backend/env.example yess-backend/.env

# Отредактировать .env с реальными креденшалами
nano yess-backend/.env
```

### 4. Настройка SSL (Let's Encrypt)
```bash
# Получить SSL-сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Конфигурация Nginx
```nginx
# Пример конфигурации в /etc/nginx/sites-available/yess-loyalty
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6. Запуск приложения
```bash
# Собрать и запустить Docker-контейнеры
docker-compose up -d --build
```

## Обслуживание
```bash
# Просмотр логов
docker-compose logs -f

# Обновление приложения
cd /opt/yess-loyalty
git pull
docker-compose up -d --build
```

## Безопасность
- Никогда не храните креденшалы в открытом виде
- Используйте надежные пароли
- Регулярно обновляйте систему и зависимости
