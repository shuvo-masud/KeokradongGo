import { supabase } from './supabase'

export interface DemoAccount {
  label: string
  email: string
  password: string
  role: 'consumer' | 'seller' | 'agent' | 'admin' | 'super_admin'
  fullName: string
  districtName?: string
  businessName?: string
  nationalId?: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Consumer', email: 'consumer@bongo.bd', password: 'demo1234', role: 'consumer', fullName: 'Rahim Ahmed' },
  { label: 'Seller', email: 'seller@bongo.bd', password: 'demo1234', role: 'seller', fullName: 'Karim Uddin', businessName: 'Rajshahi Mango Farm', nationalId: '1990123456789' },
  { label: 'Agent (Rajshahi)', email: 'agent.rajshahi@bongo.bd', password: 'demo1234', role: 'agent', fullName: 'Joynal Abedin', districtName: 'Rajshahi', nationalId: '1988567890123' },
  { label: 'Agent (Dhaka)', email: 'agent.dhaka@bongo.bd', password: 'demo1234', role: 'agent', fullName: 'Selim Hossain', districtName: 'Dhaka', nationalId: '1985901234567' },
  { label: 'Admin', email: 'admin@bongo.bd', password: 'demo1234', role: 'admin', fullName: 'Nazrul Islam' },
  { label: 'Super Admin', email: 'owner@bongo.bd', password: 'demo1234', role: 'super_admin', fullName: 'Platform Owner' },
]

const DEMO_PRODUCTS = [
  { title: 'Rajshahi Gopalbhog Mangoes', description: 'Premium Gopalbhog variety mangoes from Rajshahi orchards. Known for their exceptional sweetness and golden color. Handpicked at the peak of ripeness.', price: 750, category: 'Fruits', districtName: 'Rajshahi', stock: 50, image_url: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Tangail Handloom Saree', description: 'Traditional Tangail cotton saree with handwoven geometric patterns. Made by master weavers of Tangail with 100% pure cotton yarn.', price: 2500, category: 'Textiles', districtName: 'Tangail', stock: 15, image_url: 'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Chittagong Shutki (Dried Fish)', description: 'Authentic Chittagong shutki — sun-dried small fish prepared using traditional Chittagong coastal methods. Rich in protein and flavor.', price: 400, category: 'Fish', districtName: 'Chittagong', stock: 100, image_url: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Sylhet Premium Orthodox Tea', description: '100g pack of single-estate Orthodox tea from Sylhet hill gardens. Strong aroma with hints of malt and a smooth finish.', price: 350, category: 'Tea', districtName: 'Sylhet', stock: 200, image_url: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Khulna Hilsha Fish (Ilish)', description: 'Fresh-salted Khulna Hilsha — the prized national fish of Bangladesh from the Rupsha river. Processed and vacuum-packed for freshness.', price: 1200, category: 'Fish', districtName: 'Khulna', stock: 30, image_url: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Rajshahi Langra Mangoes', description: 'Famous Langra mangoes from Rajshahi — a variety known for its rich taste and zero fiber. Available in 2.5 kg boxes, freshly harvested.', price: 600, category: 'Fruits', districtName: 'Rajshahi', stock: 60, image_url: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Bogura Yogurt (Mishti Doi)', description: 'Traditional Bogura mishti doi — sweet fermented yogurt in traditional clay pots. Made with local cow milk using century-old recipes.', price: 180, category: 'Other', districtName: 'Bogura', stock: 40, image_url: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Sylhet Pineapple', description: 'Juicy Sylhet hill pineapples — naturally sweet with a bright golden flesh. Grown in the hilly terrains of Sylhet without pesticides.', price: 120, category: 'Fruits', districtName: 'Sylhet', stock: 80, image_url: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600' },
]

async function seedDemoProducts(sellerId: string) {
  const { data: existingProducts } = await supabase.from('products').select('id').eq('seller_id', sellerId)
  if (existingProducts && existingProducts.length > 0) return

  const { data: districts } = await supabase.from('districts').select('id, name')
  const { data: agents } = await supabase.from('profiles').select('id, district_id, role').eq('role', 'agent').eq('status', 'active')

  for (const product of DEMO_PRODUCTS) {
    const district = districts?.find(d => d.name === product.districtName)
    if (!district) continue
    const agent = agents?.find(a => a.district_id === district.id)
    await supabase.from('products').insert({
      seller_id: sellerId,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      district_id: district.id,
      stock: product.stock,
      image_url: product.image_url,
      verification_status: agent ? 'verified' : 'pending',
      assigned_agent_id: agent?.id ?? null,
      verified_at: agent ? new Date().toISOString() : null,
    })
  }
}

export async function ensureDemoAccounts() {
  const sellerEmail = 'seller@bongo.bd'
  const sellerPassword = 'demo1234'
  let sellerId: string | null = null

  for (const account of DEMO_ACCOUNTS) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })

    if (signInData.user && !signInError) {
      const { data: existing } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).maybeSingle()
      if (!existing) {
        let districtId: string | null = null
        if (account.districtName) {
          const { data: dist } = await supabase.from('districts').select('id').eq('name', account.districtName).maybeSingle()
          districtId = dist?.id ?? null
        }
        await supabase.from('profiles').insert({
          id: signInData.user.id,
          email: account.email,
          full_name: account.fullName,
          role: account.role,
          district_id: districtId,
          business_name: account.businessName ?? null,
          national_id: account.nationalId ?? null,
          status: 'active',
        })
      }
      if (account.email === sellerEmail) sellerId = signInData.user.id
      await supabase.auth.signOut()
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
      })
      if (signUpError || !signUpData.user) continue

      let districtId: string | null = null
      if (account.districtName) {
        const { data: dist } = await supabase.from('districts').select('id').eq('name', account.districtName).maybeSingle()
        districtId = dist?.id ?? null
      }
      await supabase.from('profiles').insert({
        id: signUpData.user.id,
        email: account.email,
        full_name: account.fullName,
        role: account.role,
        district_id: districtId,
        business_name: account.businessName ?? null,
        national_id: account.nationalId ?? null,
        status: 'active',
      })
      if (account.email === sellerEmail) sellerId = signUpData.user.id
      await supabase.auth.signOut()
    }
  }

  // Seed demo products for seller after all accounts (including agents) are created
  if (sellerId) {
    await supabase.auth.signInWithPassword({ email: sellerEmail, password: sellerPassword })
    await seedDemoProducts(sellerId)
    await supabase.auth.signOut()
  }
}
