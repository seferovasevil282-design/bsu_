require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Upload konfiqurasiyası
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Uploads qovluğunu yarat
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Bakı saat zonası (UTC+4)
function getBakuTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bakuTime = new Date(utc + (3600000 * 4));
  return bakuTime.toISOString();
}

// Doğrulama sualları
const verificationQuestions = [
  { question: "Mexanika-riyaziyyat fakültəsi hansı korpusda yerləşir?", answer: "3", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Tətbiqi riyaziyyat və kibernetika fakültəsi hansı korpusda yerləşir?", answer: "3", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Fizika fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Kimya fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Biologiya fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Ekologiya və torpaqşünaslıq fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Coğrafiya fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Geologiya fakültəsi hansı korpusda yerləşir?", answer: "Əsas korpus", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Filologiya fakültəsi hansı korpusda yerləşir?", answer: "1", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Tarix fakültəsi hansı korpusda yerləşir?", answer: "3", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi hansı korpusda yerləşir?", answer: "1", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Hüquq fakültəsi hansı korpusda yerləşir?", answer: "1", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Jurnalistika fakültəsi hansı korpusda yerləşir?", answer: "2", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "İnformasiya və sənəd menecmenti fakültəsi hansı korpusda yerləşir?", answer: "2", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Şərqşünaslıq fakültəsi hansı korpusda yerləşir?", answer: "2", options: ["1", "2", "3", "Əsas korpus"] },
  { question: "Sosial elmlər və psixologiya fakültəsi hansı korpusda yerləşir?", answer: "2", options: ["1", "2", "3", "Əsas korpus"] }
];

// Fakültələr
const faculties = [
  "Mexanika-riyaziyyat fakültəsi",
  "Tətbiqi riyaziyyat və kibernetika fakültəsi",
  "Fizika fakültəsi",
  "Kimya fakültəsi",
  "Biologiya fakültəsi",
  "Ekologiya və torpaqşünaslıq fakültəsi",
  "Coğrafiya fakültəsi",
  "Geologiya fakültəsi",
  "Filologiya fakültəsi",
  "Tarix fakültəsi",
  "Beynəlxalq münasibətlər və iqtisadiyyat fakültəsi",
  "Hüquq fakültəsi",
  "Jurnalistika fakültəsi",
  "İnformasiya və sənəd menecmenti fakültəsi",
  "Şərqşünaslıq fakültəsi",
  "Sosial elmlər və psixologiya fakültəsi"
];

// API Routes

// Doğrulama suallarını al
app.get('/api/verification-questions', (req, res) => {
  const shuffled = [...verificationQuestions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  res.json(selected);
});

// Qeydiyyat
app.post('/api/register', async (req, res) => {
  try {
    const { email, phone, password, fullname, faculty, degree, course, answers } = req.body;

    // Validation
    if (!email.endsWith('@bsu.edu.az')) {
      return res.status(400).json({ error: 'Email @bsu.edu.az ilə bitməlidir' });
    }

    if (!phone.startsWith('+994') || phone.length !== 13) {
      return res.status(400).json({ error: 'Nömrə +994 ilə başlamalı və 13 simvoldan ibarət olmalıdır' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existingUser) {
      if (!existingUser.is_active) {
        return res.status(403).json({ error: 'Bu hesab deaktiv edilib' });
      }
      return res.status(400).json({ error: 'Bu email və ya nömrə artıq qeydiyyatdan keçib' });
    }

    // Verify answers (minimum 2 correct out of 3)
    let correctCount = 0;
    if (answers && Array.isArray(answers)) {
      answers.forEach(answer => {
        const question = verificationQuestions.find(q => q.question === answer.question);
        if (question && question.answer === answer.answer) {
          correctCount++;
        }
      });
    }

    if (correctCount < 2) {
      return res.status(400).json({ error: 'Minimum 2 sualı düzgün cavablamalısınız' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, phone, password, fullname, faculty, degree, course) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, phone, hashedPassword, fullname, faculty, degree, course]
    );

    res.json({ success: true, userId: result.id });
  } catch (error) {
    console.error('Qeydiyyat xətası:', error);
    res.status(500).json({ error: 'Qeydiyyat zamanı xəta baş verdi' });
  }
});

// Giriş
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Email və ya şifrə yanlışdır' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Hesabınız deaktiv edilib' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Email və ya şifrə yanlışdır' });
    }

    // Remove password from response
    delete user.password;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Giriş xətası:', error);
    res.status(500).json({ error: 'Giriş zamanı xəta baş verdi' });
  }
});

