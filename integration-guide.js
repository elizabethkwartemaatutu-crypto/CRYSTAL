/**
 * Integration Guide: Updating Management.html to Use Database
 * 
 * This guide shows how to update your Management.html to use the 
 * backend API instead of localStorage
 */

// ============================================
// STEP 1: Load the API Service Script
// ============================================
// Add this to your Management.html <head> section:
// <script src="api-service.js"></script>

// ============================================
// STEP 2: Update Login Handler
// ============================================

// BEFORE (localStorage):
/*
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const userId = document.getElementById('userId').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  localStorage.setItem('currentUser', JSON.stringify({ userId, role }));
  // Show app
});
*/

// AFTER (API):
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('userId').value; // Default: ID = password
    const role = document.getElementById('role').value;
    
    const loginResult = await AuthService.login(userId, password, role);
    
    // Show app
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('appView').classList.remove('hidden');
    
    // Update welcome message
    document.getElementById('welcomeText').textContent = 
      `Welcome, ${loginResult.user.first_name}!`;
    
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});

// ============================================
// STEP 3: Update Student Form
// ============================================

// BEFORE (localStorage):
/*
document.getElementById('studentForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const studentData = {
    student_id: document.getElementById('studentId').value,
    name: document.getElementById('studentName').value,
    // ... other fields
  };
  let students = JSON.parse(localStorage.getItem('students') || '[]');
  students.push(studentData);
  localStorage.setItem('students', JSON.stringify(students));
});
*/

// AFTER (API):
document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const studentData = {
      student_id: `cms${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`,
      first_name: document.getElementById('studentName').value.split(' ')[0],
      last_name: document.getElementById('studentName').value.split(' ')[1] || '',
      date_of_birth: document.getElementById('studentDob').value,
      class_at_admission: document.getElementById('studentClass').value,
      admission_year: parseInt(document.getElementById('admissionYear').value),
      parents: [
        {
          name: document.getElementById('parentOneName').value,
          contact: document.getElementById('parentOneContact').value
        },
        {
          name: document.getElementById('parentTwoName').value,
          contact: document.getElementById('parentTwoContact').value
        }
      ]
    };

    const result = await StudentService.addStudent(studentData);
    alert('Student added successfully!');
    
    // Refresh student list
    loadStudentTable();
    e.target.reset();
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// ============================================
// STEP 4: Load Student Table from Database
// ============================================

