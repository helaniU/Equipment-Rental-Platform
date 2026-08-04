-- Database Initialization & Sample Seed Script

INSERT INTO "role" (id, name) VALUES 
('role-admin-uuid', 'ADMIN'),
('role-warehouse-uuid', 'WAREHOUSE_OPERATOR'),
('role-customer-uuid', 'CUSTOMER');

INSERT INTO "category" (id, name, description) VALUES 
('cat-av-uuid', 'Audio & Visual', 'Cameras and lenses');