import Party from "../models/Party.js";
import AuditLog from "../models/AuditLog.js";
import { Parser as CsvParser } from "json2csv";

export async function listParties(req, res, next) {
  try {
    const { q, place, phone, from, to, reminder, minNetWeight, maxNetWeight } = req.query;
    const filter = {};
    if (q) filter.partyName = { $regex: q, $options: "i" };
    if (place) filter.place = { $regex: place, $options: "i" };
    if (phone) filter.phone = { $regex: phone, $options: "i" };
    if (from || to) filter.batchFrom = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
    if (reminder === "due") filter.reminder = { $lte: new Date() };
    if (minNetWeight || maxNetWeight) filter.weightNet = { ...(minNetWeight && { $gte: Number(minNetWeight) }), ...(maxNetWeight && { $lte: Number(maxNetWeight) }) };
    const parties = await Party.find(filter).sort({ createdAt: -1 });
    res.json(parties);
  } catch (err) { next(err); }
}

export async function getParty(req, res, next) {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: "Not found" });
    res.json(party);
  } catch (err) { next(err); }
}

export async function createParty(req, res, next) {
  try {
    const payload = req.body;
    if (req.user?.id) payload.createdBy = req.user.id;
    // Auto-assign serial number if not provided
    if (payload.serialNo == null) {
      const last = await Party.findOne({}, { serialNo: 1 }).sort({ serialNo: -1 });
      payload.serialNo = (last?.serialNo || 0) + 1;
    }
    // Compute net weight if not explicitly provided
    if (payload.weightGross != null && payload.weightTare != null && payload.weightNet == null) {
      payload.weightNet = Number(payload.weightGross) - Number(payload.weightTare);
    }
    const party = await Party.create(payload);
    await AuditLog.create({ entity: "Party", entityId: party._id, action: "create", changes: payload, user: req.user?.id });
    res.status(201).json(party);
  } catch (err) { next(err); }
}

export async function updateParty(req, res, next) {
  try {
    const before = await Party.findById(req.params.id);
    if (!before) return res.status(404).json({ message: "Not found" });
    const update = { ...req.body };
    if (update.weightGross != null && update.weightTare != null && update.weightNet == null) {
      update.weightNet = Number(update.weightGross) - Number(update.weightTare);
    }
    const after = await Party.findByIdAndUpdate(req.params.id, update, { new: true });
    await AuditLog.create({ entity: "Party", entityId: after._id, action: "update", changes: { before, after }, user: req.user?.id });
    res.json(after);
  } catch (err) { next(err); }
}

export async function getPartyHistory(req, res, next) {
  try {
    const logs = await AuditLog.find({ entity: 'Party', entityId: req.params.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) { next(err); }
}

export async function deleteParty(req, res, next) {
  try {
    const before = await Party.findByIdAndDelete(req.params.id);
    if (!before) return res.status(404).json({ message: "Not found" });
    await AuditLog.create({ entity: "Party", entityId: before._id, action: "delete", changes: { before }, user: req.user?.id });
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function exportParties(req, res, next) {
  try {
    const { format = "csv" } = req.query;
    const filter = {};
    const query = Party.find(filter).sort({ createdAt: -1 });
    const parties = await query.lean();

    if (format === "csv") {
      const fields = [
        "serialNo","partyName","phone","batchFrom","batchTo","place","sellingPlace","quantity","weightGross","weightTare","weightNet","weightUnit","reminder","createdAt","updatedAt"
      ];
      const parser = new CsvParser({ fields });
      const csv = parser.parse(parties);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=parties.csv");
      return res.status(200).send(csv);
    }

    return res.json(parties);
  } catch (err) { next(err); }
}

export async function bulkUpdate(req, res, next) {
  try {
    const { ids, data } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(422).json({ message: "ids is required" });
    if (!data || typeof data !== "object") return res.status(422).json({ message: "data is required" });
    const result = await Party.updateMany({ _id: { $in: ids } }, { $set: data });
    await AuditLog.create({ entity: "Party", entityId: null, action: "update", changes: { ids, data }, user: req.user?.id });
    res.json({ matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified });
  } catch (err) { next(err); }
}

export async function bulkDelete(req, res, next) {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(422).json({ message: "ids is required" });
    const result = await Party.deleteMany({ _id: { $in: ids } });
    await AuditLog.create({ entity: "Party", entityId: null, action: "delete", changes: { ids }, user: req.user?.id });
    res.json({ deleted: result.deletedCount });
  } catch (err) { next(err); }
}
