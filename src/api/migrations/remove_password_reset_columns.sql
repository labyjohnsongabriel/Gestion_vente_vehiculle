ALTER TABLE users
DROP COLUMN IF EXISTS passwordResetToken,
DROP COLUMN IF EXISTS passwordResetExpires;
