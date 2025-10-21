import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  serialNo: { type: Number, index: true, unique: true, required: true },
  partyName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  batchFrom: { type: Date },
  batchTo: { type: Date },
  place: { type: String, trim: true },
  sellingPlace: { type: String, trim: true },
  quantity: { type: Number },
  // Weight fields
  weightGross: { type: Number, default: null },
  weightTare: { type: Number, default: null },
  weightNet: { type: Number, default: null, index: true },
  weightUnit: { type: String, enum: ["kg", "lb"], default: "kg" },
  reminder: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Helpful indexes for frequent queries
partySchema.index({ partyName: 1 });
partySchema.index({ place: 1 });
partySchema.index({ phone: 1 });
partySchema.index({ reminder: 1 });
partySchema.index({ batchFrom: 1 });

export default mongoose.model("Party", partySchema);
