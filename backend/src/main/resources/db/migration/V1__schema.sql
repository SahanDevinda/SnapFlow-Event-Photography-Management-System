-- SnapFlow Database Schema V1 (Microsoft SQL Server / T-SQL)
-- Event Photography Management System for Lanka Moments (Pvt) Ltd

CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(35) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_role_active ON users (role, active);

CREATE TABLE packages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(MAX),
    price DECIMAL(12, 2) NOT NULL,
    duration_hours INT NOT NULL,
    features VARCHAR(MAX) NOT NULL,
    category VARCHAR(50) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
CREATE INDEX idx_pkg_active ON packages (active);

CREATE TABLE add_ons (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(MAX),
    price DECIMAL(12, 2) NOT NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
CREATE INDEX idx_addon_active ON add_ons (active);

CREATE TABLE bookings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_ref VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    preferred_photographer_id BIGINT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    special_requests VARCHAR(MAX),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    package_price DECIMAL(12, 2) NOT NULL,
    add_ons_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    additional_charges DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(12, 2) NOT NULL,
    internal_notes VARCHAR(MAX),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_booking_package FOREIGN KEY (package_id) REFERENCES packages(id),
    CONSTRAINT fk_booking_preferred_photographer FOREIGN KEY (preferred_photographer_id) REFERENCES users(id)
);
CREATE INDEX idx_booking_ref ON bookings (booking_ref);
CREATE INDEX idx_booking_customer ON bookings (customer_id);
CREATE INDEX idx_booking_date_status ON bookings (event_date, status);

CREATE TABLE booking_add_ons (
    booking_id BIGINT NOT NULL,
    add_on_id BIGINT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (booking_id, add_on_id),
    CONSTRAINT fk_bao_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_bao_addon FOREIGN KEY (add_on_id) REFERENCES add_ons(id)
);

CREATE TABLE booking_status_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),
    changed_by_id BIGINT,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_bsh_user FOREIGN KEY (changed_by_id) REFERENCES users(id)
);

CREATE TABLE photographer_assignments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    photographer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    assigned_by_id BIGINT NOT NULL,
    notes VARCHAR(MAX),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_pa_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_pa_photographer FOREIGN KEY (photographer_id) REFERENCES users(id),
    CONSTRAINT fk_pa_assigned_by FOREIGN KEY (assigned_by_id) REFERENCES users(id)
);
CREATE INDEX idx_pa_photographer_status ON photographer_assignments (photographer_id, status);

CREATE TABLE assignment_status_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),
    changed_by_id BIGINT,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_ash_assignment FOREIGN KEY (assignment_id) REFERENCES photographer_assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_ash_user FOREIGN KEY (changed_by_id) REFERENCES users(id)
);

CREATE TABLE change_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    proposed_package_id BIGINT,
    proposed_date DATE,
    proposed_start_time TIME,
    proposed_end_time TIME,
    proposed_venue VARCHAR(255),
    description VARCHAR(MAX) NOT NULL,
    price_difference DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reviewed_by_id BIGINT,
    review_notes VARCHAR(MAX),
    reviewed_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_cr_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_proposed_pkg FOREIGN KEY (proposed_package_id) REFERENCES packages(id),
    CONSTRAINT fk_cr_reviewed_by FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);
CREATE INDEX idx_cr_booking ON change_requests (booking_id);
CREATE INDEX idx_cr_status ON change_requests (status);

CREATE TABLE change_request_add_ons (
    change_request_id BIGINT NOT NULL,
    add_on_id BIGINT NOT NULL,
    PRIMARY KEY (change_request_id, add_on_id),
    CONSTRAINT fk_crao_cr FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_crao_addon FOREIGN KEY (add_on_id) REFERENCES add_ons(id)
);

CREATE TABLE payments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_date DATETIME2 DEFAULT SYSUTCDATETIME(),
    receipt_file_path VARCHAR(255),
    receipt_original_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by_id BIGINT,
    verification_notes VARCHAR(MAX),
    verified_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_verified_by FOREIGN KEY (verified_by_id) REFERENCES users(id)
);
CREATE INDEX idx_pay_booking ON payments (booking_id);
CREATE INDEX idx_pay_status_date ON payments (status, payment_date);

CREATE TABLE galleries (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    access_code VARCHAR(16) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    cover_photo_id BIGINT,
    proof_selection_enabled BIT NOT NULL DEFAULT 0,
    proof_deadline DATE,
    published_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_gal_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
CREATE INDEX idx_gal_access_code ON galleries (access_code);

CREATE TABLE photos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gallery_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    caption VARCHAR(255),
    is_selected_proof BIT NOT NULL DEFAULT 0,
    is_cover BIT NOT NULL DEFAULT 0,
    uploaded_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_photo_gallery FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
);
CREATE INDEX idx_photo_gallery ON photos (gallery_id);

CREATE TABLE equipment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    notes VARCHAR(MAX),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
CREATE INDEX idx_eq_serial ON equipment (serial_number);
CREATE INDEX idx_eq_status ON equipment (status);

CREATE TABLE equipment_allocations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    photographer_id BIGINT NOT NULL,
    allocated_by_id BIGINT NOT NULL,
    allocated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    returned_at DATETIME2 NULL,
    notes VARCHAR(MAX),
    CONSTRAINT fk_ea_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_ea_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_photographer FOREIGN KEY (photographer_id) REFERENCES users(id),
    CONSTRAINT fk_ea_allocated_by FOREIGN KEY (allocated_by_id) REFERENCES users(id)
);
CREATE INDEX idx_ea_equipment_active ON equipment_allocations (equipment_id, returned_at);
CREATE INDEX idx_ea_booking ON equipment_allocations (booking_id);

CREATE TABLE notifications (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(MAX) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BIT NOT NULL DEFAULT 0,
    link VARCHAR(255),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notif_user_read ON notifications (user_id, is_read);

CREATE TABLE activity_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(100),
    user_email VARCHAR(120),
    action VARCHAR(100) NOT NULL,
    details VARCHAR(MAX),
    ip_address VARCHAR(50),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
CREATE INDEX idx_act_user ON activity_logs (user_id);
CREATE INDEX idx_act_created_at ON activity_logs (created_at);

CREATE TABLE feedback (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id BIGINT,
    name VARCHAR(100),
    email VARCHAR(120),
    type VARCHAR(30) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message VARCHAR(MAX) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    response VARCHAR(MAX),
    responded_by_id BIGINT,
    responded_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_fb_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_fb_responded_by FOREIGN KEY (responded_by_id) REFERENCES users(id)
);
CREATE INDEX idx_fb_status ON feedback (status);

CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(MAX),
    photographer_id BIGINT,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_rev_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_rev_photographer FOREIGN KEY (photographer_id) REFERENCES users(id)
);
CREATE INDEX idx_rev_photographer ON reviews (photographer_id);

CREATE TABLE system_settings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(MAX) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
