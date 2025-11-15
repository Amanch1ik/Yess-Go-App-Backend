# Запуск backend, admin-panel и partner-panel в отдельных окнах

$projectRoot = "$PSScriptRoot\Yess-Money---app-master"

# Backend
Start-Process powershell -ArgumentList @"
cd "$projectRoot\yess-backend"
& ..\..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
"@

# Admin Panel
Start-Process powershell -ArgumentList @"
cd "$projectRoot\admin-panel"
npm install
npm run dev
"@

# Partner Panel
Start-Process powershell -ArgumentList @"
cd "$projectRoot\partner-panel"
npm install
npm run dev
"@