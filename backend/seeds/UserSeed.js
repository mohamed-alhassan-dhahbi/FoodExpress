require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const users = [
  { firstName: "Admin",  lastName: "FoodExpress", email: "admin@foodexpress.com",  phone: "20000001", role: "ADMIN" },
  { firstName: "Resto",  lastName: "Owner",       email: "resto@foodexpress.com",  phone: "20000002", role: "RESTAURANT" },
  { firstName: "Client", lastName: "One",         email: "client@foodexpress.com", phone: "20000003", role: "CLIENT" }
];

// Dev-only password, shared by all seeded accounts
const PASSWORD = "Password123!";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashed = await bcrypt.hash(PASSWORD, 12);

    for (const u of users) {
      // Upsert so the script can be run many times without duplicates
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u, password: hashed, isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded ${u.role}: ${u.email}`);
    }

    console.log(`Done. Password for all accounts: ${PASSWORD}`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();