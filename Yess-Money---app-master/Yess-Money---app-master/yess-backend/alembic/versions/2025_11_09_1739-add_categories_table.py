"""add categories table and many-to-many relationship

Revision ID: add_categories_table
Revises: create_banners_table
Create Date: 2025-11-09 17:39:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_categories_table'
down_revision = 'create_banners_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Создаём таблицу categories
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Создаём индексы для categories
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=True)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)
    op.create_index(op.f('ix_categories_display_order'), 'categories', ['display_order'], unique=False)
    op.create_index(op.f('ix_categories_is_active'), 'categories', ['is_active'], unique=False)
    
    # 2. Создаём промежуточную таблицу partner_categories
    op.create_table('partner_categories',
        sa.Column('partner_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('partner_id', 'category_id')
    )
    
    # Создаём индекс для partner_categories
    op.create_index('idx_partner_category', 'partner_categories', ['partner_id', 'category_id'], unique=False)
    
    # 3. Миграция данных: переносим старые категории из поля category в новую структуру
    # Сначала получаем все уникальные категории из partners
    connection = op.get_bind()
    
    # Получаем все уникальные категории
    result = connection.execute(sa.text("""
        SELECT DISTINCT category 
        FROM partners 
        WHERE category IS NOT NULL AND category != ''
    """))
    
    old_categories = [row[0] for row in result]
    
    # Создаём категории из старых данных (если они есть)
    if old_categories:
        # Функция для создания slug из имени
        def create_slug(name):
            import re
            slug = name.lower()
            slug = re.sub(r'[^\w\s-]', '', slug)
            slug = re.sub(r'[-\s]+', '-', slug)
            return slug.strip('-')
        
        # Добавляем категории
        for idx, cat_name in enumerate(old_categories):
            slug = create_slug(cat_name)
            # Проверяем, не существует ли уже такой slug
            existing = connection.execute(
                sa.text("SELECT id FROM categories WHERE slug = :slug"),
                {"slug": slug}
            ).fetchone()
            
            if not existing:
                connection.execute(
                    sa.text("""
                        INSERT INTO categories (name, slug, display_order, is_active, created_at, updated_at)
                        VALUES (:name, :slug, :order, true, now(), now())
                    """),
                    {"name": cat_name, "slug": slug, "order": idx}
                )
        
        # Связываем партнёров с категориями
        for cat_name in old_categories:
            slug = create_slug(cat_name)
            cat_result = connection.execute(
                sa.text("SELECT id FROM categories WHERE slug = :slug"),
                {"slug": slug}
            ).fetchone()
            
            if cat_result:
                category_id = cat_result[0]
                # Находим всех партнёров с этой категорией
                partners = connection.execute(
                    sa.text("SELECT id FROM partners WHERE category = :cat"),
                    {"cat": cat_name}
                ).fetchall()
                
                # Создаём связи
                for partner_row in partners:
                    partner_id = partner_row[0]
                    # Проверяем, не существует ли уже такая связь
                    existing_link = connection.execute(
                        sa.text("""
                            SELECT 1 FROM partner_categories 
                            WHERE partner_id = :pid AND category_id = :cid
                        """),
                        {"pid": partner_id, "cid": category_id}
                    ).fetchone()
                    
                    if not existing_link:
                        connection.execute(
                            sa.text("""
                                INSERT INTO partner_categories (partner_id, category_id)
                                VALUES (:pid, :cid)
                            """),
                            {"pid": partner_id, "cid": category_id}
                        )
    
    # 4. Удаляем старую колонку category из partners
    # Сначала удаляем индекс, если он существует
    try:
        op.drop_index('idx_partner_status', table_name='partners')
    except:
        pass
    
    # Удаляем колонку category
    op.drop_column('partners', 'category')
    
    # Создаём новый индекс без category
    op.create_index('idx_partner_status', 'partners', ['is_active', 'is_verified'], unique=False)


def downgrade() -> None:
    # 1. Добавляем обратно колонку category в partners
    op.add_column('partners', sa.Column('category', sa.String(length=100), nullable=True))
    
    # 2. Восстанавливаем данные из partner_categories (берем первую категорию для каждого партнёра)
    connection = op.get_bind()
    result = connection.execute(sa.text("""
        SELECT pc.partner_id, c.name
        FROM partner_categories pc
        JOIN categories c ON pc.category_id = c.id
        ORDER BY pc.partner_id, c.display_order
    """))
    
    # Группируем по partner_id и берем первую категорию
    partner_cats = {}
    for row in result:
        partner_id, cat_name = row
        if partner_id not in partner_cats:
            partner_cats[partner_id] = cat_name
    
    # Обновляем partners
    for partner_id, cat_name in partner_cats.items():
        connection.execute(
            sa.text("UPDATE partners SET category = :cat WHERE id = :pid"),
            {"cat": cat_name, "pid": partner_id}
        )
    
    # 3. Удаляем промежуточную таблицу
    op.drop_index('idx_partner_category', table_name='partner_categories')
    op.drop_table('partner_categories')
    
    # 4. Удаляем таблицу categories
    op.drop_index(op.f('ix_categories_is_active'), table_name='categories')
    op.drop_index(op.f('ix_categories_display_order'), table_name='categories')
    op.drop_index(op.f('ix_categories_slug'), table_name='categories')
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
    
    # 5. Восстанавливаем старый индекс
    op.drop_index('idx_partner_status', table_name='partners')
    op.create_index('idx_partner_status', 'partners', ['is_active', 'is_verified', 'category'], unique=False)

