-- Track which corporate tier the organization is currently on
-- ('team' or 'business'). Team and Business share a single graduated Stripe
-- Price, so the buyer-clicked tier is the source of truth and is recorded
-- here from the Stripe session/subscription metadata (planTier).
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT;

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier
  ON organizations (subscription_tier);
