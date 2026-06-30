-- Create extensions if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initialize basic tables or schemas if needed (TypeORM will handle core schema sync in dev mode)
CREATE TABLE IF NOT EXISTS system_init_check (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'READY'
);

INSERT INTO system_init_check (status) VALUES ('INITIALIZED') ON CONFLICT DO NOTHING;
