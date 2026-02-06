-- Enable Row Level Security on all tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations for authenticated users
-- You can customize these policies later based on your authentication needs

-- Tags policies (read-only for everyone, write for authenticated)
CREATE POLICY "Allow read access to tags for all" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow insert tags for authenticated users" ON tags
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update tags for authenticated users" ON tags
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete tags for authenticated users" ON tags
  FOR DELETE USING (true);

-- Accounts policies
CREATE POLICY "Allow all access to accounts" ON accounts
  FOR ALL USING (true);

CREATE POLICY "Allow all access to account_tags" ON account_tags
  FOR ALL USING (true);

-- Contacts policies
CREATE POLICY "Allow all access to contacts" ON contacts
  FOR ALL USING (true);

-- Deals policies
CREATE POLICY "Allow all access to deals" ON deals
  FOR ALL USING (true);

CREATE POLICY "Allow all access to deal_tags" ON deal_tags
  FOR ALL USING (true);

-- Filter conditions policies
CREATE POLICY "Allow all access to filter_conditions" ON filter_conditions
  FOR ALL USING (true);

-- Custom reports policies
CREATE POLICY "Allow all access to custom_reports" ON custom_reports
  FOR ALL USING (true);
