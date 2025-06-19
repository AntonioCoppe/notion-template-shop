const templates = [
  {
    id: "freelancer-dashboard",
    title: "Freelancer Dashboard",
    price: 0.50,                       // or 9 if you set 900 cents
    priceId: "price_1Rakf1GHXWTZ0uYsInqgtoks", // <- from `stripe prices list`
    img: "/freelancer.jpg",
    description: "Track clients, invoices and deadlines in one place.",
    notionUrl: "https://yudax.notion.site/The-Freelancer-dashboard-88a2034a2585497d8a0419b576aa3f3b",
  },
  {
    id: "personal-crm",
    title: "Reading List",
    price: 1.00,
    priceId: "price_1RakcBGHXWTZ0uYsSiu5Nc6G",
    img: "/reading-list.png",
    description: "Keep track of your favourite books.",
    notionUrl: "https://www.notion.so/67f08bb0d02247f99a816d0a291e61de?v=5816ec73e61b4b5ab3dde64b86fb4e87&source=copy_link",
  },
];
export default templates;
