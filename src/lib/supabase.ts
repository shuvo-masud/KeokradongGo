import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export function getPasswordResetRedirectUrl() {
  return `${window.location.origin}/reset-password`
}

export type Role = 'consumer' | 'seller' | 'agent' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  email: string
  phone: string | null
  full_name: string
  role: Role
  district_id: string | null
  business_name: string | null
  national_id: string | null
  status: string
  avatar_url: string | null
  created_at: string
}

export interface District {
  id: string
  name: string
  division: string
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category: string
  district_id: string

  image_url: string | null
  image_path: string | null

  stock: number
  verification_status: 'pending' | 'verified' | 'rejected'
  assigned_agent_id: string | null
  verified_at: string | null
  created_at: string
}

export interface Verification {
  id: string
  product_id: string
  agent_id: string
  status: 'verified' | 'rejected'
  report: string
  quality_score: number | null
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  total: number
  shipping_cost: number
  tax: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
}

export interface Chat {
  id: string
  product_id: string | null
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

export interface Dispute {
  id: string
  order_id: string
  buyer_id: string
  subject: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  resolution: string | null
  created_at: string
  resolved_at: string | null
}

export interface PlatformSettings {
  id: number
  tax_percentage: number
  base_shipping_rate: number
  agent_commission: number
  platform_name: string
  updated_at: string
}
