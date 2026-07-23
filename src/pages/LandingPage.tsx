import { useNavigate } from 'react-router-dom'

const ROLES = [
  { icon: '🛍️', title: 'স্মার্ট ক্রেতা (Consumer)', desc: 'জেলা ভিত্তিক ঐতিহ্যবাহী ও আসল পণ্য খুঁজুন, ফিল্টার করুন এবং লোকাল এজেন্টের ভেরিফিকেশন রিপোর্ট ও রিয়েল-টাইম শিপিং ট্র্যাক করুন। প্রয়োজনে সেলার ও এজেন্টের সাথে সরাসরি চ্যাট করুন।', fromColor: 'from-primary-500', toColor: 'to-primary-700' },
  { icon: '🌾', title: 'লোকাল উৎপাদক (Seller)', desc: 'আপনার নিজস্ব ডিজিটাল স্টোরফ্রন্ট তৈরি করুন। উৎপাদনে নিজস্ব জেলার মেটাডেটা যুক্ত করে নিজস্ব মানসম্পন্ন অথবা, খাঁটি ঐতিহ্যবাহী পণ্য লিস্টিং করুন এবং চমৎকার ড্যাশবোর্ডে সেলস অ্যানালিটিক্স মনিটর করুন।', fromColor: 'from-accent-500', toColor: 'to-accent-700' },
  { icon: '🔍', title: 'অনুমোদিত জেলা পরিদর্শক (Agent)', desc: 'সেলারদের আপলোড করা প্রতিটি পণ্যের ব্যাচ যাচাই করে নিশ্চিত করুন এবং প্রতি ভেরিফিকেশনে আকর্ষণীয় সার্ভিস ফি বা কমিশন (৳) আয় করুন।', fromColor: 'from-ocean-500', toColor: 'to-ocean-700' },
  { icon: '🛡️', title: 'আঞ্চলিক অ্যাডমিন (Admin)', desc: 'প্ল্যাটফর্মের স্বচ্ছতা বজায় রাখতে ব্যাকগ্রাউন্ড চেকের মাধ্যমে সেলার ও এজেন্টদের অনুমোদন বা সাসপেন্ড করুন। ক্রেতাদের যেকোনো কমপ্লেইন বা ডিসপুট টিকিট দ্রুত সমাধান করুন।', fromColor: 'from-emerald-500', toColor: 'to-emerald-700' },
]

const TRUST_STEPS = [
  { num: '০১', title: 'স্থানীয় লিস্টিং (Local Listing)', desc: 'বিক্রেতারা তাদের নিজস্ব মানসম্পন্ন অথবা, অঞ্চলের ঐতিহ্যবাহী ও আসল পণ্য যেমন— টাঙ্গাইলের শাড়ি, চট্টগ্রামের শুটকি মাছ, বা রাজশাহীর আম অরিজিনাল জেলা উল্লেখ করে লিস্টিং করেন।' },
  { num: '০২', title: 'এজেন্ট পরিদর্শন (Agent Inspection)', desc: 'নির্দিষ্ট জেলার একজন অনুমোদিত ফিল্ড এজেন্ট পণ্যের গুণগত মান ও বিবরনী সত্যতা যাচাই করেন এবং একটি ভেরিফিকেশন রিপোর্ট আপলোড করেন।' },
  { num: '০৩', title: 'স্মার্ট পারচেজ (Smart Buying)', desc: 'ক্রেতারা জেলা অনুযায়ী ব্রাউজ ও ফিল্টার করে শতভাগ গ্যারান্টিযুক্ত, এজেন্ট-ভেরিফাইড ও আসল ঐতিহ্যবাহী পণ্য নিশ্চিন্তে কেনাকাটা করেন।' },
]

