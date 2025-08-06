
-- Add this to your database (run in Supabase SQL editor)

-- Function to validate customer ID uniqueness
CREATE OR REPLACE FUNCTION validate_stripe_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new customer ID is already used by another user
  IF NEW.stripe_customer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE stripe_customer_id = NEW.stripe_customer_id 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Stripe customer ID % is already used by another user', NEW.stripe_customer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run validation on insert/update
DROP TRIGGER IF EXISTS validate_stripe_customer_id_trigger ON users;
CREATE TRIGGER validate_stripe_customer_id_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_customer_id();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
