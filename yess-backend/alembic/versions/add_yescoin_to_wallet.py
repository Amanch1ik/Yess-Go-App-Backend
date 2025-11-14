"""add yescoin_balance to wallet

Revision ID: add_yescoin_balance
Revises: 
Create Date: 2025-01-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_yescoin_balance'
down_revision = None  # Замените на последнюю ревизию
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем колонки для виртуальной монеты
    op.add_column('wallets', sa.Column('yescoin_balance', sa.Numeric(10, 2), nullable=False, server_default='0.00'))
    op.add_column('wallets', sa.Column('total_earned', sa.Numeric(10, 2), nullable=True, server_default='0.00'))
    op.add_column('wallets', sa.Column('total_spent', sa.Numeric(10, 2), nullable=True, server_default='0.00'))
    
    # Добавляем индексы
    op.create_index('idx_wallet_user_updated', 'wallets', ['user_id', 'last_updated'])
    
    # Добавляем constraints
    op.create_check_constraint(
        'check_positive_yescoin_balance',
        'wallets',
        'yescoin_balance >= 0'
    )
    op.create_check_constraint(
        'check_positive_total_earned',
        'wallets',
        'total_earned >= 0'
    )
    op.create_check_constraint(
        'check_positive_total_spent',
        'wallets',
        'total_spent >= 0'
    )


def downgrade():
    # Удаляем constraints
    op.drop_constraint('check_positive_total_spent', 'wallets', type_='check')
    op.drop_constraint('check_positive_total_earned', 'wallets', type_='check')
    op.drop_constraint('check_positive_yescoin_balance', 'wallets', type_='check')
    
    # Удаляем индексы
    op.drop_index('idx_wallet_user_updated', table_name='wallets')
    
    # Удаляем колонки
    op.drop_column('wallets', 'total_spent')
    op.drop_column('wallets', 'total_earned')
    op.drop_column('wallets', 'yescoin_balance')

