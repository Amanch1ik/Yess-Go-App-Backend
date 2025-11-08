"""create banners table

Revision ID: create_banners_table
Revises: add_first_last_name
Create Date: 2025-11-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'create_banners_table'
down_revision = 'add_first_last_name'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаём таблицу banners
    op.create_table('banners',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('partner_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('display_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('link_url', sa.String(length=500), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Создаём индексы
    op.create_index(op.f('ix_banners_id'), 'banners', ['id'], unique=False)
    op.create_index(op.f('ix_banners_partner_id'), 'banners', ['partner_id'], unique=False)
    op.create_index(op.f('ix_banners_is_active'), 'banners', ['is_active'], unique=False)
    op.create_index(op.f('ix_banners_display_order'), 'banners', ['display_order'], unique=False)


def downgrade() -> None:
    # Удаляем индексы
    op.drop_index(op.f('ix_banners_display_order'), table_name='banners')
    op.drop_index(op.f('ix_banners_is_active'), table_name='banners')
    op.drop_index(op.f('ix_banners_partner_id'), table_name='banners')
    op.drop_index(op.f('ix_banners_id'), table_name='banners')
    
    # Удаляем таблицу
    op.drop_table('banners')

