"""
Notification Services: SMS & Push
"""
import logging
from typing import Optional, Dict, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class SMSService:
    """SMS уведомления через Twilio (для КР номеров)"""
    
    def __init__(self):
        self.enabled = settings.SMS_ENABLED
        self.client = None
        self.verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
        
        if self.enabled:
            try:
                from twilio.rest import Client
                self.client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {str(e)}")
                self.enabled = False
    
    async def send_sms(self, phone: str, message: str) -> bool:
        """
        Отправка SMS
        phone: номер в формате +996XXXXXXXXX
        """
        if not self.enabled:
            logger.warning(f"SMS disabled. Would send to {phone}: {message}")
            return False
        
        try:
            # Форматируем номер для КР
            if not phone.startswith('+'):
                phone = f"+996{phone}"
            
            message_instance = self.client.messages.create(
                to=phone,
                from_=settings.TWILIO_PHONE_NUMBER,
                body=message
            )
            
            logger.info(f"SMS sent successfully. SID: {message_instance.sid}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone}: {str(e)}")
            return False
    
    async def send_verification_code(self, phone: str, code: str = None) -> dict:
        """
        Отправка кода верификации через Twilio Verify API
        phone: номер в формате +996XXXXXXXXX
        code: опциональный код (если не указан, используется Twilio Verify API)
        
        Возвращает:
        {
            "success": True/False,
            "sid": "verification_sid",
            "status": "pending"
        }
        """
        # Если используется Twilio Verify API и есть Service SID
        if self.verify_service_sid and code is None:
            return await self._send_verify_api(phone)
        
        # Если Verify Service SID не настроен, но SMS включен
        if not self.verify_service_sid and self.enabled and code is None:
            logger.error("TWILIO_VERIFY_SERVICE_SID not configured. Please set it in .env file")
            return {
                "success": False, 
                "error": "TWILIO_VERIFY_SERVICE_SID не настроен. Установите его в .env файле"
            }
        
        # Fallback: отправка через обычный SMS (для обратной совместимости)
        if code:
            message = f"Ваш код подтверждения YESS: {code}. Не сообщайте его никому!"
            success = await self.send_sms(phone, message)
            return {"success": success, "method": "sms"}
        
        return {"success": False, "error": "Code required for SMS method or TWILIO_VERIFY_SERVICE_SID not configured"}
    
    async def _send_verify_api(self, phone: str) -> dict:
        """Отправка кода через Twilio Verify API"""
        if not self.enabled:
            logger.warning(f"SMS disabled. Would send verification to {phone}")
            return {"success": False, "error": "SMS disabled"}
        
        if not self.verify_service_sid:
            logger.error("TWILIO_VERIFY_SERVICE_SID not configured")
            return {"success": False, "error": "Verify service not configured"}
        
        try:
            # Форматируем номер для КР
            if not phone.startswith('+'):
                phone = f"+996{phone}"
            
            # Используем Twilio Verify API
            verification = self.client.verify.v2.services(
                self.verify_service_sid
            ).verifications.create(
                to=phone,
                channel='sms'
            )
            
            logger.info(f"Verification code sent. SID: {verification.sid}, Status: {verification.status}")
            
            # В DEBUG режиме логируем дополнительную информацию
            if settings.DEBUG:
                logger.warning(
                    f"📱 SMS Verification sent to {phone}\n"
                    f"   SID: {verification.sid}\n"
                    f"   Status: {verification.status}\n"
                    f"   ⚠️  В Trial режиме Twilio отправляет SMS только на верифицированный номер\n"
                    f"   📲 Проверьте SMS на телефоне или Twilio Dashboard"
                )
            
            return {
                "success": True,
                "sid": verification.sid,
                "status": verification.status,
                "method": "verify_api"
            }
            
        except Exception as e:
            logger.error(f"Failed to send verification code to {phone}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def verify_code(self, phone: str, code: str) -> dict:
        """
        Проверка кода верификации через Twilio Verify API
        
        Возвращает:
        {
            "success": True/False,
            "status": "approved"/"pending"/"canceled",
            "valid": True/False
        }
        """
        if not self.enabled or not self.verify_service_sid:
            return {"success": False, "valid": False, "error": "Service not configured"}
        
        try:
            # Форматируем номер
            if not phone.startswith('+'):
                phone = f"+996{phone}"
            
            # Проверяем код через Verify API
            verification_check = self.client.verify.v2.services(
                self.verify_service_sid
            ).verification_checks.create(
                to=phone,
                code=code
            )
            
            is_valid = verification_check.status == "approved"
            
            logger.info(f"Verification check. Status: {verification_check.status}, Valid: {is_valid}")
            
            return {
                "success": True,
                "status": verification_check.status,
                "valid": is_valid
            }
            
        except Exception as e:
            logger.error(f"Failed to verify code for {phone}: {str(e)}")
            return {"success": False, "valid": False, "error": str(e)}
    
    async def send_transaction_notification(
        self, 
        phone: str, 
        amount: float, 
        transaction_type: str
    ) -> bool:
        """Уведомление о транзакции"""
        message = f"YESS: {transaction_type} на сумму {amount} сом успешно выполнена."
        return await self.send_sms(phone, message)
    
    async def send_bonus_notification(self, phone: str, bonus_amount: float) -> bool:
        """Уведомление о начислении бонусов"""
        message = f"YESS: Вам начислено {bonus_amount} YesCoin! Используйте их у партнёров."
        return await self.send_sms(phone, message)


class PushNotificationService:
    """Push уведомления через Firebase Cloud Messaging"""
    
    def __init__(self):
        self.enabled = settings.PUSH_ENABLED
        self.app = None
        
        if self.enabled:
            try:
                import firebase_admin
                from firebase_admin import credentials
                
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                self.app = firebase_admin.initialize_app(cred)
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {str(e)}")
                self.enabled = False
    
    async def send_push(
        self,
        device_tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> int:
        """
        Отправка push уведомления
        Возвращает количество успешно отправленных
        """
        if not self.enabled:
            logger.warning(f"Push disabled. Would send: {title} - {body}")
            return 0
        
        try:
            from firebase_admin import messaging
            
            # Создаем сообщение
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=device_tokens
            )
            
            # Отправляем
            response = messaging.send_multicast(message)
            
            logger.info(
                f"Push sent: {response.success_count} success, "
                f"{response.failure_count} failures"
            )
            
            return response.success_count
        
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            return 0
    
    async def send_transaction_push(
        self,
        device_tokens: List[str],
        amount: float,
        transaction_type: str
    ) -> int:
        """Push уведомление о транзакции"""
        return await self.send_push(
            device_tokens=device_tokens,
            title="Транзакция YESS",
            body=f"{transaction_type} на сумму {amount} сом",
            data={
                "type": "transaction",
                "amount": str(amount),
                "transaction_type": transaction_type
            }
        )
    
    async def send_bonus_push(
        self,
        device_tokens: List[str],
        bonus_amount: float
    ) -> int:
        """Push уведомление о бонусах"""
        return await self.send_push(
            device_tokens=device_tokens,
            title="Бонусы YESS!",
            body=f"Вам начислено {bonus_amount} YesCoin",
            data={
                "type": "bonus",
                "amount": str(bonus_amount)
            }
        )
    
    async def send_promo_push(
        self,
        device_tokens: List[str],
        partner_name: str,
        discount: int
    ) -> int:
        """Push уведомление о промо-акции"""
        return await self.send_push(
            device_tokens=device_tokens,
            title=f"Акция от {partner_name}!",
            body=f"Скидка {discount}% только сегодня!",
            data={
                "type": "promo",
                "partner": partner_name,
                "discount": str(discount)
            }
        )


# Singleton instances
sms_service = SMSService()
push_service = PushNotificationService()

