# 🍽️ دليل صاحب المحل الكامل — من الصفر للتسليم
## بالعربي خطوة بخطوة

---

# الجزء الأول: إزاي تجهز الموقع لنفسك كصاحب محل

---

## 📌 المرحلة 1 — الحسابات المطلوبة (مجانية كلها)

قبل أي حاجة، هتحتاج تعمل 4 حسابات:

### 1. حساب Supabase (قاعدة البيانات)
```
1. روح على: https://supabase.com
2. اضغط "Start your project"
3. سجل بـ GitHub أو Gmail
4. اضغط "New Project"
5. اختار اسم للمشروع (مثلاً: my-restaurant)
6. اختار كلمة سر قوية للداتابيز (احفظها!)
7. اختار Region: "Europe West" أو الأقرب لبلدك
8. اضغط "Create new project"
9. استنى 2 دقيقة لحد ما يتجهز
```
✅ **النتيجة:** هيديك Project URL + API Keys — احتفظ بيهم

---

### 2. حساب GitHub (لرفع الكود)
```
1. روح على: https://github.com
2. اضغط "Sign up"
3. سجل بالإيميل بتاعك
4. تأكيد الإيميل
```
✅ **مجاني 100%**

---

### 3. حساب Vercel (لاستضافة الموقع)
```
1. روح على: https://vercel.com
2. اضغط "Sign Up"
3. اختار "Continue with GitHub" — سيربطهم ببعض تلقائياً
```
✅ **مجاني — والموقع هيشتغل على دومين مجاني .vercel.app**

---

### 4. حساب Google Cloud (لتسجيل الدخول بـ Google)
```
1. روح على: https://console.cloud.google.com
2. سجل بحساب Gmail عادي
3. اقبل الشروط
```
✅ **مجاني**

---

## 📌 المرحلة 2 — تجهيز قاعدة البيانات في Supabase

### الخطوة 2.1 — تشغيل الـ Schema

```
1. افتح Supabase Dashboard
2. اضغط على مشروعك
3. من الـ Sidebar الشمال اضغط "SQL Editor"
4. اضغط "+ New query"
5. افتح الملف: supabase/schema.sql من المشروع
6. Ctrl+A (اختار كل النص)
7. Ctrl+C (كوبي)
8. ارجع للـ SQL Editor وامسح أي نص فيه
9. Ctrl+V (بيست)
10. اضغط "Run" أو F5
11. هتشوف رسالة "Success" في الأسفل ✅
```

> ⚠️ لو حصل Error: أعمل refresh للصفحة وجرب تاني

---

### الخطوة 2.2 — إنشاء Storage Bucket للصور

```
1. في Supabase Sidebar اضغط "Storage"
2. اضغط "New bucket"
3. في الـ Name اكتب: menu-images
4. فعّل "Public bucket" ✓ (مهم عشان الصور تبان)
5. اضغط "Save"
```

---

### الخطوة 2.3 — تفعيل Google OAuth

**أولاً في Google Cloud Console:**
```
1. روح: https://console.cloud.google.com
2. اضغط فوق على اسم المشروع → "New Project"
3. اسم المشروع: restaurant-oauth → "Create"
4. من القائمة: APIs & Services → OAuth consent screen
5. اختار "External" → Create
6. App name: اسم مطعمك
7. User support email: إيميلك
8. Developer contact: إيميلك
9. "Save and Continue" × 3 مرات
10. "Back to Dashboard"

11. APIs & Services → Credentials
12. "+ Create Credentials" → "OAuth Client ID"
13. Application type: "Web application"
14. Name: Restaurant App
15. Authorized redirect URIs → "Add URI"
    اكتب: https://[PROJECT_ID].supabase.co/auth/v1/callback
    (غير [PROJECT_ID] بـ ID مشروعك من Supabase)
16. "Create"
17. هيظهر Client ID و Client Secret — انسخهم!
```

**ثانياً في Supabase:**
```
1. Authentication → Providers
2. اضغط على "Google"
3. فعّل "Enable Sign in with Google" ✓
4. حط الـ Client ID في "Client ID"
5. حط الـ Client Secret في "Client Secret"
6. "Save"
```

