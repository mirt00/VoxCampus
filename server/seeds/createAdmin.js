require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User.model");

const ADMIN = {
  name: "Super Admin",
  email: "admin@voxcampus.edu",
  password: "Admin@123",
  role: "superadmin",
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    // Ensure role is superadmin even if already exists
    existing.role = "superadmin";
    existing.isActive = true;
    await existing.save();
    console.log(`✓ Admin already exists — role set to superadmin`);
    console.log(`  Email:    ${ADMIN.email}`);
    console.log(`  Password: (unchanged)`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN.password, 12);
  await User.create({ ...ADMIN, passwordHash, password: undefined });

  console.log("✓ Superadmin created successfully");
  console.log(`  Email:    ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  console.log("\n  Login at: http://localhost:5173/admin/login");
  process.exit(0);
};

run().catch((err) => { console.error("Error:", err.message); process.exit(1); });
