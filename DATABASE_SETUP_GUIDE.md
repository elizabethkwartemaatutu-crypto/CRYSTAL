# Crystal Montessori School Management System - Complete Database Setup Guide

## 📋 Overview

Your school management system now has a professional database backend with the following components:

### What Was Created:
1. **MySQL Database** - Complete relational database with 13 tables
2. **Node.js/Express Backend** - RESTful API server
3. **Authentication System** - JWT-based authentication
4. **API Service Layer** - JavaScript utilities to connect frontend to backend
5. **Integration Examples** - Code samples to update your HTML

---

## 🚀 Quick Start (5-10 minutes)

### Prerequisites
- **Node.js** (download from nodejs.org)
- **MySQL Server** (download from mysql.com or use XAMPP)

### Step 1: Setup MySQL Database

#### On Windows (if using XAMPP):
1. Start XAMPP and turn on MySQL
2. Open phpMyAdmin at `http://localhost/phpmyadmin`
3. Click "New" to create new database
4. Paste contents of `backend/database.sql` and execute

#### Or using Command Line:
```bash
mysql -u root -p < "c:\Users\user\Desktop\CRYSTAL SITE\backend\database.sql"
```

### Step 2: Setup Backend Server

```bash
# Navigate to backend folder
cd "c:\Users\user\Desktop\CRYSTAL SITE\backend"

# Install dependencies (one time only)
npm install

# Create .env file
Copy .env.example to .env
Edit .env and update your MySQL credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crystal_school_db

# Start the server
npm start
```

You should see: `✓ Crystal School Management Backend running on port 3001`

### Step 3: Connect Frontend to Backend

In your `Management.html`, add this before the closing `</body>` tag:
```html
<script src="api-service.js"></script>
<script src="integration-guide.js"></script>
```

### Step 4: Test the System

1. Open `Management.html` in your browser
2. Login with default credentials:
   - Student: `cms001` / `cms001`
   - Teacher: `Tch-001` / `Tch-001`
   - Admin: `Admin01` / `Admin01`

---

## 📁 File Structure

```
CRYSTAL SITE/
├── Index.html
├── Management.html  (Your main app - add scripts here)
├── api-service.js   (NEW - API communication layer)
├── integration-guide.js (NEW - Updated event handlers)
├── backend/
│   ├── package.json
│   ├── server.js    (Main API server)
│   ├── config.js    (Database config)
│   ├── database.sql (Database schema)
│   ├── .env.example (Copy & rename to .env)
│   └── README.md
└── images/
```

---

## 🗄️ Database Schema

### 13 Tables Created:

1. **users** - User accounts (Admins, Teachers, Students, Parents)
   - Fields: user_id, password_hash, role, first_name, last_name, email, phone

2. **students** - Student records
   - Fields: student_id, first_name, last_name, date_of_birth, current_class, admission_year

3. **classes** - Class information
   - Fields: class_name, level, class_code, teacher_id

4. **parents** - Parent/Guardian contacts
   - Fields: parent_name, contact_phone, email, relationship, student_id

5. **fee_structure** - Term fees configuration
   - Fields: academic_term, term_year, default_fee

6. **student_fees** - Fee tracking
   - Fields: student_id, fee_structure_id, amount_charged, amount_paid, outstanding_balance

7. **fee_payments** - Payment records
   - Fields: student_id, payment_date, amount_paid, receipt_number

8. **feeding_fee_config** - Feeding fee settings
   - Fields: fee_per_day, term_start_date, term_end_date

9. **feeding_payments** - Daily feeding payments
   - Fields: student_id, class_id, week_number, days_paid (M-F), total_amount

10. **sms_announcements** - SMS announcements
    - Fields: class_id, message, sender_id, sent_at

11. **sms_delivery_log** - SMS delivery tracking
    - Fields: announcement_id, student_id, parent_contact, delivery_status

12. **student_results** - Academic results
    - Fields: student_id, term_id, subject, marks_obtained, grade

13. **assignments** - Class assignments
    - Fields: assignment_title, class_id, teacher_id, due_date

---

## 🔌 API Endpoints

All endpoints require JWT authentication (except login).

### Authentication
```
POST /api/auth/login
Body: { userId, password, role }
Response: { token, user: { id, user_id, role, first_name } }
```

### Students
```
GET  /api/students              - Get all students
POST /api/students              - Add new student
GET  /api/students/:id          - Get student details
```

