# Environment Configuration Guide

## Overview

This document contains all the environment variables needed for the YESS Loyalty Backend to run properly. Copy the configuration below into your `.env` file and update the values as needed.

## Fixed Issues

The following configuration fields were **missing** and have been **added to `app/core/config.py`**:

### Critical Missing Fields (Previously Causing Crashes)
- `SMS_ENABLED` - Enable/disable SMS notifications
- `PUSH_ENABLED` - Enable/disable push notifications
- `TWILIO_PHONE_NUMBER` - Twilio sender phone number
- `FIREBASE_CREDENTIALS_PATH` - Path to Firebase credentials JSON
- `JWT_SECRET_KEY` - JWT secret key (duplicate of SECRET_KEY for compatibility)
- `JWT_ALGORITHM` - JWT algorithm
- `DEBUG` - Debug mode flag
- `REFRESH_TOKEN_EXPIRE_MINUTES` - Refresh token expiration in minutes
- `REDIS_CACHE_TTL` - Default Redis cache TTL
- `CORS_ORIGINS` - List of allowed CORS origins
- `ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring middleware
- `HOST` - Application host
- `PORT` - Application port
- `BASE_URL` - Backend base URL
- `FRONTEND_URL` - Frontend base URL

### Storage & File Upload Fields
- `UPLOAD_DIR` - Upload directory path
- `USE_S3` - Enable AWS S3 storage
- `MAX_UPLOAD_SIZE` - Maximum file upload size
- `ALLOWED_IMAGE_EXTENSIONS` - Allowed image file extensions
- `STATIC_URL` - Static files URL prefix
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name

### Map Services
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `MAPBOX_API_KEY` - Mapbox API key

### Business Rules
- `TOPUP_MULTIPLIER` - Bonus multiplier for top-ups

---

## Complete .env Configuration Template

Create or update your `.env` file in the `yess-backend` directory with the following content:

```bash
# ============================================
# YESS LOYALTY BACKEND - CONFIGURATION
# ============================================
# Copy this configuration to .env and fill in your values
# DO NOT commit .env to version control!

# ============================================
# APPLICATION SETTINGS
# ============================================
PROJECT_NAME=Yess Loyalty
DEBUG=False
HOST=0.0.0.0
PORT=8000
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_HOST=postgres
POSTGRES_USER=yess_user
POSTGRES_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD
POSTGRES_DB=yess_db

# ============================================
# SECURITY & AUTHENTICATION
# ============================================
# IMPORTANT: Generate strong random keys in production!
# Example: openssl rand -hex 32
SECRET_KEY=CHANGE_ME_TO_SECURE_RANDOM_KEY
JWT_SECRET_KEY=CHANGE_ME_TO_ANOTHER_SECURE_RANDOM_KEY
ALGORITHM=HS256
JWT_ALGORITHM=HS256

# Token expiration times
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_ENABLED=True
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# ============================================
# MIDDLEWARE & MONITORING
# ============================================
ENABLE_PERFORMANCE_MONITORING=False

# ============================================
# FILE UPLOADS & STORAGE
# ============================================
UPLOAD_DIRECTORY=/app/uploads
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
MAX_UPLOAD_SIZE=10485760
STATIC_URL=/static

# ============================================
# AWS S3 STORAGE (Optional)
# ============================================
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# ============================================
# REDIS CACHE
# ============================================
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_TTL=3600

# ============================================
# SMS NOTIFICATIONS (Twilio)
# ============================================
SMS_ENABLED=False
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
TWILIO_PHONE_NUMBER=

# ============================================
# PUSH NOTIFICATIONS (Firebase)
# ============================================
PUSH_ENABLED=False
FCM_SERVER_KEY=
FIREBASE_CREDENTIALS_PATH=

# ============================================
# EMAIL NOTIFICATIONS (SendGrid)
# ============================================
SENDGRID_API_KEY=
FROM_EMAIL=noreply@yess-loyalty.com

# ============================================
# MAP SERVICES
# ============================================
GOOGLE_MAPS_API_KEY=
MAPBOX_API_KEY=

# ============================================
# BUSINESS RULES
# ============================================
TOPUP_MULTIPLIER=1.0

# ============================================
# BANK INTEGRATIONS - Kyrgyzstan
# ============================================

# Optimal Bank
OPTIMAL_BANK_API_URL=https://api.optimalbank.kg
OPTIMAL_BANK_MERCHANT_ID=
OPTIMAL_BANK_SECRET_KEY=

