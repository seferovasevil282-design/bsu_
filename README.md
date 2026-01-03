# BSU Chat - Bakı Dövlət Universiteti Tələbə Chat Platforması

## 📋 Layihə Haqqında
BSU Chat - Bakı Dövlət Universiteti tələbələri üçün real-time mesajlaşma platformasıdır. Tələbələr öz fakültələrinə uyğun qrup chat otaqlarında ünsiyyət qura və şəxsi mesajlaşma apara bilərlər.

## ✨ Xüsusiyyətlər

### İstifadəçi Funksiyaları:
- ✅ @bsu.edu.az email ilə qeydiyyat
- ✅ +994 telefon nömrəsi formatı
- ✅ Fakültə doğrulama sualları (minimum 2/3 düzgün cavab)
- ✅ 16 fakültə üçün ayrı chat otaqları
- ✅ Real-time mesajlaşma (Socket.IO)
- ✅ Şəxsi mesajlaşma
- ✅ İstifadəçiləri əngəlləmə
- ✅ İstifadəçiləri şikayət etmə
- ✅ Profil şəkli yükləmə
- ✅ Profil məlumatlarını dəyişdirmə
- ✅ Avtomatik filtr sözləri

### Admin Funksiyaları:
- ✅ Super Admin (username: ursamajor, password: ursa618)
- ✅ İstifadəçi idarəetmə (aktiv/deaktiv)
- ✅ Qaydaları yeniləmə
- ✅ Günün mövzusunu dəyişdirmə
- ✅ Filtr sözləri əlavə/silmə
- ✅ Şikayət edilən hesabları görüntüləmə (16+ şikayət)
- ✅ Alt adminlər yaratma/silmə
- ✅ Mesaj silinmə vaxtını konfiqurasiya

## 🏗️ Texnologi Stack
- **Backend**: Node.js + Express + Socket.IO
- **Database**: SQLite3
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Authentication**: bcryptjs

## 📁 Fakültələr
1. Mexanika-riyaziyyat fakültəsi
2. Tətbiqi riyaziyyat və kibernetika fakültəsi
3. Fizika fakültəsi
4. Kimya fakültəsi
5. Biologiya fakültəsi
6. Ekologiya və torpaqşünaslıq fakültəsi
7. Coğrafiya fakültəsi
8. Geologiya fakültəsi
9. Filologiya fakültəsi
10. Tarix fakültəsi
11. Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi
12. Hüquq fakültəsi
13. Jurnalistika fakültəsi
14. İnformasiya və sənəd menecmenti fakültəsi
15. Şərqşünaslıq fakültəsi
16. Sosial elmlər və psixologiya fakültəsi

## 🚀 Quraşdırma və İstifadə

### Local Development:
```bash
npm install
npm start
```

Server http://localhost:3000 ünvanında işə düşəcək.

### 🌐 Live Demo:
**Test URL**: https://3000-in59tzi9zsjamkowclxzl-3844e1b6.sandbox.novita.ai

### 📍 GitHub Repository:
**Repo**: https://github.com/seferovasevil282-design/bsu_

### Render.com Deployment:

**Addım-addım təlimat:**

1. **Render.com hesabı yaradın**: https://render.com
2. **Dashboard-a gedin** və **"New +"** düyməsinə basın
3. **"Web Service"** seçin
4. **Connect GitHub repository**:
   - Repository: `https://github.com/seferovasevil282-design/bsu_`
   - Branch: `main`
5. **Service konfiqurasiyası**:
   - **Name**: `bsu-chat` (və ya istədiyiniz ad)
   - **Region**: Seçin (Frankfurt tövsiyə olunur)
   - **Branch**: `main`
   - **Root Directory**: boş buraxın
   - **Environment**: `Node`
   - **Build Command**: `./build.sh`
   - **Start Command**: `npm start`
6. **Advanced Settings**:
   - **Auto-Deploy**: `Yes` (avtomatik deploy üçün)
7. **Environment Variables** (əlavə etmək lazım deyil, render.yaml konfiqurasiya edir):
   - `NODE_ENV=production` (avtomatik)
   - `PORT=10000` (avtomatik)
8. **"Create Web Service"** düyməsinə basın
9. **Deploy başlayacaq** (3-5 dəqiqə çəkəcək)
10. **URL əldə edin**: Deploy bitdikdən sonra URL verilir (məs: https://bsu-chat.onrender.com)

**Render üçün Əlavə Qeydlər:**
- ✅ SQLite database avtomatik yaradılacaq (`data/database.db`)
- ✅ Uploads qovluğu avtomatik yaradılacaq
- ✅ Socket.IO real-time bağlantılar işləyəcək
- ✅ İlk deploy 3-5 dəqiqə çəkə bilər
- ⚠️ Free plan: 15 dəqiqə inactivity-dən sonra sleep mode (ilk request yavaş ola bilər)
- ⚠️ Free plan: Persistent disk yoxdur, restart zamanı data silinə bilər
- 💡 Production üçün: Paid plan və ya external database (PostgreSQL) tövsiyə olunur

**Troubleshooting:**
- Deploy uğursuz olarsa: Logs-a baxın (Render Dashboard → Logs)
- Database error: Permissions yoxlanılsın
- Socket.IO error: CORS konfiqurasiyası düzdür, problem yoxdur
- Port error: Render avtomatik PORT assign edir

## 🔐 Super Admin Girişi
- **İstifadəçi adı**: ursamajor
- **Şifrə**: ursa618

## 📊 Database Strukturu
- users - İstifadəçilər
- admins - Adminlər
- messages - Qrup mesajları
- private_messages - Şəxsi mesajlar
- blocked_users - Əngəllənmiş istifadəçilər
- reports - Şikayətlər
- filter_words - Filtr sözləri
- rules - Qaydalar
- daily_topic - Günün mövzusu
- message_config - Mesaj konfiqurasiyası

## ⏰ Bakı Saat Zonası
Bütün tarix/saat məlumatları Bakı saat zonasına (UTC+4) uyğun olaraq saxlanılır və göstərilir.

## 📝 Lisenziya
MIT

## 👨‍💻 Müəllif
BSU Chat Development Team

## 📞 Əlaqə
Bu layihə haqqında suallarınız varsa, bizə müraciət edə bilərsiniz.
