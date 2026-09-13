
CREATE DATABASE IF NOT EXISTS snapflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE snapflow;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER','CUSTOMER_RELATIONS_OFFICER','OPERATIONS_MANAGER','PHOTOGRAPHER','FINANCE_EXECUTIVE','COMPANY_DIRECTOR') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    duration_hours INT,
    features TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE add_ons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    venue VARCHAR(255),
    event_type VARCHAR(50),
    special_requests TEXT,
    status ENUM('PENDING','CONFIRMED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) NOT NULL,
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    balance_amount DECIMAL(12,2) DEFAULT 0,
    additional_charges DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE booking_add_ons (
    booking_id BIGINT NOT NULL,
    add_on_id BIGINT NOT NULL,
    PRIMARY KEY (booking_id, add_on_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (add_on_id) REFERENCES add_ons(id)
);

CREATE TABLE photographer_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    photographer_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ASSIGNED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'ASSIGNED',
    attendance_confirmed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (photographer_id) REFERENCES users(id),
    UNIQUE KEY uk_booking_photographer (booking_id, photographer_id)
);

CREATE TABLE change_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    request_type ENUM('PACKAGE_UPGRADE','DATE_CHANGE','VENUE_CHANGE','ADD_ON','SPECIAL_REQUEST','OTHER') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    reviewed_by BIGINT,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_type ENUM('DEPOSIT','BALANCE','ADDITIONAL','REFUND') NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
    receipt_path VARCHAR(255),
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE TABLE galleries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(150),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    access_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gallery_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    is_cover BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
);

CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    serial_number VARCHAR(50),
    status ENUM('AVAILABLE','IN_USE','MAINTENANCE','RETIRED') DEFAULT 'AVAILABLE',
    notes TEXT
);