# Demir Bank
DEMIR_BANK_API_URL=https://api.demirbank.kg
DEMIR_BANK_MERCHANT_ID=
DEMIR_BANK_SECRET_KEY=

# RSK Bank
RSK_BANK_API_URL=https://api.rskbank.kg
RSK_BANK_MERCHANT_ID=
RSK_BANK_SECRET_KEY=

# Bakai Bank
BAKAI_BANK_API_URL=https://api.bakaibank.kg
BAKAI_BANK_MERCHANT_ID=
BAKAI_BANK_SECRET_KEY=

# Elcart Payment System
ELCART_API_URL=https://api.elcart.kg
ELCART_MERCHANT_ID=
ELCART_SECRET_KEY=
```

---

## Minimal Configuration for Local Development

If you just want to get the application running locally without external services, use this minimal configuration:

```bash
# Basic settings
PROJECT_NAME=Yess Loyalty
DEBUG=True
HOST=0.0.0.0
PORT=8000
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database (adjust if running locally)
POSTGRES_HOST=localhost
POSTGRES_USER=yess_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=yess_db

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Disable external services for local dev
SMS_ENABLED=False
PUSH_ENABLED=False
USE_S3=False
ENABLE_PERFORMANCE_MONITORING=False

# Redis (adjust if running locally)
REDIS_URL=redis://localhost:6379/0
```

---

## Quick Start Steps

1. **Copy the configuration** above into a new file named `.env` in the `yess-backend` directory

2. **Generate secure keys** for production:
   ```bash
   # On Linux/Mac
   openssl rand -hex 32
   
   # On Windows with Python
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. **Update database credentials** to match your PostgreSQL setup

4. **Enable services** as needed:
   - Set `SMS_ENABLED=True` and add Twilio credentials to enable SMS
   - Set `PUSH_ENABLED=True` and add Firebase credentials to enable push notifications
   - Set `USE_S3=True` and add AWS credentials to enable S3 storage

5. **Restart the backend**:
   ```bash
   docker compose up --build -d
   ```

6. **Verify the backend** is running:
   - Check health: http://localhost:8000/
   - Access Swagger UI: http://localhost:8000/docs

---

## What Was Changed

### File: `app/core/config.py`

**Added 30+ missing configuration fields** organized into categories:
- Application settings (DEBUG, HOST, PORT, BASE_URL, FRONTEND_URL)
- Database settings (DATABASE_URL alternative)
- JWT settings (JWT_SECRET_KEY, JWT_ALGORITHM, REFRESH_TOKEN_EXPIRE_MINUTES)
- CORS settings (CORS_ORIGINS)
- Monitoring settings (ENABLE_PERFORMANCE_MONITORING)
- Storage settings (USE_S3, AWS credentials, UPLOAD_DIR, STATIC_URL)
- Cache settings (REDIS_CACHE_TTL)
- SMS settings (SMS_ENABLED, TWILIO_PHONE_NUMBER)
- Push notification settings (PUSH_ENABLED, FIREBASE_CREDENTIALS_PATH)
- Map service settings (GOOGLE_MAPS_API_KEY, MAPBOX_API_KEY)
- Business rules (TOPUP_MULTIPLIER)

**All existing logic was preserved** - only new fields were added with sensible defaults.

---

## Troubleshooting

### Issue: `AttributeError: 'Settings' object has no attribute 'XXX'`

**Solution:** This means a configuration field is missing. Check if it's in the updated `config.py`. If not, please report it.

### Issue: Backend won't start

**Solution:** 
1. Check that your `.env` file exists in the `yess-backend` directory
2. Verify PostgreSQL and Redis are running
3. Check logs: `docker compose logs yess-backend`

### Issue: SMS/Push notifications not working

**Solution:** 
- Ensure `SMS_ENABLED=True` or `PUSH_ENABLED=True` in `.env`
- Verify your Twilio/Firebase credentials are correct
- Check logs for specific error messages

---

## Additional Notes

- **Default values** are set in `config.py` so the application will start even without a `.env` file
- **Sensitive values** (like API keys) default to empty strings and must be filled for those features to work
- **Docker environment**: If running in Docker, ensure your `.env` file is in the correct directory
- **Environment variable precedence**: Values in `.env` override defaults in `config.py`

---

## Summary

✅ **All missing configuration fields have been added to `app/core/config.py`**  
✅ **Backend should now start without `AttributeError` crashes**  
✅ **Swagger UI should be accessible at http://localhost:8000/docs**  
✅ **All existing functionality has been preserved**  

Simply copy the configuration above to your `.env` file and adjust as needed for your environment.