---

## 📌 المرحلة 3 — تشغيل المشروع على جهازك

### الخطوة 3.1 — تثبيت Node.js
```
1. روح: https://nodejs.org
2. حمل النسخة LTS (الخضراء)
3. ثبتها عادي كأي برنامج
4. افتح CMD أو Terminal وتأكد:
   node --version    ← المفروض يقولك v18 أو أعلى
   npm --version     ← المفروض يقولك 9 أو أعلى
```

---

### الخطوة 3.2 — فك الضغط وتثبيت المشروع
```bash
# 1. فك الضغط من الـ ZIP اللي اتحملته
# 2. افتح CMD داخل الفولدر
# 3. ثبت المكتبات:
npm install

# هياخد 2-3 دقايق في أول مرة
```

---

### الخطوة 3.3 — إعداد متغيرات البيئة
```
1. في الفولدر هتلاقي ملف: .env.local.example
2. اعمله Copy وسميه: .env.local
3. افتحه بـ Notepad أو VS Code
4. عدّل القيم دي:
```

```env
# من Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# رابط التطبيق (محلياً)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# اسم مطعمك
NEXT_PUBLIC_RESTAURANT_NAME="مطعم النجمة"
```

**إزاي تلاقي الـ Keys في Supabase:**
```
1. Supabase Dashboard
2. Settings (أسفل الـ Sidebar)
3. API
4. هتلاقي:
   - Project URL ← هو NEXT_PUBLIC_SUPABASE_URL
   - anon public ← هو NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role ← هو SUPABASE_SERVICE_ROLE_KEY (سري!)
```

---

### الخطوة 3.4 — تشغيل الموقع محلياً
```bash
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

---

## 📌 المرحلة 4 — تسجيل دخول كـ Admin

### الخطوة 4.1 — إنشاء أول حساب
```
1. افتح: http://localhost:3000/auth/register
2. سجل بإيميلك وكلمة سر
3. أو استخدم "Continue with Google"
4. هيعملك Account عادي (Customer) في الأول
```

---

### الخطوة 4.2 — ترقية الحساب لـ Admin
```
1. روح Supabase Dashboard
2. SQL Editor → New Query
3. انسخ والصق الكود ده:

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'إيميلك@هنا.com';

4. اضغط Run
5. المفروض يقولك "1 row affected" ✅
```

---

### الخطوة 4.3 — دخول لوحة الإدارة
```
1. Sign out من الموقع
2. Sign in تاني بنفس الحساب
3. روح على: http://localhost:3000/admin
4. هتشوف لوحة الإدارة! 🎉
```

---

## 📌 المرحلة 5 — تخصيص المحتوى

### الخطوة 5.1 — تغيير اسم المطعم والبيانات
```
في Supabase → SQL Editor:

UPDATE public.restaurant_settings SET
  restaurant_name = 'اسم مطعمك هنا',
  tagline = 'أكلات طازجة توصل لبابك',
  delivery_fee = 15.00,
  delivery_time_min = 30,
  delivery_time_max = 60,
  currency_symbol = 'ج.م',
  restaurant_phone = '01012345678',
  restaurant_address = 'العنوان الكامل هنا',
  restaurant_email = 'info@restaurant.com'
WHERE id = 1;
```

---

### الخطوة 5.2 — تعديل المنيو
افتح الملف: `lib/menuData.ts`

```typescript
// ← غير أسماء الأقسام
export const MENU_CATEGORIES = [
  { name: 'مقبلات',    icon: '🥗', sort_order: 1, is_active: true },
  { name: 'برجر',     icon: '🍔', sort_order: 2, is_active: true },
  { name: 'بيتزا',    icon: '🍕', sort_order: 3, is_active: true },
  { name: 'مشويات',   icon: '🥩', sort_order: 4, is_active: true },
  { name: 'مشروبات',  icon: '🥤', sort_order: 5, is_active: true },
  { name: 'حلويات',   icon: '🍰', sort_order: 6, is_active: true },
];

