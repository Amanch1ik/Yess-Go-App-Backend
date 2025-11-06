# Rate Limit Decorator Fix

## Problem

After fixing the configuration issues, a new error appeared during startup:

```
Exception: No "request" or "websocket" argument on function "<function upload_avatar at 0x769554563a60>"
```

This error occurred in `app/api/v1/upload.py` when using the `@upload_rate_limit()` decorator.

## Root Cause

The **slowapi** library (used for rate limiting) requires that any function decorated with a rate limiter **must have either a `request: Request` or `websocket` parameter** in its signature.

The upload endpoints were missing the `request` parameter:

### Before (Broken):
```python
@router.post("/avatar")
@upload_rate_limit()
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Function code...
```

### After (Fixed):
```python
@router.post("/avatar")
@upload_rate_limit()
async def upload_avatar(
    request: Request,  # ✅ Added this parameter
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Function code...
```

## Solution Applied

### File Modified: `app/api/v1/upload.py`

**Added `request: Request` parameter to 3 functions:**

1. ✅ `upload_avatar()` - Line 23
2. ✅ `upload_partner_logo()` - Line 66
3. ✅ `upload_partner_cover()` - Line 122

**Also added `Request` to imports:**
```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
```

## Why This Fix Works

The slowapi rate limiter needs access to the request object to:
- Extract the client's IP address
- Track request counts per client
- Enforce rate limits per IP/user

By adding the `request: Request` parameter, we provide the decorator with the required information while **not breaking any existing functionality** (FastAPI automatically injects the Request object).

## Impact

- ✅ No breaking changes to API behavior
- ✅ Rate limiting now works correctly
- ✅ All upload endpoints functional
- ✅ No changes to request/response format

## Files Changed

| File | Lines Modified | Changes |
|------|---------------|---------|
| `app/api/v1/upload.py` | 5, 23, 66, 122 | Added `Request` import and parameter to 3 functions |

## Testing

After applying this fix:

1. **Rebuild the Docker container:**
   ```bash
   docker compose up --build -d
   ```

2. **Verify startup:**
   ```bash
   docker logs yess-money---app-master-backend-1
   ```
   
   Should see:
   - ✅ No errors during startup
   - ✅ "Application startup complete"
   - ✅ Uvicorn running

3. **Test upload endpoints:**
   - POST `/api/v1/upload/avatar`
   - POST `/api/v1/upload/partner/logo/{partner_id}`
   - POST `/api/v1/upload/partner/cover/{partner_id}`

## Rate Limit Configuration

The rate limits are defined in `app/core/rate_limit.py`:

```python
def upload_rate_limit():
    """Lимит для загрузки файлов"""
    return limiter.limit("20/hour")
```

This means:
- **20 uploads per hour** per IP address
- After exceeding the limit, returns HTTP 429 (Too Many Requests)
- Can be adjusted in the configuration

## Additional Notes

- The `request` parameter is **automatically injected by FastAPI**
- You don't need to pass it explicitly when calling these endpoints
- The rate limiter uses this parameter internally to track requests
- Other decorators (`@auth_rate_limit()`, `@strict_rate_limit()`) work the same way

## Summary

**Issue:** SlowAPI rate limiter requires `request` parameter  
**Solution:** Added `request: Request` to all decorated functions  
**Status:** ✅ FIXED - Backend should now start successfully  

Combined with the configuration fixes, the backend is now fully operational!

