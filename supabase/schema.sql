BEGIN;

-- 0) Drop everything (in the right order)
DROP TABLE IF EXISTS orders      CASCADE;
DROP TABLE IF EXISTS templates   CASCADE;
DROP TABLE IF EXISTS vendors     CASCADE;
DROP TABLE IF EXISTS buyers      CASCADE;
DROP TABLE IF EXISTS users       CASCADE;  -- only if you still had a public.users table

-- 1) Buyers — each buyer is an auth.user
CREATE TABLE buyers (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid        NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Vendors — each vendor is an auth.user, with Stripe info
CREATE TABLE vendors (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid        NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 3) Templates — sold by vendors
CREATE TABLE templates (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id  uuid        NOT NULL
    REFERENCES vendors(id)   ON DELETE CASCADE,
  price      numeric(10,2) NOT NULL,
  notion_url text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Orders — link buyers to templates
CREATE TABLE orders (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid        NOT NULL
    REFERENCES templates(id) ON DELETE CASCADE,
  buyer_id    uuid        NOT NULL
    REFERENCES buyers(id)    ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL,
  status      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMIT;
