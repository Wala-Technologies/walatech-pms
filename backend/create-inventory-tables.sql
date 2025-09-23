-- Create inventory tables for the WalaPMS system (simplified without foreign keys)

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bins table
CREATE TABLE IF NOT EXISTS bins (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Serial Numbers table
CREATE TABLE IF NOT EXISTS serial_nos (
    id VARCHAR(36) PRIMARY KEY,
    serial_no VARCHAR(255) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36),
    status ENUM('Available', 'Delivered', 'Expired') DEFAULT 'Available',
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Entries table
CREATE TABLE IF NOT EXISTS stock_entries (
    id VARCHAR(36) PRIMARY KEY,
    entry_type ENUM('Material Receipt', 'Material Issue', 'Material Transfer', 'Manufacture', 'Repack', 'Send to Subcontractor', 'Material Consumption for Manufacture') NOT NULL,
    purpose VARCHAR(255),
    from_warehouse_id VARCHAR(36),
    to_warehouse_id VARCHAR(36),
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    total_outgoing_value DECIMAL(18,6) DEFAULT 0,
    total_incoming_value DECIMAL(18,6) DEFAULT 0,
    value_difference DECIMAL(18,6) DEFAULT 0,
    total_additional_costs DECIMAL(18,6) DEFAULT 0,
    docstatus TINYINT DEFAULT 0,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Entry Details table
CREATE TABLE IF NOT EXISTS stock_entry_details (
    id VARCHAR(36) PRIMARY KEY,
    stock_entry_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    qty DECIMAL(18,6) NOT NULL,
    basic_rate DECIMAL(18,6) DEFAULT 0,
    basic_amount DECIMAL(18,6) DEFAULT 0,
    additional_cost DECIMAL(18,6) DEFAULT 0,
    amount DECIMAL(18,6) DEFAULT 0,
    valuation_rate DECIMAL(18,6) DEFAULT 0,
    s_warehouse_id VARCHAR(36),
    t_warehouse_id VARCHAR(36),
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Ledger Entries table
CREATE TABLE IF NOT EXISTS stock_ledger_entries (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    voucher_type VARCHAR(255) NOT NULL,
    voucher_no VARCHAR(255) NOT NULL,
    voucher_detail_no VARCHAR(255),
    actual_qty DECIMAL(18,6) DEFAULT 0,
    qty_after_transaction DECIMAL(18,6) DEFAULT 0,
    incoming_rate DECIMAL(18,6) DEFAULT 0,
    outgoing_rate DECIMAL(18,6) DEFAULT 0,
    stock_value DECIMAL(18,6) DEFAULT 0,
    stock_value_difference DECIMAL(18,6) DEFAULT 0,
    batch_no VARCHAR(255),
    serial_no TEXT,
    tenant_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);