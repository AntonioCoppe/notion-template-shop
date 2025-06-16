const templates = [
  {
    id: "freelancer-dashboard",
    title: "Freelancer Dashboard",
    price: 0.50,                       // or 9 if you set 900 cents
    priceId: "price_1Rakf1GHXWTZ0uYsInqgtoks", // <- from `stripe prices list`
    img: "/freelancer.jpg",
    description: "Track clients, invoices and deadlines in one place.",
    notionUrl: "https://www.notion.so/duplicate-link",
  },
  {
    id: "personal-crm",
    title: "Personal CRM",
    price: 1.00,
    priceId: "price_1RakcBGHXWTZ0uYsSiu5Nc6G",
    img: "/crm.jpg",
    description: "Never forget a birthday or follow-up again.",
    notionUrl: "https://www.notion.so/duplicate-link-placeholder",
  },
];
export default templates;
