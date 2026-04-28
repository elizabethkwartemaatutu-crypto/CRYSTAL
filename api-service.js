/**
 * Crystal School Management System - API Service Layer
 * Handles all communication with backend API
 */

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = localStorage.getItem('authToken') || null;

// ============================================
// AUTH SERVICE
// ============================================

const AuthService = {
  async login(userId, password, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role })
      });

      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout() {
    authToken = null;
    localStorage.removeItem('authToken');
  },

  getToken() {
    return authToken;
  }
};

// ============================================
// API HELPER FUNCTIONS
// ============================================

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        AuthService.logout();
        throw new Error('Unauthorized. Please login again.');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// ============================================
// STUDENT SERVICE
// ============================================

const StudentService = {
  async addStudent(studentData) {
    return apiCall('/students', 'POST', studentData);
  },

  async getAllStudents() {
    return apiCall('/students');
  },

  async getStudent(id) {
    return apiCall(`/students/${id}`);
  },

  async getStudentByName(name) {
    const students = await this.getAllStudents();
    return students.find(s => 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(name.toLowerCase())
    );
  }
};

// ============================================
// FEES SERVICE
// ============================================

const FeesService = {
  async recordPayment(paymentData) {
    return apiCall('/fees/payment', 'POST', paymentData);
  },

  async getStudentPayments(studentId) {
    return apiCall(`/fees/student/${studentId}`);
  },

  async getAllPayments() {
    return apiCall('/fees/all');
  },

  async getStudentBalance(studentId) {
    const payments = await this.getStudentPayments(studentId);
    if (payments.length === 0) return 0;
    return payments[payments.length - 1].outstanding_after_payment || 0;
  }
};

// ============================================
// FEEDING FEE SERVICE
// ============================================

const FeedingFeeService = {
  async recordPayment(paymentData) {
    return apiCall('/feeding/payment', 'POST', paymentData);
  },

  async getRecords(filters = {}) {
    let endpoint = '/feeding/records?';
    if (filters.class_id) endpoint += `class_id=${filters.class_id}&`;
    if (filters.student_id) endpoint += `student_id=${filters.student_id}`;
    
    return apiCall(endpoint);
  },

  async getStudentFeedingRecords(studentId) {
    return this.getRecords({ student_id: studentId });
  }
};

// ============================================
// SMS SERVICE
// ============================================

const SMSService = {
  async sendAnnouncement(classId, message) {
    return apiCall('/sms/announcement', 'POST', { class_id: classId, message });
  },

  async getDeliveryLog() {
    return apiCall('/sms/log');
  }
};

// ============================================
// CLASSES SERVICE
// ============================================

const ClassService = {
  async getAllClasses() {
    return apiCall('/classes');
  }
};

// ============================================
// RESULTS SERVICE
// ============================================

const ResultsService = {
  async addResult(resultData) {
    return apiCall('/results', 'POST', resultData);
  },

  async getStudentResults(studentId) {
    return apiCall(`/results/student/${studentId}`);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateReceiptNumber = () => {
  return `RCP-${Date.now()}`;
};

const formatCurrency = (amount) => {
  return `GHS ${parseFloat(amount).toFixed(2)}`;
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getCurrentTerm = () => {
  const month = new Date().getMonth();
  if (month < 3) return 'Term 1';
  if (month < 7) return 'Term 2';
  return 'Term 3';
};

const getCurrentWeek = (termStartDate) => {
  const start = new Date(termStartDate);
  const today = new Date();
  const weeksPassed = Math.floor((today - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, weeksPassed);
};

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AuthService,
    StudentService,
    FeesService,
    FeedingFeeService,
    SMSService,
    ClassService,
    ResultsService,
    apiCall,
    generateReceiptNumber,
    formatCurrency,
    calculateAge,
    getCurrentTerm,
    getCurrentWeek
  };
}
