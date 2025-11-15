// ⚠️ ВНИМАНИЕ: Этот файл не используется в текущей реализации
// Проект использует FastAPI бэкенд, а не Supabase
// Файл оставлен для возможного будущего использования

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// Временно отключено - используем FastAPI
export const supabase = null as any;