// ← غير الأصناف والأسعار
export const MENU_ITEMS = [
  {
    category: 'برجر',
    name: 'برجر الشيف',           // ← اسم الصنف
    description: 'برجر مزدوج مع جبن وصوص خاص',
    price: 89.99,                  // ← السعر بالجنيه
    image_url: 'https://...',      // ← رابط الصورة
    is_available: true,
    is_featured: true,             // ← يظهر في الصفحة الرئيسية
    tags: ['popular', 'bestseller'],
    prep_time_minutes: 15,
    calories: 650,
    sort_order: 1,
  },
  // ← أضف أصناف جديدة هنا
];
```

---

### الخطوة 5.3 — إضافة الأصناف من لوحة الإدارة (أسهل)
```
1. افتح: http://localhost:3000/admin/menu
2. اضغط "Add Item"
3. اختار القسم
4. اكتب الاسم والسعر والوصف
5. حط رابط الصورة
6. اختار التاجز المناسبة
7. "Add to Menu" ✅
```

---

### الخطوة 5.4 — تغيير الألوان (اختياري)
افتح `tailwind.config.ts` وغير اللون الرئيسي:

```typescript
primary: {
  // ← غير الـ hex ده بلون البراند بتاعك
  // موقع لاختيار اللون: https://uicolors.app/create
  500: '#f77f17',   // البرتقالي الحالي
  // مثال أحمر: '#e53e3e'
  // مثال أخضر: '#38a169'
},
```

---

### الخطوة 5.5 — إضافة أصوات التنبيه
```
1. روح: https://mixkit.co/free-sound-effects/notification/
   أو: https://freesound.org
2. حمل 3 ملفات MP3 صغيرة (أقل من 100KB)
3. سميهم: bell1.mp3, bell2.mp3, bell3.mp3
4. حطهم في فولدر: public/sounds/
```

---

## 📌 المرحلة 6 — الرفع على الإنترنت (Deployment)

### الخطوة 6.1 — رفع الكود على GitHub
```bash
# في CMD داخل فولدر المشروع:
git init
git add .
git commit -m "first commit"
git branch -M main

# روح github.com → New repository
# سميه: restaurant-website
# اضغط Create repository
# انسخ الـ commands اللي بيديهالك وشغلها
```

---

### الخطوة 6.2 — ربط Vercel بـ GitHub
```
1. افتح: https://vercel.com/dashboard
2. "Add New..." → "Project"
3. "Import Git Repository"
4. اختار الـ repository اللي عملته
5. Framework: Next.js (بيكتشفه تلقائي)
6. اضغط "Environment Variables"
7. أضف كل الـ variables من .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   - NEXT_PUBLIC_RESTAURANT_NAME = اسم مطعمك
8. اضغط "Deploy"
9. استنى 2-3 دقايق
10. هتاخد رابط زي: https://restaurant-xyz.vercel.app ✅
```

---

### الخطوة 6.3 — تحديث الـ Redirect URLs بعد الرفع
```
بعد ما تاخد رابط Vercel الحقيقي:

1. في .env.local غير:
   NEXT_PUBLIC_APP_URL=https://restaurant-xyz.vercel.app

2. في Supabase → Authentication → URL Configuration:
   Site URL: https://restaurant-xyz.vercel.app
   Redirect URLs: https://restaurant-xyz.vercel.app/auth/callback

3. في Google Cloud Console → OAuth Credentials:
   أضف Redirect URI:
   https://restaurant-xyz.vercel.app/auth/callback
   (إضافة على الـ localhost مش بدل منه)

4. في Vercel Dashboard → مشروعك → Settings → Environment Variables:
   عدّل NEXT_PUBLIC_APP_URL لنفس رابط Vercel
   اضغط "Redeploy" عشان التغييرات تتطبق
