export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  phone_verified: boolean;
  email_verified: boolean;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface Partner {
  id: number;
  name: string;
  description?: string;
  category: string;
  logo_url?: string;
  cover_image_url?: string;
  phone?: string;
  email?: string;
  max_discount_percent: number;
  cashback_rate: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'topup' | 'discount' | 'bonus' | 'refund';
  amount: number;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  partner_id: number;
  order_total: number;
  discount: number;
  final_amount: number;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  last_updated: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'push' | 'sms' | 'email' | 'in_app';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  created_at: string;
  sent_at?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: 'transaction' | 'referral' | 'loyalty' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Promotion {
  id: number;
  title: string;
  description?: string;
  category: string;
  promotion_type: string;
  partner_id?: number;
  discount_percent?: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'cancelled';
  usage_count: number;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_partners: number;
  total_transactions: number;
  total_revenue: number;
  users_growth: number;
  revenue_growth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'partner_admin';
}