### Fees
```
POST /api/fees/payment          - Record payment
GET  /api/fees/student/:id      - Get student payment history
GET  /api/fees/all              - Get all payments (admin)
```

### Feeding Fees
```
POST /api/feeding/payment       - Record feeding payment
GET  /api/feeding/records       - Get feeding records
```

### SMS
```
POST /api/sms/announcement      - Send announcement
GET  /api/sms/log               - Get SMS delivery log
```

### Results
```
POST /api/results               - Add result
GET  /api/results/student/:id   - Get student results
```

### Classes
```
GET  /api/classes               - Get all classes
```

---

## 💻 Frontend Integration Examples

### Example 1: Get All Students
```javascript
const students = await StudentService.getAllStudents();
console.log(students);
```

### Example 2: Add New Student
```javascript
const newStudent = await StudentService.addStudent({
  student_id: 'cms001',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '2015-05-20',
  class_at_admission: 1,
  admission_year: 2020,
  parents: [
    { name: 'Parent Name', contact: '024xxxxxxx' }
  ]
});
```

### Example 3: Record Fee Payment
```javascript
await FeesService.recordPayment({
  student_id: 1,
  payment_date: '2024-01-15',
  amount_paid: 300,
  outstanding_after_payment: 0
});
```

### Example 4: Get Student Fee Balance
```javascript
const balance = await FeesService.getStudentBalance(studentId);
console.log(`Outstanding: GHS ${balance}`);
```

### Example 5: Send SMS Announcement
```javascript
await SMSService.sendAnnouncement(classId, 'School closes at 1pm tomorrow');
```

---

## 🔐 Security Features

✓ JWT Authentication - Secure token-based authentication
✓ Password Hashing - Passwords stored as hashes (not plain text)
✓ Role-Based Access - Different permissions for each role
✓ Environment Variables - Sensitive data in .env file
✓ Input Validation - Server-side validation of all inputs

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
- Check MySQL is running
- Verify DB credentials in .env match your setup
- Ensure database name is `crystal_school_db`

```bash
# Test MySQL connection
mysql -u root -p -h localhost
```

### Issue: "Port 3001 already in use"
**Solution:**
- Change PORT in .env to another number (e.g., 3002)
- Or kill the process using port 3001

```bash
# Windows: Find process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: "CORS error" or "API not found"
**Solution:**
- Make sure backend server is running (`npm start`)
- Verify API_BASE_URL in `api-service.js` is correct
- Check browser console for detailed error

### Issue: "Login not working"
**Solution:**
- Verify user exists in database
- Default credentials are ID as both username and password
- Check JWT_SECRET in .env is set

### Issue: "Token expired"
**Solution:**
- Logout and login again
- Token expires after 24 hours by default
- Change `expiresIn` in server.js if needed

---

## 📊 Sample Data

Default test accounts already in database:

| User ID | Password | Role | Use Case |
|---------|----------|------|----------|
| Admin01 | Admin01 | Administrator | Full system access |
| Admin02 | Admin02 | Administrator | Full system access |
| Tch-001 | Tch-001 | Teacher | Enter results, assignments |
| Tch-002 | Tch-002 | Teacher | Enter results, assignments |
| cms001 | cms001 | Student | View own records |
| cms002 | cms002 | Student | View own records |

---

## 🔄 Development vs Production

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

For production:
- Use HTTPS instead of HTTP
- Implement rate limiting
- Set strong JWT_SECRET
- Use environment-specific .env files
- Enable database backups

---

## 📈 Next Steps

1. **Update Management.html**
   - Replace localStorage calls with API calls
   - Import `api-service.js` and `integration-guide.js`

2. **Add More Features**
   - Parent portal login
   - Report card generation
   - Attendance tracking
   - Grade calculations

3. **Deploy**
   - Host backend on cloud (Azure, AWS, Heroku)
   - Use live MySQL database
   - Setup HTTPS certificates

4. **Backup**
   - Regular MySQL backups
   - Export important reports
   - Document system changes

---

## 📞 Support

For issues:
1. Check the Troubleshooting section above
2. Review console logs (press F12 in browser)
3. Check backend server logs
4. Verify .env file configuration

---

## 📝 License

This system is for use by Crystal Montessori School.

---

**Created:** April 2026
**Last Updated:** April 2026
**Status:** Ready for Development