const CATEGORIES = [
  { name: 'আম (Mangoes)', district: 'রাজশাহী', emoji: '🥭' },
  { name: 'তাঁতের শাড়ি (Sarees)', district: 'টাঙ্গাইল', emoji: '🥻' },
  { name: 'শুঁটকি মাছ (Dried Fish)', district: 'চট্টগ্রাম', emoji: '🐟' },
  { name: 'চা পাতা (Tea)', district: 'সিলেট', emoji: '🍵' },
  { name: 'ইলিশ মাছ (Hilsha)', district: 'খুলনা', emoji: '🐠' },
  { name: 'আনারস (Pineapple)', district: 'সিলেট', emoji: '🍍' },
]
export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Rounded Square */}
      <rect width="40" height="40" rx="10" className="fill-primary-600" />
      
      {/* Mountain & K Vector Paths */}
      <path 
        d="M12 10V30M12 20L22 10M12 20L24 30M25 15L30 20L25 25" 
        stroke="white" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Wrapper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
  <LogoIcon className="w-10 h-10 shrink-0" />
</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight">Keokradong.store</span>
                <span className="hidden sm:inline text-sm text-gray-400 font-normal">কেওক্রাডং</span>
              </div>
              <p className="text-xs font-bold text-lg-500 block leading-tight">
                Connecting 64 Districts
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#concept" className="hover:text-primary-600 transition-colors">মূল কনসেপ্ট</a>
            <a href="#roles" className="hover:text-primary-600 transition-colors">রোলস ও ড্যাশবোর্ড</a>
            <a href="#trust" className="hover:text-primary-600 transition-colors">ট্রাস্ট ইঞ্জিন</a>
          </div>
          <button 
            onClick={() => navigate('/auth')} 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            শুরু করুন
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 lg:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
  
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              সেরা সব দেশী, ঐতিহ্যবাহী ও আসল পণ্যের ট্রাস্ট-সেন্ট্রিক মার্কেটপ্লেস
            </div>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight tracking-tight text-gray-900 animate-slide-up">
              আসল লোকাল পণ্য,
              <br />
              <span className="text-primary-600">কেওক্রাডং এ </span>
              <br />

            </h1>
            <h1 className="font-display font-extrabold text-xl md:text-2xl leading-tight tracking-tight text-gray-900 animate-slide-up">
              <span className="text-primary-600">Connecting 64 Districts</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl leading-relaxed animate-slide-up">
              কেওক্রাডং বাংলাদেশের স্থানীয় উৎপাদক ও স্মার্ট ক্রেতাদের সরাসরি সংযুক্ত করে। ই-কমার্সের গুণগত মান ও আস্থার সংকট দূর করতে প্রতিটি পণ্য ডেলিভারির আগে স্থানীয় ফিল্ড এজেন্ট দ্বারা ভেরিফিকেশন নিশ্চিত করা হয়।
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-slide-up">
              <button 
                onClick={() => navigate('/auth')} 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-base rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                এক্সপ্লোর করুন
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <a 
                href="#concept" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-base rounded-xl transition-all cursor-pointer"
              >
                পদ্ধতিটি জানুন
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 text-sm">
   
              <div><div className="font-display font-bold text-2xl text-gray-900">১০০%</div><div className="text-gray-500">এজেন্ট দ্বারা ভেরিফাইড</div></div>
            </div>
                  <div className="absolute top-8 right-8 rotate-12 opacity-15 pointer-events-none">
            <div className="border-8 border-primary-600 rounded-full w-48 h-48 flex items-center justify-center">
             <div className="text-center font-bold text-primary-700">
              <div className="text-xl">✓</div>
               <div className="text-lg uppercase">Quality</div>
               <div className="text-lg uppercase">Guaranteed</div>
              </div>
            </div>
         </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-2 tracking-tight">জেলা ভিত্তিক মানসম্পন্ন, ঐতিহ্যবাহী ও আসল পণ্য</h2>
          <p className="text-gray-500 text-center mb-10">প্রতিটি পণ্যের উৎস সরাসরি তার নিজস্ব অঞ্চলের মেটাডেটায় সনাক্তযোগ্য</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow group cursor-pointer animate-scale-in">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                <div className="font-semibold text-sm">{cat.name}</div>
                <div className="text-xs text-primary-600 font-medium mt-1">📍 {cat.district}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Engine */}
      <section id="trust" className="py-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-sm font-medium mb-4">দ্যা ট্রাস্ট ইঞ্জিন (The Trust Engine)</div>
            <h2 className="font-display font-bold text-2xl md:text-4xl mb-3 tracking-tight">ভেরিফিকেশন লুপ কীভাবে কাজ করে?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">ট্রেডিশনাল ই-কমার্সে পণ্যের আসল রূপ ও কোয়ালিটি নিয়ে বড় ঘাটতি থাকে। কেওক্রাডং নিয়ে এসেছে ইউনিক লোকাল এজেন্ট ভেরিফিকেশন সিস্টেম।</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TRUST_STEPS.map((step, i) => (
              <div key={step.num} className="relative bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-5xl font-display font-extrabold text-primary-100 mb-4">{step.num}</div>
                <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                {i < TRUST_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-primary-600 text-white text-xs items-center justify-center z-10 shadow-xs">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 rounded-full bg-ocean-100 text-ocean-700 text-sm font-medium mb-4">মাল্টি-রোল ইকোসিস্টেম</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map(role => (
              <div key={role.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.fromColor} ${role.toColor} flex items-center justify-center text-2xl mb-4`}>
                  {role.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concept */}
      <section id="concept" className="py-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl md:text-4xl mb-6 tracking-tight">বাংলাদেশের লোকাল অর্থনীতির জন্য তৈরি</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            যশোরের বিখ্যাত গুড়ের সন্দেশ থেকে রাজশাহীর মিষ্টি আম, আপনার হাতের নকশিকাথা থেকে টাঙ্গাইলের তাঁতের শাড়ি, সিলেটের চায়ের বাগান থেকে চট্টগ্রামের রূপচাঁদা শুঁটকি, অথবা আপনার উৎপাদিত মানসম্পন্ন আচার—বাংলাদেশের প্রতিটি জেলার আসল রূপ, ঐতিহ্য ও কারুশিল্প সরাসরি আপনার দোরগোড়ায় পৌঁছে দেবে কেওক্রাডং। প্রতিটি পদক্ষেপে থাকছে শতভাগ লোকাল এজেন্ট ভেরিফিকেশনের পরম নিশ্চিন্ত আস্থা!
          </p>
          <button 
            onClick={() => navigate('/auth')} 
            className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-base rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
          >
            আজই কেওক্রাডং-এ যোগ দিন
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 lg:px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
  <LogoIcon className="w-10 h-10 shrink-0" />
  <div>
    <div className="flex items-center gap-2">
      <span className="font-display font-bold text-white text-base">Keokradong</span>
      <span className="text-sm font-normal text-gray-500">কেওক্রাডং</span>
    </div>
    <p className="text-xs text-gray-300 mt-1 block">
      Connecting 64 Districts & bringing goods to your doorstep
    </p>
  </div>
</div>
/</div>

          {/* Contact & Support Info */}
          <div className="text-xs text-center md:text-left space-y-1 text-gray-300">
            <div>
              <span className="font-bold text-white">Support:</span>{' '}
              <a href="mailto:info@keokradong.store" className="hover:text-primary-400 underline">
                info@keokradong.store
              </a>
            </div>
            <div>
              <span className="font-bold text-white">Complain:</span>{' '}
              <a href="mailto:complain@keokradong.store" className="hover:text-primary-400 underline">
                complain@keokradong.store
              </a>
            </div>
          </div>

          {/* Bengali Marketplace Description */}
          <div className="text-sm text-center md:text-right text-gray-300 max-w-xs">
            বাংলাদেশের সেরা সব খাঁটি ও ঐতিহ্যবাহী পণ্যের ট্রাস্ট-সেন্ট্রিক বিকেন্দ্রীকৃত লোকাল মার্কেটপ্লেস
          </div>

        </div>
      </footer>
    </div>
  )
}