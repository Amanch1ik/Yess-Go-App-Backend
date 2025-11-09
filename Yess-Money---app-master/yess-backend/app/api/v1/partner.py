"""
Partner endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.core.database import get_db
from app.models.partner import Partner, PartnerLocation
from app.models.category import Category
from app.schemas.partner import PartnerResponse, PartnerDetail, PartnerLocationResponse
from typing import List, Optional

router = APIRouter()


@router.get("/list", response_model=List[PartnerResponse])
async def get_partners(
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    active: bool = True,
    db: Session = Depends(get_db)
):
    """Get list of partners"""
    query = db.query(Partner).options(joinedload(Partner.categories))
    
    if active:
        query = query.filter(Partner.is_active == True)
    
    # Фильтр по категории (для обратной совместимости - по slug или name)
    if category:
        query = query.join(Partner.categories).filter(Category.slug == category)
    
    # Фильтр по ID категории
    if category_id:
        query = query.join(Partner.categories).filter(Category.id == category_id)
    
    partners = query.all()
    
    # Преобразуем в PartnerResponse с категориями
    from app.schemas.category import CategoryResponse
    
    result = []
    for partner in partners:
        active_categories = [cat for cat in partner.categories if cat.is_active]
        result.append(PartnerResponse(
            id=partner.id,
            name=partner.name,
            logo_url=partner.logo_url,
            default_cashback_rate=float(partner.default_cashback_rate or 5.0),
            categories=[CategoryResponse.model_validate(cat) for cat in active_categories],
            category=active_categories[0].name if active_categories else None
        ))
    
    return result


@router.get("/{partner_id}", response_model=PartnerDetail, response_model_exclude_none=False)
async def get_partner(partner_id: int, db: Session = Depends(get_db)):
    """Get partner details"""
    partner = db.query(Partner).options(joinedload(Partner.categories)).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Преобразуем в PartnerDetail
    from app.schemas.category import CategoryResponse
    
    # Создаём PartnerDetail с явным указанием всех полей
    partner_detail = PartnerDetail(
        id=partner.id,
        name=partner.name,
        logo_url=partner.logo_url,
        description=partner.description if partner.description else None,  # Явно передаём None, если пусто
        website=partner.website,
        phone=partner.phone,
        email=partner.email,
        address=partner.locations[0].address if partner.locations else None,
        latitude=float(partner.latitude) if partner.latitude else None,
        longitude=float(partner.longitude) if partner.longitude else None,
        default_cashback_rate=float(partner.default_cashback_rate or 5.0),
        cashback_rate=float(partner.cashback_rate) if partner.cashback_rate else None,
        max_discount_percent=float(partner.max_discount_percent) if partner.max_discount_percent else None,
        categories=[CategoryResponse.model_validate(cat) for cat in partner.categories if cat.is_active],
        is_verified=partner.is_verified,
        cover_image_url=partner.cover_image_url,
        social_media=partner.social_media,
        current_promotions=None  # TODO: добавить загрузку актуальных промо
    )
    
    # Логируем для отладки
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Partner {partner.id} description from DB: '{partner.description}'")
    logger.info(f"PartnerDetail description: '{partner_detail.description}'")
    
    # Используем model_dump для явного контроля сериализации
    # Это гарантирует, что description будет включён в ответ, даже если он None
    return partner_detail


@router.get("/locations", response_model=List[PartnerLocationResponse])
async def get_partner_locations(
    partner_id: Optional[int] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius: float = Query(10.0),
    db: Session = Depends(get_db)
):
    """Get partner locations for map"""
    query = db.query(PartnerLocation).join(Partner).filter(PartnerLocation.is_active == True)
    
    if partner_id:
        query = query.filter(PartnerLocation.partner_id == partner_id)
    
    # TODO: Add geographic filtering by radius
    # For now, return all active locations
    
    locations = query.all()
    
    # Build response with partner info
    result = []
    for loc in locations:
        # Преобразуем working_hours из JSON в строку, если это словарь
        working_hours_str = None
        if loc.working_hours:
            if isinstance(loc.working_hours, dict):
                # Форматируем как строку для отображения
                import json
                working_hours_str = json.dumps(loc.working_hours, ensure_ascii=False)
            elif isinstance(loc.working_hours, str):
                working_hours_str = loc.working_hours
        
        # Преобразуем Numeric в float для latitude и longitude
        latitude_float = float(loc.latitude) if loc.latitude is not None else None
        longitude_float = float(loc.longitude) if loc.longitude is not None else None
        
        result.append({
            "id": loc.id,
            "partner_id": loc.partner_id,
            "partner_name": loc.partner.name,
            "address": loc.address,
            "latitude": latitude_float,
            "longitude": longitude_float,
            "phone_number": loc.phone_number,
            "working_hours": working_hours_str,
            "max_discount_percent": float(loc.partner.max_discount_percent) if loc.partner.max_discount_percent else 0.0
        })
    
    return result


@router.get("/categories")
async def get_categories(
    active: bool = True,
    db: Session = Depends(get_db)
):
    """Get list of partner categories"""
    from app.schemas.category import CategoryResponse
    from app.models.category import Category
    
    query = db.query(Category)
    if active:
        query = query.filter(Category.is_active == True)
    
    categories = query.order_by(Category.display_order, Category.name).all()
    return [CategoryResponse.model_validate(cat) for cat in categories]

