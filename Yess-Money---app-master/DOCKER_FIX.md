# Проблема с Docker и решение

## Проблема
Ошибка: `500 Internal Server Error for API route and version`

## Возможные решения:

### 1. Перезапустите Docker Desktop
- Закройте Docker Desktop полностью
- Запустите его снова
- Дождитесь полной загрузки (иконка Docker в трее должна быть зелёной)

### 2. Проверьте настройки Docker Desktop
- Откройте Docker Desktop
- Settings → General → убедитесь что "Use the WSL 2 based engine" включен (если у вас WSL)
- Settings → Resources → проверьте, что выделено достаточно ресурсов

### 3. Если проблема сохраняется, попробуйте запустить только PostgreSQL напрямую:

```powershell
# После того как Docker Desktop запустится, выполните:
cd E:\Yess-Go-App-Backend\Yess-Money---app-master

# Запустите только PostgreSQL (без frontend)
docker run -d --name yess-postgres -e POSTGRES_DB=yess_loyalty -e POSTGRES_USER=yess_user -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:13
```

### 4. Проверьте работу контейнера:
```powershell
docker ps
docker logs yess-postgres
```

### 5. Если всё работает, подключитесь через DBViewer:
```
Host: localhost
Port: 5432
Database: yess_loyalty
Username: yess_user
Password: password
```

## Альтернатива: Локальная установка PostgreSQL

Если Docker продолжает вызывать проблемы, можете установить PostgreSQL локально:

1. Скачайте PostgreSQL: https://www.postgresql.org/download/windows/
2. Установите и создайте базу данных:
```sql
CREATE DATABASE yess_loyalty;
CREATE USER yess_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE yess_loyalty TO yess_user;
```

3. Подключитесь через DBViewer с теми же параметрами


