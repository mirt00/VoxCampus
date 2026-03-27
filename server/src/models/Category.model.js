const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    weight: { type: Number, default: 1.0 },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
