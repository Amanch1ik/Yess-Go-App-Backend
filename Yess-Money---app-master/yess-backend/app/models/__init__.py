"""Database models"""
from app.models.user import User
from app.models.role import Role, UserRole
from app.models.wallet import Wallet
from app.models.city import City
from app.models.partner import Partner, PartnerLocation, PartnerEmployee
from app.models.transaction import Transaction
from app.models.order import Order
# from app.models.agent import Agent, Referral, AgentPartnerBonus
from app.models.payment import PaymentMethod, Refund, PaymentAnalytics
from app.models.notification import Notification, NotificationTemplate, NotificationSettings, NotificationLog
from app.models.achievement import Achievement, UserAchievement, UserLevel, LevelReward, UserLevelReward, AchievementProgress
# from app.models.review import PartnerReview, ReviewPhoto, ReviewLike, ReviewReport, ReviewModeration
from app.models.promotion import Promotion as PromotionModel, PromoCode, UserPromoCode, PromotionUsage, PromoCodeGeneration
from app.models.banner import Banner

__all__ = [
    "User",
    "Role",
    "UserRole",
    "Wallet",
    "City",
    "Partner",
    "PartnerLocation",
    "PartnerEmployee",
    "Promotion",
    "Transaction",
    "Order",
    # "Agent",
    # "Referral",
    # "AgentPartnerBonus",
    "PaymentMethod",
    "Refund",
    "PaymentAnalytics",
    "Notification",
    "NotificationTemplate",
    "NotificationSettings",
    "NotificationLog",
    "Achievement",
    "UserAchievement",
    "UserLevel",
    "LevelReward",
    "UserLevelReward",
    "AchievementProgress",
    # "PartnerReview",
    # "ReviewPhoto",
    # "ReviewLike",
    # "ReviewReport",
    # "ReviewModeration",
    "PromotionModel",
    "PromoCode",
    "UserPromoCode",
    "PromotionUsage",
    "PromoCodeGeneration",
    "Banner"
]