async function loadStudentTable() {
  try {
    const students = await StudentService.getAllStudents();
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';

    students.forEach(student => {
      const age = calculateAge(student.date_of_birth);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.first_name} ${student.last_name}</td>
        <td>${student.date_of_birth}</td>
        <td>${age}</td>
        <td>${student.current_class_name || 'N/A'}</td>
        <td>${student.parent_one_name || ''}</td>
        <td>${student.parent_one_contact || ''}</td>
        <td>${student.parent_two_name || ''}</td>
        <td>${student.parent_two_contact || ''}</td>
        <td><button onclick="viewStudentFees(${student.id})">View</button></td>
        <td><button onclick="editStudent(${student.id})">Edit</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// Load on page init
window.addEventListener('load', () => {
  if (authToken) {
    loadStudentTable();
  }
});

// ============================================
// STEP 5: Update Fees Recording
// ============================================

document.getElementById('feesForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const studentName = document.getElementById('feeStudent').value;
    const student = await StudentService.getStudentByName(studentName);
    
    if (!student) {
      alert('Student not found');
      return;
    }

    const paymentData = {
      student_id: student.id,
      payment_date: document.getElementById('feeDate').value,
      amount_paid: parseFloat(document.getElementById('feeAmountPaid').value),
      outstanding_after_payment: parseFloat(document.getElementById('feeOutstanding').value)
    };

    const result = await FeesService.recordPayment(paymentData);
    
    alert('Payment recorded successfully!');
    
    // Update receipt preview
    updateReceiptPreview(student, paymentData);
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// ============================================
// STEP 6: Update Fee Balance Display
// ============================================

document.getElementById('feeStudent')?.addEventListener('blur', async (e) => {
  try {
    const studentName = e.target.value;
    const student = await StudentService.getStudentByName(studentName);
    
    if (student) {
      const balance = await FeesService.getStudentBalance(student.id);
      const balanceDisplay = document.getElementById('feeBalanceDisplay');
      
      balanceDisplay.textContent = formatCurrency(balance);
      balanceDisplay.className = 'fee-balance-value ' + 
        (balance === 0 ? 'zero' : balance > 0 ? 'owed' : '');
        
      // Auto-fill outstanding field
      document.getElementById('feeOutstanding').value = balance;
    }
  } catch (error) {
    console.error('Error fetching student balance:', error);
  }
});

// ============================================
// STEP 7: Update Feeding Fee Recording
// ============================================

document.getElementById('feedingForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const classId = document.getElementById('feedingClass').value;
    const studentId = document.getElementById('feedingStudent').value;
    const daysMap = {
      monday: document.getElementById('dayMonday').checked,
      tuesday: document.getElementById('dayTuesday').checked,
      wednesday: document.getElementById('dayWednesday').checked,
      thursday: document.getElementById('dayThursday').checked,
      friday: document.getElementById('dayFriday').checked
    };

    const paymentData = {
      student_id: studentId,
      class_id: classId,
      payment_date: new Date().toISOString().split('T')[0],
      week_number: getCurrentWeek(document.getElementById('feedingTermStart').value),
      term_year: new Date().getFullYear(),
      days_paid: daysMap,
      fee_per_day: parseFloat(document.getElementById('feedingFeePerDay').value)
    };

    await FeedingFeeService.recordPayment(paymentData);
    alert('Feeding payment recorded!');
    
    // Refresh feeding records
    loadFeedingRecords();
    e.target.reset();
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// ============================================
// STEP 8: Load Feeding Records
// ============================================

async function loadFeedingRecords() {
  try {
    const records = await FeedingFeeService.getRecords();
    const tbody = document.getElementById('feedingTableBody');
    tbody.innerHTML = '';

    records.forEach(record => {
      const paidDays = [
        record.monday_paid ? 'M' : '',
        record.tuesday_paid ? 'T' : '',
        record.wednesday_paid ? 'W' : '',
        record.thursday_paid ? 'T' : '',
        record.friday_paid ? 'F' : ''
      ].filter(d => d).join(', ');

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Week ${record.week_number}</td>
        <td>${record.class_name}</td>
        <td>${record.first_name} ${record.last_name}</td>
        <td>${paidDays}</td>
        <td>${Object.values({ 
          monday: record.monday_paid, 
          tuesday: record.tuesday_paid,
          wednesday: record.wednesday_paid,
          thursday: record.thursday_paid,
          friday: record.friday_paid
        }).filter(Boolean).length}</td>
        <td>${formatCurrency(record.fee_per_day)}</td>
        <td>${formatCurrency(record.total_amount)}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading feeding records:', error);
  }
}

// ============================================
// STEP 9: Update SMS Announcements
// ============================================

document.getElementById('parentsSmsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const classId = document.getElementById('smsClass').value;
    const message = document.getElementById('smsMessage').value;

    const result = await SMSService.sendAnnouncement(classId, message);
    
    alert(`Announcement sent to ${result.recipients} parents!`);
    
    // Refresh SMS log
    loadSmsLog();
    e.target.reset();
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

async function loadSmsLog() {
  try {
    const log = await SMSService.getDeliveryLog();
    const tbody = document.getElementById('smsTableBody');
    tbody.innerHTML = '';

    log.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(entry.created_at).toLocaleString()}</td>
        <td>${entry.first_name} ${entry.last_name}</td>
        <td>${entry.parent_contact}</td>
        <td>${entry.message}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading SMS log:', error);
  }
}

// ============================================
// STEP 10: Update Logout
// ============================================

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  AuthService.logout();
  
  // Hide app, show login
  document.getElementById('appView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('loginForm').reset();
});
