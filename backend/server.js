const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crystal_school_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============================================
// AUTH ROUTES
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE user_id = ? AND role = ?',
      [userId, role]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    // For demo: use plain password comparison (in production, use proper hashing)
    const passwordMatch = password === userId; // Default password is user ID
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, user_id: user.user_id, role: user.role, first_name: user.first_name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// STUDENTS ROUTES
// ============================================

// Add Student
app.post('/api/students', authenticateToken, async (req, res) => {
  try {
    const { student_id, first_name, last_name, date_of_birth, class_at_admission, admission_year, parents } = req.body;

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO students (student_id, first_name, last_name, date_of_birth, class_at_admission, current_class, admission_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, first_name, last_name, date_of_birth, class_at_admission, class_at_admission, admission_year]
    );

    const studentId = result.insertId;

    // Add parents
    if (parents && parents.length > 0) {
      for (let i = 0; i < parents.length; i++) {
        await connection.query(
          'INSERT INTO parents (student_id, parent_name, contact_phone, parent_order) VALUES (?, ?, ?, ?)',
          [studentId, parents[i].name, parents[i].contact, i + 1]
        );
      }
    }

    connection.release();

    res.json({ message: 'Student added successfully', student_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Students
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(`
      SELECT s.*, c.class_name as current_class_name
      FROM students s
      LEFT JOIN classes c ON s.current_class = c.id
      ORDER BY s.student_id
    `);
    connection.release();

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Student by ID
app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    const [parents] = await connection.query('SELECT * FROM parents WHERE student_id = ? ORDER BY parent_order', [req.params.id]);
    connection.release();

    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });

    res.json({ ...students[0], parents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// FEES ROUTES
// ============================================

// Record Fee Payment
app.post('/api/fees/payment', authenticateToken, async (req, res) => {
  try {
    const { student_id, payment_date, amount_paid, outstanding_after_payment } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO fee_payments (student_id, payment_date, amount_paid, outstanding_after_payment, receipt_number) VALUES (?, ?, ?, ?, ?)',
      [student_id, payment_date, amount_paid, outstanding_after_payment, `RCP-${Date.now()}`]
    );
    connection.release();

    res.json({ message: 'Payment recorded successfully', payment_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Fee Payments for Student
app.get('/api/fees/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [payments] = await connection.query(
      'SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC',
      [req.params.studentId]
    );
    connection.release();

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Fee Payments (Admin)
app.get('/api/fees/all', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [payments] = await connection.query(`
      SELECT fp.*, s.student_id, s.first_name, s.last_name, c.class_name
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.id
      LEFT JOIN classes c ON s.current_class = c.id
      ORDER BY fp.payment_date DESC
    `);
    connection.release();

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// FEEDING FEE ROUTES
// ============================================

// Record Feeding Payment
app.post('/api/feeding/payment', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, payment_date, week_number, term_year, days_paid, fee_per_day } = req.body;

    const total_amount = Object.values(days_paid).filter(Boolean).length * fee_per_day;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO feeding_payments (student_id, class_id, payment_date, week_number, term_year, 
       monday_paid, tuesday_paid, wednesday_paid, thursday_paid, friday_paid, fee_per_day, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, payment_date, week_number, term_year, 
       days_paid.monday || false, days_paid.tuesday || false, days_paid.wednesday || false, 
       days_paid.thursday || false, days_paid.friday || false, fee_per_day, total_amount]
    );
    connection.release();

    res.json({ message: 'Feeding payment recorded', payment_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Feeding Payments
app.get('/api/feeding/records', authenticateToken, async (req, res) => {
  try {
    const { class_id, student_id } = req.query;
    let query = `
      SELECT fp.*, s.first_name, s.last_name, s.student_id, c.class_name
      FROM feeding_payments fp
      JOIN students s ON fp.student_id = s.id
      JOIN classes c ON fp.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ' AND fp.class_id = ?';
      params.push(class_id);
    }
    if (student_id) {
      query += ' AND fp.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY fp.payment_date DESC';

    const connection = await pool.getConnection();
    const [records] = await connection.query(query, params);
    connection.release();

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// SMS ANNOUNCEMENTS ROUTES
// ============================================

// Send SMS Announcement
app.post('/api/sms/announcement', authenticateToken, async (req, res) => {
  try {
    const { class_id, message } = req.body;

    const connection = await pool.getConnection();
    
    // Insert announcement
    const [announcementResult] = await connection.query(
      'INSERT INTO sms_announcements (class_id, message, sender_id) VALUES (?, ?, ?)',
      [class_id, message, req.user.id]
    );

    // Get all students in class and their parents
    const [students] = await connection.query(`
      SELECT s.id as student_id, p.contact_phone, s.first_name, s.last_name
      FROM students s
      JOIN classes c ON s.current_class = c.id
      LEFT JOIN parents p ON s.id = p.student_id
      WHERE c.id = ? AND p.contact_phone IS NOT NULL
    `, [class_id]);

    // Log delivery attempts
    for (const student of students) {
      await connection.query(
        'INSERT INTO sms_delivery_log (announcement_id, student_id, parent_contact, message) VALUES (?, ?, ?, ?)',
        [announcementResult.insertId, student.student_id, student.contact_phone, message]
      );
    }

    connection.release();

    res.json({ message: 'Announcement sent successfully', recipients: students.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get SMS Announcements Log
app.get('/api/sms/log', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [log] = await connection.query(`
      SELECT sdl.*, s.student_id, s.first_name, s.last_name
      FROM sms_delivery_log sdl
      JOIN students s ON sdl.student_id = s.id
      ORDER BY sdl.created_at DESC
    `);
    connection.release();

    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// CLASSES ROUTES
// ============================================

// Get All Classes
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [classes] = await connection.query('SELECT * FROM classes ORDER BY level');
    connection.release();

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// RESULTS ROUTES
// ============================================

// Add Student Results
app.post('/api/results', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, term_id, subject, marks_obtained, total_marks } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO student_results (student_id, class_id, term_id, subject, marks_obtained, total_marks, teacher_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, term_id, subject, marks_obtained, total_marks, req.user.id]
    );
    connection.release();

    res.json({ message: 'Result added successfully', result_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Student Results
app.get('/api/results/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      'SELECT * FROM student_results WHERE student_id = ? ORDER BY subject',
      [req.params.studentId]
    );
    connection.release();

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✓ Crystal School Management Backend running on port ${PORT}`);
  console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
