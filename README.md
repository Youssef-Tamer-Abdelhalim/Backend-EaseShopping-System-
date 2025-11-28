# 🛒 EaseShopping E-Commerce API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

**RESTful API متكاملة لمتجر إلكتروني مبنية باستخدام Node.js و Express.js و MongoDB**

[المميزات](#-المميزات) •
[التثبيت](#-التثبيت) •
[الـ API](#-الـ-api-endpoints) •
[المساهمة](#-المساهمة)

</div>

---

## 📋 نظرة عامة

EaseShopping هو نظام API متكامل لإدارة متجر إلكتروني يوفر جميع الخدمات الأساسية مثل:

- إدارة المستخدمين والمصادقة
- إدارة المنتجات والتصنيفات والعلامات التجارية
- سلة التسوق والطلبات
- نظام التقييمات والمراجعات
- الدفع الإلكتروني عبر Stripe
- وأكثر...

---

## ✨ المميزات

### 🔐 المصادقة والأمان

- تسجيل المستخدمين وتسجيل الدخول باستخدام JWT
- نظام استعادة كلمة المرور عبر البريد الإلكتروني
- التحقق من صلاحيات المستخدم (User, Manager, Admin)
- Rate Limiting للحماية من هجمات DDoS
- CORS Security مع دعم Origins متعددة
- Security Headers للحماية من الهجمات الشائعة

### 🛍️ إدارة المنتجات

- CRUD كامل للمنتجات مع دعم الصور المتعددة
- تصنيفات رئيسية وفرعية
- العلامات التجارية (Brands)
- نظام البحث والفلترة المتقدم
- Pagination مع دعم الترتيب

### 🛒 التسوق

- سلة تسوق متكاملة
- قائمة الأمنيات (Wishlist)
- كوبونات الخصم
- إدارة العناوين

### 💳 الطلبات والدفع

- إنشاء الطلبات
- الدفع نقداً أو إلكترونياً عبر Stripe
- Stripe Webhooks للتحقق من الدفع
- تتبع حالة الطلب والتوصيل

### ⭐ التقييمات

- نظام تقييم المنتجات
- حساب متوسط التقييمات تلقائياً

---

## 🛠️ التقنيات المستخدمة

| التقنية               | الوصف                   |
| --------------------- | ----------------------- |
| **Node.js**           | بيئة تشغيل JavaScript   |
| **Express.js 5**      | إطار عمل الويب          |
| **MongoDB**           | قاعدة البيانات          |
| **Mongoose**          | ODM لـ MongoDB          |
| **JWT**               | المصادقة                |
| **Bcrypt.js**         | تشفير كلمات المرور      |
| **Stripe**            | بوابة الدفع             |
| **Multer**            | رفع الملفات             |
| **Sharp**             | معالجة الصور            |
| **Nodemailer**        | إرسال البريد الإلكتروني |
| **Express Validator** | التحقق من البيانات      |

---

## 📦 التثبيت

### المتطلبات المسبقة

- Node.js (v18+)
- MongoDB
- حساب Stripe (للدفع الإلكتروني)
- حساب SMTP (لإرسال الإيميلات - مثل Brevo)

### خطوات التثبيت

1. **Clone المشروع**

```bash
git clone https://github.com/Youssef-Tamer-Abdelhalim/Backend-EaseShopping-System-.git
cd Backend-EaseShopping-System-
```

2. **تثبيت الـ Dependencies**

```bash
npm install
```

3. **إعداد ملف Environment**

```bash
# نسخ ملف المثال
cp .env.example .env
```

4. **تعديل ملف `.env`**

```env
PORT=8000
NODE_ENV=development

BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# MongoDB Connection
DB_URI=mongodb://localhost:27017/easeshopping
# أو استخدم MongoDB Atlas:
# DB_URI=mongodb+srv://username:password@cluster.mongodb.net/easeshopping

# CORS - أضف origins مسموح بها
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT
JWT_SECRET_KEY=your_super_secret_key_here_make_it_long_and_random
JWT_EXPIRE_TIME=90d

# Email (SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_smtp_password

# Stripe
STRIPE_SECRET=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

5. **تشغيل المشروع**

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm run prod
```

---

## 🗂️ هيكل المشروع

```
├── config/
│   └── database.js          # إعدادات قاعدة البيانات
├── middleware/
│   ├── corsMiddleware.js    # إعدادات CORS والأمان
│   ├── errorMiddleware.js   # معالجة الأخطاء
│   ├── uploadImageMiddleware.js  # رفع الصور
│   └── validatorMiddleWare.js    # التحقق من البيانات
├── models/
│   ├── userModel.js         # نموذج المستخدم
│   ├── productModel.js      # نموذج المنتج
│   ├── categoryModel.js     # نموذج التصنيف
│   ├── brandModel.js        # نموذج العلامة التجارية
│   ├── cartModel.js         # نموذج سلة التسوق
│   ├── orderModel.js        # نموذج الطلب
│   ├── reviewModel.js       # نموذج التقييم
│   ├── couponModel.js       # نموذج الكوبون
│   └── supCategoryModel.js  # نموذج التصنيف الفرعي
├── routes/
│   ├── index.js             # تجميع كل الـ Routes
│   ├── authRoute.js         # مسارات المصادقة
│   ├── userRoute.js         # مسارات المستخدمين
│   ├── productRoute.js      # مسارات المنتجات
│   ├── categoryRoute.js     # مسارات التصنيفات
│   ├── brandRoute.js        # مسارات العلامات التجارية
│   ├── cartRoute.js         # مسارات سلة التسوق
│   ├── orderRoute.js        # مسارات الطلبات
│   └── ...                  # باقي المسارات
├── services/
│   ├── authServices.js      # خدمات المصادقة
│   ├── userServices.js      # خدمات المستخدمين
│   ├── productServices.js   # خدمات المنتجات
│   ├── orderServices.js     # خدمات الطلبات
│   ├── handlersFactroy.js   # Factory للعمليات المشتركة
│   └── ...                  # باقي الخدمات
├── utils/
│   ├── apiError.js          # Custom Error Class
│   ├── apiFeatures.js       # Filter, Sort, Paginate
│   ├── generateToken.js     # إنشاء JWT Token
│   ├── sendEmail.js         # إرسال البريد الإلكتروني
│   └── validator/           # Validators للبيانات
├── uploads/                 # مجلد الصور المرفوعة
├── server.js                # نقطة البداية
└── package.json
```

---

## 🔗 الـ API Endpoints

### Base URL

```
http://localhost:8000/api/v1
```

### 🔐 Auth

| Method | Endpoint                | الوصف                       |
| ------ | ----------------------- | --------------------------- |
| POST   | `/auth/signup`          | تسجيل مستخدم جديد           |
| POST   | `/auth/login`           | تسجيل الدخول                |
| POST   | `/auth/forgetpassword`  | طلب إعادة تعيين كلمة المرور |
| POST   | `/auth/verifyresetcode` | التحقق من كود الإعادة       |
| PUT    | `/auth/resetpassword`   | إعادة تعيين كلمة المرور     |

### 👤 Users

| Method | Endpoint                  | الوصف                      | الصلاحية |
| ------ | ------------------------- | -------------------------- | -------- |
| GET    | `/users`                  | جلب كل المستخدمين          | Admin    |
| GET    | `/users/:id`              | جلب مستخدم بالـ ID         | Admin    |
| POST   | `/users`                  | إنشاء مستخدم               | Admin    |
| PUT    | `/users/:id`              | تعديل مستخدم               | Admin    |
| DELETE | `/users/:id`              | حذف مستخدم                 | Admin    |
| GET    | `/users/getMe`            | جلب بيانات المستخدم الحالي | User     |
| PUT    | `/users/updateMe`         | تعديل بياناتي              | User     |
| PUT    | `/users/updateMyPassword` | تغيير كلمة المرور          | User     |
| DELETE | `/users/deleteMe`         | حذف حسابي                  | User     |

### 📦 Products

| Method | Endpoint        | الوصف            | الصلاحية      |
| ------ | --------------- | ---------------- | ------------- |
| GET    | `/products`     | جلب كل المنتجات  | Public        |
| GET    | `/products/:id` | جلب منتج بالـ ID | Public        |
| POST   | `/products`     | إنشاء منتج       | Manager/Admin |
| PUT    | `/products/:id` | تعديل منتج       | Manager/Admin |
| DELETE | `/products/:id` | حذف منتج         | Admin         |

### 📂 Categories

| Method | Endpoint          | الوصف             | الصلاحية      |
| ------ | ----------------- | ----------------- | ------------- |
| GET    | `/categories`     | جلب كل التصنيفات  | Public        |
| GET    | `/categories/:id` | جلب تصنيف بالـ ID | Public        |
| POST   | `/categories`     | إنشاء تصنيف       | Manager/Admin |
| PUT    | `/categories/:id` | تعديل تصنيف       | Manager/Admin |
| DELETE | `/categories/:id` | حذف تصنيف         | Admin         |

### 🛒 Cart

| Method | Endpoint               | الوصف             | الصلاحية |
| ------ | ---------------------- | ----------------- | -------- |
| GET    | `/my-cart`             | جلب سلة التسوق    | User     |
| POST   | `/my-cart`             | إضافة منتج للسلة  | User     |
| DELETE | `/my-cart`             | تفريغ السلة       | User     |
| PATCH  | `/my-cart/:itemId`     | تعديل الكمية      | User     |
| DELETE | `/my-cart/:itemId`     | حذف منتج من السلة | User     |
| PATCH  | `/my-cart/applyCoupon` | تطبيق كوبون       | User     |

### 📋 Orders

| Method | Endpoint                           | الوصف                 | الصلاحية           |
| ------ | ---------------------------------- | --------------------- | ------------------ |
| GET    | `/orders`                          | جلب طلباتي            | User/Manager/Admin |
| POST   | `/orders/:cartId`                  | إنشاء طلب (نقدي)      | User               |
| POST   | `/orders/checkout-session/:cartId` | إنشاء جلسة دفع Stripe | User               |
| GET    | `/orders/:id`                      | جلب طلب بالـ ID       | Manager/Admin      |
| PATCH  | `/orders/:id/pay`                  | تحديث حالة الدفع      | Manager/Admin      |
| PATCH  | `/orders/:id/deliver`              | تحديث حالة التوصيل    | Manager/Admin      |

> 📄 **للتفاصيل الكاملة:** راجع ملف `FRONTEND_API_DOCS.md`

---

## 🔒 الأمان

- ✅ تشفير كلمات المرور باستخدام Bcrypt
- ✅ JWT للمصادقة مع انتهاء الصلاحية
- ✅ Rate Limiting (100 طلب كل 15 دقيقة)
- ✅ CORS مع whitelist للـ origins
- ✅ Security Headers (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ التحقق من صلاحيات المستخدم (Role-based Access Control)
- ✅ حماية Webhooks

---

## 🧪 تشغيل Seeder

لملء قاعدة البيانات ببيانات تجريبية:

```bash
# إضافة البيانات
node utils/dummyData/seeder.js -i

# حذف البيانات
node utils/dummyData/seeder.js -d
```

---

## 📝 متغيرات البيئة

| المتغير                 | الوصف                | مثال                           |
| ----------------------- | -------------------- | ------------------------------ |
| `PORT`                  | رقم البورت           | `8000`                         |
| `NODE_ENV`              | بيئة التشغيل         | `development` / `production`   |
| `BASE_URL`              | رابط الـ API         | `http://localhost:8000`        |
| `FRONTEND_URL`          | رابط الـ Frontend    | `http://localhost:3000`        |
| `DB_URI`                | رابط MongoDB         | `mongodb://localhost:27017/db` |
| `CORS_ORIGINS`          | الـ Origins المسموحة | `http://localhost:3000`        |
| `JWT_SECRET_KEY`        | مفتاح JWT السري      | -                              |
| `JWT_EXPIRE_TIME`       | مدة صلاحية Token     | `90d`                          |
| `EMAIL_HOST`            | سيرفر SMTP           | `smtp-relay.brevo.com`         |
| `EMAIL_PORT`            | بورت SMTP            | `587`                          |
| `EMAIL_USER`            | بريد SMTP            | -                              |
| `EMAIL_PASS`            | كلمة مرور SMTP       | -                              |
| `STRIPE_SECRET`         | مفتاح Stripe السري   | `sk_test_...`                  |
| `STRIPE_WEBHOOK_SECRET` | مفتاح Webhook        | `whsec_...`                    |

---

## 🚀 Deployment

### Railway / Render / Heroku

1. أنشئ مشروع جديد
2. اربط الـ Repository
3. أضف متغيرات البيئة
4. غيّر `NODE_ENV` إلى `production`
5. تأكد من إضافة `CORS_ORIGINS` الصحيحة

### Stripe Webhooks

في Production، أضف Webhook URL:

```
https://your-domain.com/webhook-checkout
```

---

## 👥 الأدوار والصلاحيات

| الدور       | الصلاحيات                               |
| ----------- | --------------------------------------- |
| **User**    | التصفح، الشراء، التقييم، إدارة الحساب   |
| **Manager** | + إدارة المنتجات والتصنيفات             |
| **Admin**   | + إدارة المستخدمين، الحذف، كل الصلاحيات |

---

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ Branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ Branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---

## 📄 الرخصة

ISC License

---

## 👨‍💻 المطور

**Youssef Tamer Abdelhalim**

- GitHub: [@Youssef-Tamer-Abdelhalim](https://github.com/Youssef-Tamer-Abdelhalim)

---

<div align="center">

⭐ **إذا أعجبك المشروع، لا تنسى تعمل Star!** ⭐

</div>
