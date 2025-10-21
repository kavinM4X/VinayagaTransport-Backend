import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ["create","update","delete"], required: true },
  changes: { type: Object },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("AuditLog", auditLogSchema);
