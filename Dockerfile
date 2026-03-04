# استخدم نسخة خفيفة ومستقرة من Node.js (مطابقة لـ Railway)
FROM node:22-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات التعريف أولاً للاستفادة من الـ Caching
COPY package*.json ./
COPY .npmrc ./ 

# تثبيت التبعيات (استخدام --omit=dev للإنتاج)
RUN npm install --omit=dev --legacy-peer-deps

# نسخ باقي ملفات المشروع
COPY . .

# فتح المنفذ الذي يعمل عليه الباك اند
EXPOSE 8000

# أمر تشغيل التطبيق
CMD ["npm", "run", "prod"]