"""Add performance indexes

Revision ID: add_performance_indexes
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Индексы для таблицы users
    op.create_index('idx_user_location', 'users', ['city_id', 'latitude', 'longitude'])
    op.create_index('idx_user_activity', 'users', ['is_active', 'last_login_at'])
    op.create_index('idx_user_referral', 'users', ['referral_code', 'referred_by'])
    op.create_index('idx_user_verification', 'users', ['phone_verified', 'email_verified'])
    
    # Индексы для таблицы transactions
    op.create_index('idx_transaction_user_status', 'transactions', ['user_id', 'status', 'created_at'])
    op.create_index('idx_transaction_type_status', 'transactions', ['type', 'status', 'created_at'])
    op.create_index('idx_transaction_date_range', 'transactions', ['created_at', 'status'])
    
    # Индексы для таблицы partners
    op.create_index('idx_partner_location', 'partners', ['city_id', 'latitude', 'longitude'])
    op.create_index('idx_partner_status', 'partners', ['is_active', 'is_verified', 'category'])
    op.create_index('idx_partner_cashback', 'partners', ['cashback_rate', 'is_active'])
    
    # GIST индекс для геопространственных запросов (требует PostGIS)
    # op.execute('CREATE INDEX idx_partner_geom ON partners USING GIST (geom);')


def downgrade():
    # Удаление индексов
    op.drop_index('idx_user_location', table_name='users')
    op.drop_index('idx_user_activity', table_name='users')
    op.drop_index('idx_user_referral', table_name='users')
    op.drop_index('idx_user_verification', table_name='users')
    
    op.drop_index('idx_transaction_user_status', table_name='transactions')
    op.drop_index('idx_transaction_type_status', table_name='transactions')
    op.drop_index('idx_transaction_date_range', table_name='transactions')
    
    op.drop_index('idx_partner_location', table_name='partners')
    op.drop_index('idx_partner_status', table_name='partners')
    op.drop_index('idx_partner_cashback', table_name='partners')
    
    # op.execute('DROP INDEX IF EXISTS idx_partner_geom;')

