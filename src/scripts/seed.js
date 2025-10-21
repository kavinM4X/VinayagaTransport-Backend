import dotenv from "dotenv";
import { connectToDatabase } from "../config/db.js";
import User from "../models/User.js";
import Party from "../models/Party.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";

dotenv.config();

async function upsertAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const name = process.env.SEED_ADMIN_NAME || "System Admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, passwordHash, role: "admin" });
    await AuditLog.create({ entity: "User", entityId: user._id, action: "create", changes: { email }, user: user._id });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }
  return user;
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seedParties(createdBy) {
  // Always ensure there are at least 15 parties available with the requested routes
  const count = await Party.countDocuments();
  const needed = Math.max(0, 15 - count);
  if (needed === 0) {
    console.log(`Parties already exist: ${count}`);
    return;
  }

  const now = new Date();
  const routes = ["ramanager", "mampalli"]; // as requested
  const baseNames = [
    "Alpha Traders", "Beta Logistics", "Gamma Movers", "Delta Freight", "Epsilon Carriers",
    "Zeta Transport", "Eta Express", "Theta Supply", "Iota Cargo", "Kappa Lines",
    "Lambda Shippers", "Mu Couriers", "Nu Transit", "Xi Movers", "Omicron Logistics"
  ];

  const toInsert = [];
  for (let i = 0; i < needed; i++) {
    const idx = count + i + 1; // continue serial numbers
    const route = routes[i % routes.length];
    const name = baseNames[i % baseNames.length];
    const quantity = 50 + ((i * 7) % 200);
    const from = new Date(now.getFullYear(), now.getMonth() - (i % 3), 1 + (i % 10));
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 14);
    const phone = `9${(100000000 + (i * 1234567)) % 900000000}`.padEnd(10, '0');

    toInsert.push({
      serialNo: idx,
      partyName: name,
      phone,
      place: route,
      sellingPlace: route,
      quantity,
      batchFrom: from,
      batchTo: to,
      reminder: daysFromNow((i % 5) - 2),
      createdBy,
    });
  }

  const inserted = await Party.insertMany(toInsert);
  for (const p of inserted) {
    await AuditLog.create({ entity: "Party", entityId: p._id, action: "create", changes: p, user: createdBy });
  }
  console.log(`Inserted ${inserted.length} parties (total now: ${count + inserted.length}).`);
}

async function main() {
  await connectToDatabase();
  const admin = await upsertAdmin();
  await seedParties(admin._id);
  console.log("Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



