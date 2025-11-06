-- Add maintenance and tracking fields to user_vehicles table
ALTER TABLE user_vehicles
ADD COLUMN oil_change_date DATE,
ADD COLUMN insurance_expiry_date DATE,
ADD COLUMN technical_condition INTEGER DEFAULT 0,
ADD COLUMN average_consumption NUMERIC(5,2),
ADD COLUMN next_service_date DATE;