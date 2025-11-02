# 🚀 Инструкция по загрузке в GitHub

## Проблема
Git репозиторий был инициализирован в корне диска C:\, а не в папке проекта.

## Решение

### Вариант 1: Использовать существующий репозиторий (рекомендуется)

Выполните команды в PowerShell **в директории проекта**:

```powershell
# 1. Перейдите в директорию проекта
cd "C:\Users\Asus\OneDrive\Desktop\Yess-Money---app-master"

# 2. Убедитесь, что вы в правильной директории (должен быть README.md)
ls README.md

# 3. Если git еще не инициализирован здесь, инициализируйте:
git init

# 4. Настройте remote репозиторий
git remote add origin https://github.com/Amanch1ik/Yess-Go-App-Backend.git
# Или если remote уже есть:
git remote set-url origin https://github.com/Amanch1ik/Yess-Go-App-Backend.git

# 5. Добавьте все файлы проекта
git add .

# 6. Создайте коммит
git commit -m "🚀 Initial commit: YESS Money - Оптимизированная система лояльности"

# 7. Убедитесь, что ветка называется master
git branch -M master

# 8. Загрузите в GitHub
git push -u origin master
```

### Вариант 2: Если нужно начать с чистого репозитория

```powershell
cd "C:\Users\Asus\OneDrive\Desktop\Yess-Money---app-master"

# Удалите старую инициализацию git (если есть)
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Инициализируйте заново
git init

# Добавьте remote
git remote add origin https://github.com/Amanch1ik/Yess-Go-App-Backend.git

# Добавьте все файлы
git add .

# Коммит
git commit -m "🚀 Initial commit: YESS Money - Оптимизированная система лояльности"

# Push
git push -u origin master
```

### Вариант 3: Если репозиторий на GitHub уже создан и пустой

Если репозиторий уже создан и вы хотите загрузить туда код:

```powershell
cd "C:\Users\Asus\OneDrive\Desktop\Yess-Money---app-master"

# Убедитесь, что нет .git в этой папке
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Инициализируйте git
git init

# Добавьте все файлы
git add .

# Коммит
git commit -m "🚀 Initial commit: YESS Money"

# Добавьте remote
git remote add origin https://github.com/Amanch1ik/Yess-Go-App-Backend.git

# Переименуйте ветку в master
git branch -M master

# Загрузите (force push если нужно заменить все)
git push -u origin master
# ИЛИ если нужно заменить все содержимое:
git push -f origin master
```

---

## После загрузки

Проверьте репозиторий:
- Откройте: https://github.com/Amanch1ik/Yess-Go-App-Backend
- Убедитесь, что README.md отображается правильно
- Проверьте структуру файлов

---

## Возможные ошибки

### Ошибка: "fatal: Unable to create '.git/index.lock'"
```powershell
# Удалите lock файл
Remove-Item ".git/index.lock" -Force -ErrorAction SilentlyContinue
```

### Ошибка: "Authentication failed"
Убедитесь, что:
1. Вы авторизованы в GitHub (через браузер)
2. Используете Personal Access Token или настроили SSH ключи

---

**Важно:** Все команды выполняйте в директории проекта:
`C:\Users\Asus\OneDrive\Desktop\Yess-Money---app-master`

