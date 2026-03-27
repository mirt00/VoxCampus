require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/Category.model");

const categories = [
  { name: "Infrastructure / Burst Pipe", slug: "infrastructure", weight: 0.5, description: "Physical infrastructure issues" },
  { name: "Safety / Emergency", slug: "safety", weight: 0.5, description: "Safety and emergency concerns" },
  { name: "Academic / Exam Issues", slug: "academic", weight: 0.75, description: "Academic and examination related" },
  { name: "Facilities / Maintenance", slug: "facilities", weight: 1.0, description: "General facilities and maintenance" },
  { name: "Services / Admin", slug: "services", weight: 1.25, description: "Administrative and service issues" },
  { name: "General Suggestion", slug: "general", weight: 1.5, description: "General suggestions and feedback" },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log("Categories seeded successfully");
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
