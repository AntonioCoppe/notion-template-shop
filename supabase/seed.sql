-- Sample development seed data

-- Vendor user
insert into vendors (id, user_id, stripe_account_id, country)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  null,
  'US'
);

-- Demo template for the vendor
insert into templates (id, vendor_id, title, price, notion_url, img)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Demo Template',
  9.99,
  'https://example.com/notion',
  'https://example.com/image.png'
);

-- Buyer user
insert into buyers (id, user_id)
values (
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333'
);

-- Example order linking buyer and template
insert into orders (id, template_id, buyer_id, amount, status)
values (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  9.99,
  'paid'
);
