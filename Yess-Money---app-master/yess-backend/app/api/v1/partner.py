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
    import re
    
    def generate_slug(name: str) -> str:
        """Generate slug from name if slug is empty"""
        if not name:
            return "uncategorized"
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')[:100] or "uncategorized"
    
    result = []
    for partner in partners:
        active_categories = [cat for cat in partner.categories if cat.is_active]
        # Создаем список категорий с валидными slug
        category_list = []
        for cat in active_categories:
            slug = cat.slug if cat.slug and cat.slug.strip() else generate_slug(cat.name)
            try:
                category_list.append(CategoryResponse(
                    id=cat.id,
                    name=cat.name,
                    slug=slug,
                    description=cat.description,
                    icon=cat.icon,
                    display_order=cat.display_order,
                    is_active=cat.is_active,
                    created_at=cat.created_at,
                    updated_at=cat.updated_at
                ))
            except Exception as e:
                # Пропускаем категории, которые не могут быть валидированы
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Skipping category {cat.id} ({cat.name}) for partner {partner.id}: {e}")
                continue
        
        result.append(PartnerResponse(
            id=partner.id,
            name=partner.name,
            logo_url=partner.logo_url,
            default_cashback_rate=float(partner.default_cashback_rate or 5.0),
            categories=category_list,
            category=category_list[0].name if category_list else None
        ))
    
    return result


@router.get("/locations", response_model=List[PartnerLocationResponse])
async def get_partner_locations(
    partner_id: Optional[int] = Query(None),
    category_slug: Optional[str] = Query(None, alias="category_slug"),
    query: Optional[str] = Query(None, alias="query"),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius: float = Query(10.0),
    db: Session = Depends(get_db)
):
    """Get partner locations for map"""
    query_obj = db.query(PartnerLocation).join(Partner).filter(PartnerLocation.is_active == True)
    
    if partner_id:
        query_obj = query_obj.filter(PartnerLocation.partner_id == partner_id)
    
    # Фильтр по категории (по slug)
    if category_slug:
        # Используем join с категориями и distinct для избежания дубликатов
        query_obj = query_obj.join(Partner.categories).filter(
            Category.slug == category_slug,
            Category.is_active == True
        ).distinct()
    
    # Фильтр по поисковому запросу (поиск в названии партнёра или адресе)
    if query:
        search_term = f"%{query}%"
        query_obj = query_obj.filter(
            (Partner.name.ilike(search_term)) | 
            (PartnerLocation.address.ilike(search_term))
        )
    
    # Географическая фильтрация по радиусу (если указаны координаты)
    if latitude is not None and longitude is not None:
        from geopy.distance import geodesic
        from sqlalchemy import func
        
        # Фильтруем локации по радиусу
        filtered_locations = []
        center_point = (latitude, longitude)
        
        for loc in query_obj.all():
            if loc.latitude is not None and loc.longitude is not None:
                distance = geodesic(center_point, (loc.latitude, loc.longitude)).kilometers
                if distance <= radius:
                    filtered_locations.append((loc, distance))
        
        # Сортируем по расстоянию
        filtered_locations.sort(key=lambda x: x[1])
        locations = [loc for loc, _ in filtered_locations]
    else:
        locations = query_obj.all()
    
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
    import re
    
    def generate_slug(name: str) -> str:
        """Generate slug from name if slug is empty"""
        if not name:
            return "uncategorized"
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')[:100] or "uncategorized"
    
    query = db.query(Category)
    if active:
        query = query.filter(Category.is_active == True)
    
    categories = query.order_by(Category.display_order, Category.name).all()
    # Создаем объекты CategoryResponse напрямую, генерируя slug если он пустой
    result = []
    for cat in categories:
        # Генерируем slug если он пустой или None
        slug = cat.slug if cat.slug and cat.slug.strip() else generate_slug(cat.name)
        try:
            result.append(CategoryResponse(
                id=cat.id,
                name=cat.name,
                slug=slug,
                description=cat.description,
                icon=cat.icon,
                display_order=cat.display_order,
                is_active=cat.is_active,
                created_at=cat.created_at,
                updated_at=cat.updated_at
            ))
        except Exception as e:
            # Пропускаем категории, которые не могут быть валидированы
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Skipping category {cat.id} ({cat.name}): {e}")
            continue
    
    return result


@router.get("/{partner_id}", response_model=PartnerDetail, response_model_exclude_none=False)
async def get_partner(partner_id: int, db: Session = Depends(get_db)):
    """Get partner details"""
    partner = db.query(Partner).options(joinedload(Partner.categories)).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Преобразуем в PartnerDetail
    from app.schemas.category import CategoryResponse
    import re
    
    def generate_slug(name: str) -> str:
        """Generate slug from name if slug is empty"""
        if not name:
            return "uncategorized"
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')[:100] or "uncategorized"
    
    # Создаём список категорий с валидными slug
    category_list = []
    for cat in partner.categories:
        if not cat.is_active:
            continue
        slug = cat.slug if cat.slug and cat.slug.strip() else generate_slug(cat.name)
        try:
            category_list.append(CategoryResponse(
                id=cat.id,
                name=cat.name,
                slug=slug,
                description=cat.description,
                icon=cat.icon,
                display_order=cat.display_order,
                is_active=cat.is_active,
                created_at=cat.created_at,
                updated_at=cat.updated_at
            ))
        except Exception as e:
            # Пропускаем категории, которые не могут быть валидированы
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Skipping category {cat.id} ({cat.name}) for partner {partner.id}: {e}")
            continue
    
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
        categories=category_list,
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
    # Создаем объекты CategoryResponse напрямую
    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon=cat.icon,
            display_order=cat.display_order,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at
        )
        for cat in categories
    ]

