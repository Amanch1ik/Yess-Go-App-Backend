"""
Banner endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from app.core.database import get_db
from app.models.banner import Banner
from app.models.partner import Partner
from app.schemas.banner import BannerResponse
from typing import List, Optional

router = APIRouter()


@router.get("/", response_model=List[BannerResponse])
async def get_banners(
    active: bool = Query(True, description="Получить только активные баннеры"),
    db: Session = Depends(get_db)
):
    """Получить список баннеров"""
    try:
        query = db.query(Banner)
        
        if active:
            query = query.filter(Banner.is_active == True)
            
            # Фильтр по датам, если они указаны
            now = datetime.utcnow()
            query = query.filter(
                (Banner.start_date.is_(None) | (Banner.start_date <= now)),
                (Banner.end_date.is_(None) | (Banner.end_date >= now))
            )
        
        # Сортируем по порядку отображения
        banners = query.order_by(Banner.display_order.asc(), Banner.id.asc()).all()
        
        # Преобразуем в ответ с именем партнёра
        result = []
        for banner in banners:
            partner_name = None
            if banner.partner_id:
                partner = db.query(Partner).filter(Partner.id == banner.partner_id).first()
                if partner:
                    partner_name = partner.name
            
            result.append(BannerResponse(
                id=banner.id,
                image_url=banner.image_url,
                partner_id=banner.partner_id,
                partner_name=partner_name,
                title=banner.title,
                description=banner.description,
                is_active=banner.is_active,
                order=banner.display_order,
                link_url=banner.link_url,
                start_date=banner.start_date,
                end_date=banner.end_date
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении баннеров: {str(e)}")


@router.get("/{banner_id}", response_model=BannerResponse)
async def get_banner(
    banner_id: int,
    db: Session = Depends(get_db)
):
    """Получить баннер по ID"""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Баннер не найден")
    
    partner_name = None
    if banner.partner_id:
        partner = db.query(Partner).filter(Partner.id == banner.partner_id).first()
        if partner:
            partner_name = partner.name
    
    return BannerResponse(
        id=banner.id,
        image_url=banner.image_url,
        partner_id=banner.partner_id,
        partner_name=partner_name,
        title=banner.title,
        description=banner.description,
        is_active=banner.is_active,
        order=banner.display_order,
        link_url=banner.link_url,
        start_date=banner.start_date,
        end_date=banner.end_date
    )

