-- Default system configuration values.
-- These can be changed by system_admin at runtime without a code deploy.
INSERT INTO core.system_config (key, value, description) VALUES
  ('min_kyc_level_to_join_group', '1',    'Minimum KYC level required to join any group'),
  ('min_kyc_level_for_loans',     '2',    'Minimum KYC level required to apply for a loan'),
  ('global_blacklist_enabled',    'true', 'Whether blacklisted users are blocked system-wide'),
  ('max_groups_per_member',       '10',   'Maximum number of groups one profile can belong to'),
  ('credit_score_decay_days',     '180',  'Days of inactivity before credit score starts decaying'),
  ('otp_expiry_minutes',          '10',   'Minutes before a phone OTP expires'),
  ('phone_verification_max_attempts', '3', 'Max incorrect OTP attempts before locking'),
  ('loan_max_processing_fee_rate', '5',   'Maximum processing fee rate (%) any group can set'),
  ('default_currency',            '"KES"', 'Default ISO 4217 currency code for new groups'),
  ('default_timezone',            '"Africa/Nairobi"', 'Default timezone for new groups')
ON CONFLICT (key) DO NOTHING;
