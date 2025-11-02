from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
from typing import Dict

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.ip_attempts: Dict[str, Dict] = {}
        self.max_attempts = 5
        self.block_duration = 3600  # 1 час блокировки

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host

        # Проверка блокировки IP
        if self._is_ip_blocked(client_ip):
            raise HTTPException(status_code=403, detail="IP temporarily blocked")

        # Отслеживание попыток доступа
        self._track_ip_attempt(client_ip)

        response = await call_next(request)
        return response

    def _is_ip_blocked(self, ip: str) -> bool:
        if ip not in self.ip_attempts:
            return False
        
        attempt_data = self.ip_attempts[ip]
        return (
            attempt_data['attempts'] >= self.max_attempts and
            time.time() - attempt_data['first_attempt'] < self.block_duration
        )

    def _track_ip_attempt(self, ip: str):
        current_time = time.time()
        
        if ip not in self.ip_attempts:
            self.ip_attempts[ip] = {
                'attempts': 1,
                'first_attempt': current_time
            }
        else:
            attempt_data = self.ip_attempts[ip]
            
            # Сброс счетчика, если время блокировки истекло
            if current_time - attempt_data['first_attempt'] > self.block_duration:
                attempt_data['attempts'] = 1
                attempt_data['first_attempt'] = current_time
            else:
                attempt_data['attempts'] += 1

    def clear_old_attempts(self):
        """Очистка старых попыток входа"""
        current_time = time.time()
        self.ip_attempts = {
            ip: data for ip, data in self.ip_attempts.items()
            if current_time - data['first_attempt'] < self.block_duration
        }