// Admin girişi
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    if (!admin) {
      return res.status(400).json({ error: 'İstifadəçi adı və ya şifrə yanlışdır' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'İstifadəçi adı və ya şifrə yanlışdır' });
    }

    delete admin.password;
    res.json({ success: true, admin });
  } catch (error) {
    console.error('Admin giriş xətası:', error);
    res.status(500).json({ error: 'Giriş zamanı xəta baş verdi' });
  }
});

// Profil şəkli yüklə
app.post('/api/upload-profile-picture', upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fayl seçilməyib' });
    }

    const userId = req.body.userId;
    const filePath = `/uploads/${req.file.filename}`;

    await db.run('UPDATE users SET profile_picture = ? WHERE id = ?', [filePath, userId]);

    res.json({ success: true, filePath });
  } catch (error) {
    console.error('Fayl yüklənmə xətası:', error);
    res.status(500).json({ error: 'Fayl yüklənmə zamanı xəta baş verdi' });
  }
});

// Profil məlumatlarını yenilə
app.post('/api/update-profile', async (req, res) => {
  try {
    const { userId, fullname, faculty, degree, course } = req.body;

    await db.run(
      'UPDATE users SET fullname = ?, faculty = ?, degree = ?, course = ? WHERE id = ?',
      [fullname, faculty, degree, course, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Profil yeniləmə xətası:', error);
    res.status(500).json({ error: 'Profil yeniləmə zamanı xəta baş verdi' });
  }
});

// İstifadəçini əngəllə
app.post('/api/block-user', async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;

    await db.run(
      'INSERT OR IGNORE INTO blocked_users (user_id, blocked_user_id) VALUES (?, ?)',
      [userId, blockedUserId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Əngəlləmə xətası:', error);
    res.status(500).json({ error: 'Əngəlləmə zamanı xəta baş verdi' });
  }
});

// İstifadəçini şikayət et
app.post('/api/report-user', async (req, res) => {
  try {
    const { reporterId, reportedUserId } = req.body;

    await db.run(
      'INSERT INTO reports (reporter_id, reported_user_id) VALUES (?, ?)',
      [reporterId, reportedUserId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Şikayət xətası:', error);
    res.status(500).json({ error: 'Şikayət zamanı xəta baş verdi' });
  }
});

// Əngəllənmiş istifadəçiləri al
app.get('/api/blocked-users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const blockedUsers = await db.all('SELECT blocked_user_id FROM blocked_users WHERE user_id = ?', [userId]);
    res.json(blockedUsers.map(b => b.blocked_user_id));
  } catch (error) {
    console.error('Əngəllənmiş istifadəçilər xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Qaydaları al
app.get('/api/rules', async (req, res) => {
  try {
    const rules = await db.get('SELECT content FROM rules WHERE id = 1');
    res.json({ content: rules ? rules.content : '' });
  } catch (error) {
    console.error('Qaydalar xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Günün mövzusunu al
app.get('/api/daily-topic', async (req, res) => {
  try {
    const topic = await db.get('SELECT topic FROM daily_topic WHERE id = 1');
    res.json({ topic: topic ? topic.topic : '' });
  } catch (error) {
    console.error('Günün mövzusu xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Filtr sözlərini al
app.get('/api/filter-words', async (req, res) => {
  try {
    const words = await db.all('SELECT word FROM filter_words');
    res.json(words.map(w => w.word));
  } catch (error) {
    console.error('Filtr sözləri xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Admin API Routes

// Bütün istifadəçiləri al
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, email, phone, fullname, faculty, degree, course, profile_picture, is_active, created_at FROM users ORDER BY id DESC');
    res.json(users);
  } catch (error) {
    console.error('İstifadəçilər xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// İstifadəçini aktiv/deaktiv et
app.post('/api/admin/toggle-user', async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    await db.run('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('İstifadəçi toggle xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Qaydaları yenilə
app.post('/api/admin/update-rules', async (req, res) => {
  try {
    const { content } = req.body;
    await db.run('UPDATE rules SET content = ?, updated_at = ? WHERE id = 1', [content, getBakuTime()]);
    res.json({ success: true });
  } catch (error) {
    console.error('Qaydalar yeniləmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Günün mövzusunu yenilə
app.post('/api/admin/update-daily-topic', async (req, res) => {
  try {
    const { topic } = req.body;
    await db.run('UPDATE daily_topic SET topic = ?, updated_at = ? WHERE id = 1', [topic, getBakuTime()]);
    io.emit('daily-topic-updated', { topic });
    res.json({ success: true });
  } catch (error) {
    console.error('Günün mövzusu yeniləmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Filtr söz əlavə et
app.post('/api/admin/add-filter-word', async (req, res) => {
  try {
    const { word } = req.body;
    await db.run('INSERT OR IGNORE INTO filter_words (word) VALUES (?)', [word]);
    res.json({ success: true });
  } catch (error) {
    console.error('Filtr söz əlavə etmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Filtr söz sil
app.post('/api/admin/remove-filter-word', async (req, res) => {
  try {
    const { word } = req.body;
    await db.run('DELETE FROM filter_words WHERE word = ?', [word]);
    res.json({ success: true });
  } catch (error) {
    console.error('Filtr söz silmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Şikayət edilən hesabları al
app.get('/api/admin/reported-users', async (req, res) => {
  try {
    const reportedUsers = await db.all(`
      SELECT 
        u.id, u.email, u.phone, u.fullname, u.faculty, u.degree, u.course,
        COUNT(r.id) as report_count
      FROM users u
      INNER JOIN reports r ON u.id = r.reported_user_id
      GROUP BY u.id
      HAVING report_count >= 16
      ORDER BY report_count DESC
    `);
    res.json(reportedUsers);
  } catch (error) {
    console.error('Şikayət edilən hesablar xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Alt admin əlavə et (yalnız super admin)
app.post('/api/admin/add-sub-admin', async (req, res) => {
  try {
    const { username, password, isSuperAdmin } = req.body;

    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Yalnız super admin alt admin əlavə edə bilər' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO admins (username, password, is_super_admin) VALUES (?, ?, 0)', [username, hashedPassword]);
    res.json({ success: true });
  } catch (error) {
    console.error('Alt admin əlavə etmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Alt adminləri al
app.get('/api/admin/sub-admins', async (req, res) => {
  try {
    const admins = await db.all('SELECT id, username, is_super_admin, created_at FROM admins WHERE is_super_admin = 0');
    res.json(admins);
  } catch (error) {
    console.error('Alt adminlər xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Alt admin sil
app.post('/api/admin/delete-sub-admin', async (req, res) => {
  try {
    const { adminId, isSuperAdmin } = req.body;

    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Yalnız super admin alt admin silə bilər' });
    }

    await db.run('DELETE FROM admins WHERE id = ? AND is_super_admin = 0', [adminId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Alt admin silmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Mesaj konfiqurasiyasını al
app.get('/api/admin/message-config', async (req, res) => {
  try {
    const config = await db.get('SELECT * FROM message_config WHERE id = 1');
    res.json(config);
  } catch (error) {
    console.error('Mesaj konfiqurasiyası xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Mesaj konfiqurasiyasını yenilə
app.post('/api/admin/update-message-config', async (req, res) => {
  try {
    const { groupMessageHours, privateMessageHours } = req.body;
    await db.run(
      'UPDATE message_config SET group_message_hours = ?, private_message_hours = ?, updated_at = ? WHERE id = 1',
      [groupMessageHours, privateMessageHours, getBakuTime()]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mesaj konfiqurasiyası yeniləmə xətası:', error);
    res.status(500).json({ error: 'Xəta baş verdi' });
  }
});

// Köhnə mesajları sil (cron job kimi işlətmək üçün)
async function deleteOldMessages() {
  try {
    const config = await db.get('SELECT * FROM message_config WHERE id = 1');
    
    // Qrup mesajlarını sil
    const groupCutoff = new Date(Date.now() - config.group_message_hours * 60 * 60 * 1000).toISOString();
    await db.run('DELETE FROM messages WHERE created_at < ?', [groupCutoff]);
    
    // Şəxsi mesajları sil
    const privateCutoff = new Date(Date.now() - config.private_message_hours * 60 * 60 * 1000).toISOString();
    await db.run('DELETE FROM private_messages WHERE created_at < ?', [privateCutoff]);
    
    console.log('✅ Köhnə mesajlar silindi');
  } catch (error) {
    console.error('Köhnə mesajlar silinmə xətası:', error);
  }
}

// Hər saat köhnə mesajları sil
setInterval(deleteOldMessages, 60 * 60 * 1000);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Yeni istifadəçi bağlandı:', socket.id);

  // Fakültə otağına qoşul
  socket.on('join-faculty', async (data) => {
    const { userId, faculty } = data;
    socket.join(faculty);
    socket.userId = userId;
    socket.faculty = faculty;

    // Köhnə mesajları göndər
    const messages = await db.all(`
      SELECT m.*, u.fullname, u.profile_picture, u.faculty, u.degree, u.course
      FROM messages m
      INNER JOIN users u ON m.user_id = u.id
      WHERE m.faculty = ?
      ORDER BY m.created_at ASC
    `, [faculty]);

    socket.emit('previous-messages', messages);
  });

  // Qrup mesajı göndər
  socket.on('send-message', async (data) => {
    try {
      const { userId, faculty, message } = data;

      // Filtr sözlərini al
      const filterWords = await db.all('SELECT word FROM filter_words');
      let filteredMessage = message;
      filterWords.forEach(fw => {
        const regex = new RegExp(fw.word, 'gi');
        filteredMessage = filteredMessage.replace(regex, '*'.repeat(fw.word.length));
      });

      // Mesajı saxla
      const result = await db.run(
        'INSERT INTO messages (user_id, faculty, message, created_at) VALUES (?, ?, ?, ?)',
        [userId, faculty, filteredMessage, getBakuTime()]
      );

      // İstifadəçi məlumatlarını al
      const user = await db.get('SELECT fullname, profile_picture, faculty, degree, course FROM users WHERE id = ?', [userId]);

      const messageData = {
        id: result.id,
        user_id: userId,
        faculty,
        message: filteredMessage,
        created_at: getBakuTime(),
        fullname: user.fullname,
        profile_picture: user.profile_picture,
        degree: user.degree,
        course: user.course
      };

      io.to(faculty).emit('new-message', messageData);
    } catch (error) {
      console.error('Mesaj göndərmə xətası:', error);
    }
  });

  // Şəxsi mesaj göndər
  socket.on('send-private-message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      // Əngəlləmə yoxla
      const isBlocked = await db.get(
        'SELECT * FROM blocked_users WHERE (user_id = ? AND blocked_user_id = ?) OR (user_id = ? AND blocked_user_id = ?)',
        [senderId, receiverId, receiverId, senderId]
      );

      if (isBlocked) {
        socket.emit('message-error', { error: 'Bu istifadəçi sizi əngəlləyib və ya siz onu əngəlləyibsiniz' });
        return;
      }

      // Filtr sözlərini al
      const filterWords = await db.all('SELECT word FROM filter_words');
      let filteredMessage = message;
      filterWords.forEach(fw => {
        const regex = new RegExp(fw.word, 'gi');
        filteredMessage = filteredMessage.replace(regex, '*'.repeat(fw.word.length));
      });

      // Mesajı saxla
      const result = await db.run(
        'INSERT INTO private_messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, filteredMessage, getBakuTime()]
      );

      // İstifadəçi məlumatlarını al
      const sender = await db.get('SELECT fullname, profile_picture FROM users WHERE id = ?', [senderId]);

      const messageData = {
        id: result.id,
        sender_id: senderId,
        receiver_id: receiverId,
        message: filteredMessage,
        created_at: getBakuTime(),
        fullname: sender.fullname,
        profile_picture: sender.profile_picture
      };

      // Hər iki istifadəçiyə göndər
      io.to(`user-${senderId}`).emit('new-private-message', messageData);
      io.to(`user-${receiverId}`).emit('new-private-message', messageData);
    } catch (error) {
      console.error('Şəxsi mesaj göndərmə xətası:', error);
    }
  });

  // Şəxsi chat otağına qoşul
  socket.on('join-private-chat', async (data) => {
    const { userId, otherUserId } = data;
    socket.join(`user-${userId}`);

    // Köhnə mesajları göndər
    const messages = await db.all(`
      SELECT pm.*, 
             sender.fullname as sender_name, sender.profile_picture as sender_picture,
             receiver.fullname as receiver_name, receiver.profile_picture as receiver_picture
      FROM private_messages pm
      INNER JOIN users sender ON pm.sender_id = sender.id
      INNER JOIN users receiver ON pm.receiver_id = receiver.id
      WHERE (pm.sender_id = ? AND pm.receiver_id = ?) OR (pm.sender_id = ? AND pm.receiver_id = ?)
      ORDER BY pm.created_at ASC
    `, [userId, otherUserId, otherUserId, userId]);

    socket.emit('previous-private-messages', messages);
  });

  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server başlat
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server ${PORT} portunda işləyir`);
  console.log(`🌐 http://localhost:${PORT}`);
});
