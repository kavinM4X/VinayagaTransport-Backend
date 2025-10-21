import dotenv from "dotenv";
import { connectToDatabase } from "./src/config/db.js";
import User from "./src/models/User.js";
import Party from "./src/models/Party.js";
import AuditLog from "./src/models/AuditLog.js";

dotenv.config();

async function clearDatabase() {
  try {
    console.log("🗑️  Connecting to MongoDB Atlas...");
    await connectToDatabase();
    
    console.log("🗑️  Clearing all data...");
    
    // Delete all documents from each collection
    const userCount = await User.countDocuments();
    const partyCount = await Party.countDocuments();
    const auditCount = await AuditLog.countDocuments();
    
    console.log(`📊 Found ${userCount} users, ${partyCount} parties, ${auditCount} audit logs`);
    
    if (userCount > 0) {
      await User.deleteMany({});
      console.log("✅ Deleted all users");
    }
    
    if (partyCount > 0) {
      await Party.deleteMany({});
      console.log("✅ Deleted all parties");
    }
    
    if (auditCount > 0) {
      await AuditLog.deleteMany({});
      console.log("✅ Deleted all audit logs");
    }
    
    console.log("🎉 Database cleared successfully!");
    console.log("💡 Run 'npm run seed' to add sample data back");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
    process.exit(1);
  }
}

clearDatabase();