```

---

## 📌 المرحلة 7 — دومين مخصص (اختياري)

### لو عندك دومين زي: www.restaurant.com
```
1. في Vercel → مشروعك → Settings → Domains
2. اضغط "Add Domain"
3. اكتب الدومين بتاعك
4. Vercel هيديك DNS Records تضيفها عند مزود الدومين
5. اضافة A Record و CNAME في لوحة تحكم الدومين
6. في 10-30 دقيقة الدومين يشتغل ✅
```

---

---

# الجزء الثاني: إزاي تسلم الموقع للعميل بشكل احترافي

---

## 📌 ما يحتاجه العميل منك

### البيانات اللازمة من العميل (قبل البدء):
```
✅ اسم المطعم بالعربي والإنجليزي
✅ لوجو (PNG بخلفية شفافة)
✅ صور الأكل (أو بنجيبها من Unsplash)
✅ المنيو الكامل (الأسماء والأسعار)
✅ العنوان وإحداثيات GPS
✅ رقم التيليفون
✅ الإيميل
✅ صفحات السوشيال (Facebook/Instagram)
✅ إيميل الأدمن (اللي هيشتغل على لوحة الإدارة)
✅ سعر التوصيل
✅ أوقات العمل
```

---

## 📌 ملف التسليم الاحترافي

### اعمل PDF أو Word بالمعلومات دي للعميل:

---

## 📄 وثيقة تسليم مشروع الموقع
**للعميل:** [اسم المطعم]
**التاريخ:** [التاريخ]
**المطور:** [اسمك]

---

### 🔑 بيانات الدخول المهمة

| الخدمة | الرابط | الإيميل | كلمة السر |
|--------|--------|---------|-----------|
| الموقع | https://restaurant.vercel.app | - | - |
| لوحة الإدارة | https://restaurant.vercel.app/admin | admin@email.com | ••••••• |
| Supabase | https://supabase.com | email@gmail.com | ••••••• |
| Vercel | https://vercel.com | email@gmail.com | ••••••• |

> ⚠️ **تنبيه:** احتفظ بهذه البيانات في مكان آمن ولا تشاركها مع أحد

---

### 🌐 روابط مهمة

```
الموقع للعملاء:  https://your-restaurant.vercel.app
لوحة الإدارة:   https://your-restaurant.vercel.app/admin
قاعدة البيانات: https://supabase.com/dashboard
```

---

### 📱 كيفية استخدام لوحة الإدارة

**1. الدخول:**
```
اذهب إلى: [رابط الموقع]/admin
أدخل البريد الإلكتروني وكلمة المرور
```

**2. إدارة الطلبات (الأهم):**
```
الطلبات الجديدة → ستسمع صوت تنبيه تلقائياً
اضغط "Accept Order" لقبول الطلب
اضغط "Start Preparing" عندما تبدأ التحضير
اضغط "Mark Ready" عندما يكون جاهزاً
اضغط "Mark Delivered" بعد التوصيل
```

**3. إضافة صنف جديد:**
```
Menu Management → Add Item
أدخل: الاسم، السعر، الوصف، الصورة
اضغط "Add to Menu"
```

**4. إيقاف صنف مؤقتاً:**
```
Menu Management → اضغط أيقونة العين بجانب الصنف
(إيقاف بدون حذف)
```

**5. إغلاق المطعم مؤقتاً:**
```
Settings → Store Status → اضغط على الـ Toggle
```

---

### 🔧 الصيانة الشهرية

| المهمة | كل قد إيه؟ | إزاي |
|--------|-----------|------|
| مراجعة الطلبات | يومي | Admin → Orders |
| تحديث الأسعار | حسب الحاجة | Admin → Menu |
| إضافة أصناف جديدة | حسب الحاجة | Admin → Menu → Add Item |
| نسخ احتياطي | أسبوعي | Supabase → Database → Backups |

---

### 💰 التكاليف الشهرية

| الخدمة | الخطة المجانية تكفي؟ | لو احتجت Upgrade |
|--------|---------------------|-----------------|
| Vercel | ✅ للأغلب (100GB bandwidth) | $20/شهر |
| Supabase | ✅ للأغلب (500MB + 2GB transfer) | $25/شهر |
| دومين مخصص | ❌ مش مجاني | $10-15/سنة |

---

### 🆘 الدعم الفني

```
في حالة أي مشكلة تواصل مع:
الاسم: [اسمك]
واتساب: [رقمك]
إيميل: [إيميلك]
وقت الاستجابة: خلال 24 ساعة
```

---

## 📌 قائمة تسليم العميل (Checklist)

قبل ما تسلم الموقع، تأكد من كل ده:

### ✅ التقني
- [ ] الموقع شغال على الإنترنت
- [ ] لوحة الإدارة بتشتغل
- [ ] تسجيل دخول Google شغال
- [ ] تسجيل دخول Email/Password شغال
- [ ] الطلبات بتتسجل في الداتابيز
- [ ] تنبيه الصوت شغال في الأدمن
- [ ] الخريطة بتشتغل في صفحة الـ Checkout
- [ ] الصور بتظهر
- [ ] الموقع شغال على الموبايل ✓

### ✅ المحتوى
- [ ] اسم المطعم صح
- [ ] المنيو كامل مع الأسعار
- [ ] صور الأكل
- [ ] العنوان والتيليفون
- [ ] إحداثيات الموقع على الخريطة صح
- [ ] ألوان البراند
- [ ] سعر التوصيل

### ✅ الحسابات
- [ ] حساب Admin مفعّل
- [ ] تسليم كل الـ Passwords للعميل
- [ ] شرح إزاي يعمل Sign Out وSign In تاني

---

## 📌 نصائح عشان تحترف في التسليم

### 1. اعمل فيديو شرح بسيط
```
سجل مع Loom (loom.com - مجاني):
- إزاي تقبل طلب جديد
- إزاي تضيف صنف
- إزاي تغير السعر
- إزاي تقفل المطعم وتفتحه
```

### 2. اعمل مجموعة واتساب
```
أنت + العميل + أي أدمن ثاني
عشان يبعتولك أي مشكلة فيها
```

### 3. اتفق على عقد صيانة
```
مثلاً: 200-500 جنيه/شهر مقابل:
- حل المشاكل التقنية
- تحديثات صغيرة
- دعم فني واتساب
```

### 4. قدم التسليم بشكل احترافي
```
❌ بلاش: "خد الـ password وبقى"
✅ الأحسن:
- اجتماع على Zoom أو حضوري
- اعرض الموقع من الأول للآخر
- خليه يجرب يعمل طلب وأنت جنبه
- خليه يقبل الطلب من الأدمن
- سلمه الـ PDF بكل البيانات
```

---

## 📌 الأسئلة الشائعة من العملاء

**س: ممكن أغير الألوان؟**
ج: أيوه، محتاج مطور يغير سطر واحد في `tailwind.config.ts`

**س: ممكن أضيف طريقة دفع أونلاين؟**
ج: أيوه، تحتاج تضيف Stripe أو Fawry — يحتاج تطوير إضافي

**س: الموقع هيشتغل على الموبايل؟**
ج: أيوه، مصمم Responsive يشتغل على كل الشاشات

**س: ممكن عندي أكتر من فرع؟**
ج: النظام الحالي لفرع واحد — ممكن تطوير مستقبلاً

**س: لو نسيت كلمة السر؟**
ج: في صفحة Login في زر "Forgot Password" بيبعت رسالة للإيميل

**س: إيه أقصى عدد طلبات في اليوم؟**
ج: على الخطة المجانية: مئات الطلبات يومياً بدون مشكلة

---

## 📌 جدول الأسعار المقترحة (لو بتشتغل كمطور)

| الخدمة | السعر المقترح |
|--------|-------------|
| إعداد وتخصيص الموقع | 3,000 - 8,000 جنيه |
| الدومين (سنة) | 200 - 500 جنيه |
| الاستضافة (سنة) - مجانية للبداية | 0 جنيه |
| صيانة شهرية | 300 - 800 جنيه/شهر |
| تعديلات إضافية | 200 - 500 جنيه/تعديل |

---

*تم بـ ❤️ — نظام متكامل جاهز للإطلاق 🚀*