CREATE TABLE equipment_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    photographer_id BIGINT,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (photographer_id) REFERENCES users(id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('thisaradewdunu9@gmail.com', '200535301542', 'Nimal', 'Perera', '0771234567', 'COMPANY_DIRECTOR'),
('ops@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Saman', 'Silva', '0772345678', 'OPERATIONS_MANAGER'),
('cro@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Kamala', 'Fernando', '0773456789', 'CUSTOMER_RELATIONS_OFFICER'),
('finance@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Ruwan', 'Jayasinghe', '0774567890', 'FINANCE_EXECUTIVE'),
('photo1@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Ashan', 'Wickramasinghe', '0775678901', 'PHOTOGRAPHER'),
('photo2@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Dilan', 'Gunasekara', '0776789012', 'PHOTOGRAPHER'),
('photo3@lankamoments.lk', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Tharindu', 'Bandara', '0777890123', 'PHOTOGRAPHER'),
('customer1@email.com', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Amaya', 'Rathnayake', '0711111111', 'CUSTOMER'),
('customer2@email.com', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Kasun', 'Mendis', '0712222222', 'CUSTOMER'),
('customer3@email.com', '$2a$10$KnPmlqRjgGvsFSyNJXwzRePogUWGG3Vx7VpEJhQhmNM7TEx5B8ROS', 'Sachini', 'Perera', '0713333333', 'CUSTOMER');

INSERT INTO packages (name, description, price, duration_hours, features) VALUES
('Essential Wedding', 'Perfect for intimate weddings. Includes ceremony and reception coverage.', 85000.00, 6, '1 Photographer, 300+ edited photos, Online gallery, USB drive'),
('Premium Wedding', 'Full day coverage with two photographers and engagement shoot.', 145000.00, 10, '2 Photographers, Engagement shoot, 500+ edited photos, Premium album, Online gallery'),
('Luxury Wedding', 'Complete luxury experience with cinematic video highlights.', 225000.00, 12, '2 Photographers + Videographer, Pre-wedding shoot, 700+ photos, Luxury album, Highlight video, Online gallery'),
('Corporate Event', 'Professional coverage for corporate functions and conferences.', 55000.00, 4, '1 Photographer, 200+ edited photos, Same-day selection, Online gallery'),
('Birthday & Parties', 'Fun and vibrant coverage for birthday parties and celebrations.', 35000.00, 3, '1 Photographer, 150+ edited photos, Online gallery'),
('Portrait Session', 'Studio or outdoor portrait session for individuals or families.', 25000.00, 2, '1 Photographer, 50+ edited photos, Online gallery, Print rights');

INSERT INTO add_ons (name, description, price) VALUES
('Extra Photographer', 'Additional professional photographer for the event', 25000.00),
('Drone Photography', 'Aerial shots of the venue and event', 18000.00),
('Same Day Edit', 'Selected photos edited and delivered on the event day', 15000.00),
('Premium Album', 'High-quality printed photo album (30 pages)', 22000.00),
('Highlight Video (3-5 min)', 'Cinematic highlight video of the event', 35000.00),
('Raw Files', 'Delivery of unedited RAW files', 12000.00);

INSERT INTO equipment (name, type, serial_number, status) VALUES
('Canon EOS R5', 'Camera', 'CN-R5-001', 'AVAILABLE'),
('Canon EOS R6', 'Camera', 'CN-R6-002', 'AVAILABLE'),
('Sony A7IV', 'Camera', 'SN-A7-003', 'AVAILABLE'),
('Canon 24-70mm f/2.8', 'Lens', 'LN-2470-001', 'AVAILABLE'),
('Canon 70-200mm f/2.8', 'Lens', 'LN-70200-001', 'AVAILABLE'),
('Godox AD200', 'Lighting', 'LT-AD200-001', 'AVAILABLE'),
('DJI Mavic 3', 'Drone', 'DR-M3-001', 'AVAILABLE');

INSERT INTO bookings (booking_ref, customer_id, package_id, event_date, event_time, venue, event_type, status, total_amount, deposit_amount, balance_amount) VALUES
('SF-2026-001', 8, 2, '2026-09-15', '09:00:00', 'Galle Face Hotel, Colombo', 'Wedding', 'CONFIRMED', 145000.00, 50000.00, 95000.00),
('SF-2026-002', 9, 1, '2026-08-28', '14:00:00', 'Cinnamon Grand, Colombo', 'Wedding', 'ASSIGNED', 85000.00, 30000.00, 55000.00),
('SF-2026-003', 10, 4, '2026-09-05', '18:00:00', 'Shangri-La Hotel', 'Corporate', 'PENDING', 55000.00, 0.00, 55000.00),
('SF-2026-004', 8, 5, '2026-10-12', '16:00:00', 'Private Residence, Nugegoda', 'Birthday', 'CONFIRMED', 35000.00, 15000.00, 20000.00),
('SF-2026-005', 9, 3, '2026-11-20', '08:00:00', 'Amaya Hills, Kandy', 'Wedding', 'PENDING', 225000.00, 0.00, 225000.00);

INSERT INTO photographer_assignments (booking_id, photographer_id, status, attendance_confirmed) VALUES
(1, 5, 'ASSIGNED', FALSE),
(1, 6, 'ASSIGNED', FALSE),
(2, 5, 'CONFIRMED', TRUE),
(4, 7, 'ASSIGNED', FALSE);

INSERT INTO payments (booking_id, amount, payment_type, payment_method, status) VALUES
(1, 50000.00, 'DEPOSIT', 'Bank Transfer', 'VERIFIED'),
(2, 30000.00, 'DEPOSIT', 'Bank Transfer', 'VERIFIED'),
(4, 15000.00, 'DEPOSIT', 'Bank Transfer', 'PENDING');

INSERT INTO change_requests (booking_id, requested_by, request_type, description, status) VALUES
(1, 8, 'ADD_ON', 'Would like to add Drone Photography for outdoor shots', 'PENDING'),
(2, 9, 'DATE_CHANGE', 'Request to move event date to 2026-09-05 due to family reasons', 'PENDING');

INSERT INTO galleries (booking_id, title, is_published, access_code) VALUES
(2, 'Kasun & Family Wedding', TRUE, 'KW2026');

INSERT INTO notifications (user_id, title, message, type) VALUES
(8, 'Booking Confirmed', 'Your booking SF-2026-001 has been confirmed.', 'BOOKING'),
(5, 'New Assignment', 'You have been assigned to booking SF-2026-001 on 2026-09-15.', 'ASSIGNMENT'),
(9, 'Deposit Received', 'Your deposit payment has been verified.', 'PAYMENT');

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'LOGIN', 'USER', 1, 'Director logged in'),
(3, 'CREATE_BOOKING', 'BOOKING', 1, 'Created booking SF-2026-001'),
(2, 'ASSIGN_PHOTOGRAPHER', 'ASSIGNMENT', 1, 'Assigned photographers to booking SF-2026-001');
