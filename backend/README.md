# Crystal Montessori School Management System - Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database

#### Option A: Using MySQL Command Line
```bash
mysql -u root -p < database.sql
```

#### Option B: Using MySQL Workbench
- Open `database.sql` in MySQL Workbench
- Execute all queries

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crystal_school_db
JWT_SECRET=your_secret_key_here
PORT=3001
```

### 4. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Documentation

### Authentication
All endpoints (except `/api/auth/login` and `/api/health`) require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Base URL
```
http://localhost:3001/api
```

## Key Endpoints

### Authentication
- `POST /auth/login` - User login
  - Body: `{ userId, password, role }`
  - Returns: JWT token

### Students
- `GET /students` - Get all students
- `POST /students` - Add new student
- `GET /students/:id` - Get student details

### Fees
- `POST /fees/payment` - Record fee payment
- `GET /fees/student/:studentId` - Get student payment history
- `GET /fees/all` - Get all fee payments (admin only)

### Feeding Fees
- `POST /feeding/payment` - Record feeding payment
- `GET /feeding/records` - Get feeding payment records

### SMS Announcements
- `POST /sms/announcement` - Send announcement
- `GET /sms/log` - Get SMS delivery log

### Results
- `POST /results` - Add student result
- `GET /results/student/:studentId` - Get student results

### Classes
- `GET /classes` - Get all classes

## Default Test Credentials
- Admin: `Admin01` / `Admin01`
- Teacher: `Tch-001` / `Tch-001`
- Student: `cms001` / `cms001`
- Parent: `cms002` / `cms002`

## Database Schema

### Main Tables
1. **users** - Login credentials and user roles
2. **students** - Student records with personal info
3. **classes** - Class information
4. **parents** - Parent/Guardian contact info
5. **fee_structure** - Term fee configurations
6. **fee_payments** - Recorded fee payments
7. **student_fees** - Fee tracking per term
8. **feeding_payments** - Daily feeding fee records
9. **sms_announcements** - SMS announcement records
10. **student_results** - Academic results by term
11. **assignments** - Class assignments
12. **assignment_submissions** - Student submissions
13. **teacher_notes** - Teacher notes for classes
14. **academic_terms** - School terms

## Integration with Frontend

Update your `Management.html` to use the API instead of localStorage:

```javascript
// Example: Get all students
const getStudents = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:3001/api/students', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## Security Notes
- Always use HTTPS in production
- Implement rate limiting
- Validate all input on server side
- Use environment variables for sensitive data
- Keep JWT secret secure
- Implement proper error handling

## Troubleshooting

### Connection Error
- Check MySQL is running
- Verify DB credentials in `.env`
- Check database name matches

### Port Already in Use
- Change PORT in `.env` to another value (e.g., 3002)
- Or kill process using the port

### Authentication Fails
- Verify JWT_SECRET in `.env` is set
- Check token expiration
- Ensure Authorization header format is correct
