-- Crystal Montessori School Management System Database Schema

CREATE DATABASE IF NOT EXISTS crystal_school_db;
USE crystal_school_db;

-- ============================================
-- Users/Accounts Table
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Administrator', 'Teacher', 'Student', 'Parent') NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Classes Table
-- ============================================
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(50) NOT NULL,
  level INT,
  class_code VARCHAR(20) UNIQUE NOT NULL,
  teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  user_id INT UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  class_at_admission INT NOT NULL,
  current_class INT,
  admission_year YEAR NOT NULL,
  admission_date DATE,
  status ENUM('Active', 'Graduated', 'Withdrawn') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (class_at_admission) REFERENCES classes(id),
  FOREIGN KEY (current_class) REFERENCES classes(id)
);

-- ============================================
-- Parents/Guardians Table
-- ============================================
CREATE TABLE parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50),
  contact_phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  student_id INT NOT NULL,
  parent_order INT, -- 1 for first parent, 2 for second, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================
-- Fee Structure Table
-- ============================================
CREATE TABLE fee_structure (
  id INT PRIMARY KEY AUTO_INCREMENT,
  academic_term VARCHAR(50) NOT NULL,
  term_year YEAR NOT NULL,
  default_fee DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_term (academic_term, term_year)
);

-- ============================================
-- Student Fees Table
-- ============================================
CREATE TABLE student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  fee_structure_id INT NOT NULL,
  amount_charged DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  outstanding_balance DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'Partial', 'Paid') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id)
);

-- ============================================
-- Fee Payments Table
-- ============================================
CREATE TABLE fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  outstanding_after_payment DECIMAL(10, 2) NOT NULL,
  receipt_number VARCHAR(50) UNIQUE,
  payment_method VARCHAR(50),
  received_by VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ============================================
-- Feeding Fee Structure Table
-- ============================================
CREATE TABLE feeding_fee_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fee_per_day DECIMAL(10, 2) NOT NULL DEFAULT 10,
  term_start_date DATE,
  term_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Feeding Payments Table
-- ============================================
CREATE TABLE feeding_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  payment_date DATE NOT NULL,
  week_number INT NOT NULL,
  term_year YEAR NOT NULL,
  monday_paid BOOLEAN DEFAULT FALSE,
  tuesday_paid BOOLEAN DEFAULT FALSE,
  wednesday_paid BOOLEAN DEFAULT FALSE,
  thursday_paid BOOLEAN DEFAULT FALSE,
  friday_paid BOOLEAN DEFAULT FALSE,
  fee_per_day DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- ============================================
-- Parents SMS Announcements Table
-- ============================================
CREATE TABLE sms_announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  message TEXT NOT NULL,
  sender_id INT,
  recipients_count INT DEFAULT 0,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- ============================================
-- SMS Delivery Log Table
-- ============================================
CREATE TABLE sms_delivery_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  announcement_id INT NOT NULL,
  student_id INT NOT NULL,
  parent_contact VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  delivery_status ENUM('Pending', 'Sent', 'Failed') DEFAULT 'Pending',
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES sms_announcements(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ============================================
-- Academic Terms Table
-- ============================================
CREATE TABLE academic_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  term_name VARCHAR(50) NOT NULL,
  academic_year YEAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_term (term_name, academic_year)
);

-- ============================================
-- Results/Marks Table
-- ============================================
CREATE TABLE student_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  term_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(5, 2),
  total_marks DECIMAL(5, 2),
  grade VARCHAR(5),
  teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (term_id) REFERENCES academic_terms(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- Assignments Table
-- ============================================
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_title VARCHAR(255) NOT NULL,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  attachment_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- Student Assignment Submissions Table
-- ============================================
CREATE TABLE assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url VARCHAR(255),
  status ENUM('Submitted', 'Graded') DEFAULT 'Submitted',
  marks_obtained DECIMAL(5, 2),
  teacher_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ============================================
-- Teacher Notes Table
-- ============================================
CREATE TABLE teacher_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  note_title VARCHAR(255) NOT NULL,
  note_content TEXT NOT NULL,
  attachment_url VARCHAR(255),
  published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_student_id ON students(student_id);
CREATE INDEX idx_class_id ON classes(id);
CREATE INDEX idx_user_id ON users(user_id);
CREATE INDEX idx_student_class ON students(current_class);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX idx_feeding_payments_student ON feeding_payments(student_id);
CREATE INDEX idx_results_student ON student_results(student_id);

-- ============================================
-- Sample Data - Users
-- ============================================
INSERT INTO users (user_id, password_hash, role, first_name, last_name) VALUES
('Admin01', '$2a$10$...' , 'Administrator', 'John', 'Administrator'),
('Admin02', '$2a$10$...', 'Administrator', 'Mary', 'Admin'),
('Tch-001', '$2a$10$...', 'Teacher', 'Sarah', 'Johnson'),
('Tch-002', '$2a$10$...', 'Teacher', 'Michael', 'Brown');

-- ============================================
-- Sample Data - Classes
-- ============================================
INSERT INTO classes (class_name, level, class_code) VALUES
('Nursery 1', 1, 'N1'),
('Nursery 2', 2, 'N2'),
('Creche', 3, 'CR'),
('Basic 1', 4, 'B1'),
('Basic 2', 5, 'B2'),
('Basic 3', 6, 'B3');

-- ============================================
-- Sample Data - Fee Structure
-- ============================================
INSERT INTO fee_structure (academic_term, term_year, default_fee) VALUES
('Term 1', 2024, 300.00),
('Term 2', 2024, 300.00),
('Term 3', 2024, 300.00);
