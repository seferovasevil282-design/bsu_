# BSU Chat - Deployment Checklist

## ✅ Tamamlanan Xüsusiyyətlər

### İstifadəçi Qeydiyyatı və Giriş
- [x] @bsu.edu.az email formatı (visual + validation)
- [x] +994XXXXXXXXX telefon formatı (9 rəqəm)
- [x] 16 fakültə doğrulama sualları
- [x] Random 3 sual seçimi
- [x] Minimum 2 düzgün cavab tələbi
- [x] Şifrə sistemi

### Chat Funksiyaları
- [x] 16 fakültə üçün ayrı otaqlar
- [x] Real-time mesajlaşma (Socket.IO)
- [x] Şəxsi mesajlaşma
- [x] Əngəlləmə funksiyası (blocked users)
- [x] Şikayət etmə (16+ = admin panelində)
- [x] Mesaj 3 nöqtə menyusu
- [x] Üfiqi mesaj formatı
- [x] Auto-scroll (yeni mesajlarda)
- [x] Mesaj yazma sahəsi sabit
- [x] Avtomatik filtr sözləri

### Profil Sistemi
- [x] Profil şəkli yükləmə (file upload)
- [x] Profil məlumatları redaktə
- [x] Ad, soyad, fakültə, dərəcə, kurs dəyişdirmə
- [x] Dairəvi profil şəkilləri

### Admin Panel
- [x] Super Admin giriş (ursamajor/ursa618)
- [x] Admin username gizlidir (UI-da görünmür)
- [x] İstifadəçi idarəetmə (aktiv/deaktiv)
- [x] Qaydalar bölməsi (redaktə)
- [x] Günün mövzusu (dəyişmək + real-time yeniləmə)
- [x] Filtr sözləri əlavə/silmə
- [x] Şikayət edilən hesablar (16+)
- [x] Alt adminlər yaratma/silmə (super admin)
- [x] Mesaj avtomatik silinmə (saat konfiqurasiyası)
- [x] İstifadəçi statistikası

### Dizayn
- [x] Gradient background (pink/purple)
- [x] Modern UI komponenetləri
- [x] Yumru künclü mesaj qutuları
- [x] Kölgə və blur effektləri
- [x] Responsive dizayn
- [x] Font Awesome iconları

### Backend
- [x] Node.js + Express
- [x] Socket.IO real-time
- [x] SQLite database
- [x] Bakı saat zonası (UTC+4)
- [x] Multer file upload
- [x] bcryptjs şifrələmə
- [x] CORS konfiqurasiyası

### Deployment
- [x] GitHub repository
- [x] Render.com konfiqurasiyası (render.yaml)
- [x] Build script (build.sh)
- [x] Data qovluğu strukturu
- [x] Environment variables
- [x] Port konfiqurasiyası (process.env.PORT)

## 🔧 Render.com Deploy

### URL:
- GitHub: https://github.com/seferovasevil282-design/bsu_
- Live: https://3000-in59tzi9zsjamkowclxzl-3844e1b6.sandbox.novita.ai (sandbox test)

### Deploy Addımları:
1. Render.com → New Web Service
2. Connect GitHub: `seferovasevil282-design/bsu_`
3. Build Command: `./build.sh`
4. Start Command: `npm start`
5. Auto-Deploy: Yes
6. Deploy!

### Environment Variables (Render.yaml-da konfiqurasiya olunub):
- NODE_ENV=production
- PORT=10000 (Render avtomatik təyin edər)

## ⚠️ Qeydlər

### Render Free Plan:
- Persistent disk yoxdur (restart = data loss)
- 15 dəqiqə inactivity = sleep mode
- Cold start yavaş ola bilər

### Production Tövsiyələri:
- Paid plan istifadə edin
- External database (PostgreSQL/MySQL)
- File storage (AWS S3/Cloudflare R2)
- Monitoring (Sentry, LogRocket)

## 🎯 Test Checklist

- [ ] Qeydiyyat işləyir (@bsu.edu.az + +994)
- [ ] Doğrulama sualları işləyir (3 sual, 2 düzgün)
- [ ] Login işləyir
- [ ] Chat otaqları açılır
- [ ] Real-time mesajlar göndərilir
- [ ] Şəxsi chat işləyir
- [ ] Əngəlləmə işləyir
- [ ] Profil şəkli yüklənir
- [ ] Admin panel açılır (ursamajor/ursa618)
- [ ] Admin username görünmür
- [ ] İstifadəçi deaktiv edilir
- [ ] Qaydalar dəyişilir
- [ ] Günün mövzusu dəyişilir
- [ ] Filtr sözləri əlavə edilir
- [ ] Socket.IO bağlantısı işləyir

## ✅ Layihə Hazırdır!

Bütün tələblər yerinə yetirilib və layihə Render.com-da deploy edilməyə hazırdır.
