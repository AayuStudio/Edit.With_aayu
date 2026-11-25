create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  order_id text unique, name text, email text, whatsapp text,
  service text, package text, duration text, requirements text,
  reference_link text, delivery_date date, instructions text,
  amount integer default 0, status text default 'New Order',
  razorpay_order_id text, payment_id text
);
alter table orders enable row level security;
