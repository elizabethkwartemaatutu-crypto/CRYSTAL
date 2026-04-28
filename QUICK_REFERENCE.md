# Quick Reference - Database System Implementation

## ⚡ 5-Minute Start

### 1. Start MySQL
```bash
# Windows - XAMPP
Start XAMPP Control Panel → Click "Start" next to MySQL

# Or direct MySQL
# If installed, MySQL starts automatically
```

### 2. Create Database
```bash
mysql -u root -p < backend\database.sql
# Enter password when prompted
```

### 3. Setup Backend
```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your MySQL password
npm start
# You should see: ✓ Crystal School Management Backend running on port 3001
```

### 4. Test Backend
Open in browser: `http://localhost:3001/api/health`
Should return: `{ "status": "Server running", "timestamp": "..." }`

### 5. Add Scripts to Management.html
```html
<!-- Add before </body> -->
<script src="api-service.js"></script>
<script src="integration-guide.js"></script>
```

### 6. Test Frontend
Open Management.html → Login with:
- ID: `cms001`
- Password: `cms001`
- Role: `Student`

---

## 📚 Common Tasks

### Task: Add a Student Programmatically
```javascript
const student = await StudentService.addStudent({
  student_id: 'cms102',
  first_name: 'Jane',
  last_name: 'Smith',
  date_of_birth: '2015-03-20',
  class_at_admission: 3,
  admission_year: 2020,
  parents: [
    { name: 'Jane Smith Sr.', contact: '024xxxxxxx' }
  ]
});
console.log('Added student:', student);
```

### Task: Record a Fee Payment
```javascript
const payment = await FeesService.recordPayment({
  student_id: 1,
  payment_date: '2024-01-15',
  amount_paid: 300,
  outstanding_after_payment: 0
});
console.log('Payment ID:', payment.payment_id);
```

### Task: Get Student's Outstanding Balance
```javascript
const balance = await FeesService.getStudentBalance(1);
console.log(`Outstanding fees: GHS ${balance}`);
```

### Task: Record Feeding Payment
```javascript
await FeedingFeeService.recordPayment({
  student_id: 1,
  class_id: 1,
  payment_date: '2024-01-15',
  week_number: 2,
  term_year: 2024,
  days_paid: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: false,
    friday: false
  },
  fee_per_day: 10
});
```

### Task: Send SMS to Class
```javascript
const result = await SMSService.sendAnnouncement(
  1, // class_id
  'School closes at 1pm Friday for Teacher's Meeting'
);
console.log(`Sent to ${result.recipients} parents`);
```

### Task: Get All Students
```javascript
const students = await StudentService.getAllStudents();
students.forEach(s => {
  console.log(`${s.student_id}: ${s.first_name} ${s.last_name}`);
});
```

### Task: Get Student by Name
```javascript
const student = await StudentService.getStudentByName('John Doe');
console.log(student);
```

### Task: Logout
```javascript
AuthService.logout();
// User is logged out, localStorage cleared
```

---

## 🔧 File Locations & Purposes

| File | Location | Purpose |
|------|----------|---------|
| API Service | `api-service.js` | JavaScript functions to call API |
| Integration | `integration-guide.js` | HTML form handlers |
| Backend Server | `backend/server.js` | Node.js Express app |
| Database Schema | `backend/database.sql` | MySQL table definitions |
| Config | `backend/config.js` | Database connection config |
| Setup Guide | `backend/README.md` | Detailed setup instructions |

---

## 🐛 Common Errors & Solutions

### Error: "Cannot GET /api/health"
**Problem:** Backend not running
**Solution:** 
```bash
cd backend
npm start
```
Wait for "✓ Crystal School Management Backend running on port 3001"

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
**Problem:** MySQL not running
**Solution:**
- Windows: Start XAMPP, click MySQL "Start"
- Or: `mysql.server start` (Mac)
- Or: Restart MySQL service

### Error: "Unknown database 'crystal_school_db'"
**Problem:** Database not created
**Solution:**
```bash
mysql -u root -p < backend\database.sql
```

### Error: "Unauthorized. Please login again."
**Problem:** Invalid token or login failed
**Solution:**
- Logout and login again
- Check user exists in database
- Verify password (default: same as user ID)

### Error: "CORS error" in browser console
**Problem:** API not accessible from frontend
**Solution:**
- Check backend is running on port 3001
- Verify API_BASE_URL in api-service.js is correct
- Check browser console for detailed error

### Error: "nodemon not found"
**Problem:** Dependencies not installed
**Solution:**
```bash
cd backend
npm install
```

---

## 🧪 Test Procedures

### Test 1: Backend Connection
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Test API
curl http://localhost:3001/api/health
# Should return: {"status":"Server running","timestamp":"..."}
```

### Test 2: Database Connection
```bash
# In backend terminal
npm start
# Watch for: "✓ Crystal School Management Backend running on port 3001"
# No errors about database = success
```

### Test 3: Login Flow
1. Open Management.html in browser
2. Login with:
   - ID: `Admin01`
   - Password: `Admin01`
   - Role: `Administrator`
3. Should see: "Welcome, John!" and app dashboard

### Test 4: Add Student
1. Click "Students" section
2. Fill in student form
3. Click "Save Student"
4. Should see success message
5. New student appears in table

### Test 5: Record Fee Payment
1. Click "Fees Structure" tab
2. Enter student name
3. Enter payment amount
4. Click "Save Payment & Generate Receipt"
5. Receipt should display

---

## 📋 Deployment Checklist

- [ ] Backend code tested locally
- [ ] Database created successfully
- [ ] All endpoints working
- [ ] Login with all roles works
- [ ] Frontend scripts added to Management.html
- [ ] No console errors in browser
- [ ] Data persists after page refresh
- [ ] Multiple users can login

### For Production Deployment:
- [ ] Change JWT_SECRET to strong value
- [ ] Set DB_PASSWORD to strong password
- [ ] Enable HTTPS
- [ ] Use cloud database (Azure, AWS)
- [ ] Use cloud hosting (Azure App Service, Heroku)
- [ ] Setup backup procedures
- [ ] Enable logging
- [ ] Setup monitoring

---

## 📞 Quick Troubleshooting Flow

1. **Is backend running?**
   - Check terminal: `npm start` running?
   - Try: `http://localhost:3001/api/health`

2. **Is database running?**
   - Check XAMPP MySQL is started
   - Or: `mysql -u root -p` to test connection

3. **Does database exist?**
   - Run: `mysql -u root -p < backend\database.sql`
   - Check .env has correct DB name

4. **Is frontend connected?**
   - Check browser console (F12)
   - Verify `api-service.js` is loaded
   - Check Network tab for API calls

5. **Is login working?**
   - Verify user exists in database
   - Default password = user ID
   - Check JWT_SECRET in .env

---

## 🎯 Success Indicators

✅ Backend starts without errors
✅ API health check returns status
✅ Login works with test credentials
✅ Students appear in table
✅ Fee payments can be recorded
✅ Announcements can be sent
✅ Data persists after page reload
✅ Multiple users can login

---

## 📱 API Response Examples

### Successful Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "user_id": "Admin01",
    "role": "Administrator",
    "first_name": "John"
  }
}
```

### Get Students
```json
[
  {
    "id": 1,
    "student_id": "cms001",
    "first_name": "Kwame",
    "last_name": "Mensah",
    "current_class_name": "Basic 1",
    "date_of_birth": "2015-05-20"
  }
]
```

### Fee Payment Response
```json
{
  "message": "Payment recorded successfully",
  "payment_id": 42
}
```

---

**Save this file for quick reference during implementation!**
