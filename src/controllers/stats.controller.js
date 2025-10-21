import Party from "../models/Party.js";
import AuditLog from "../models/AuditLog.js";

export async function getStats(_req, res, next) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [total, remindersDue, dueToday, overdue, avgQuantityAgg, batches, topPlaces, topSellingPlaces, recentActivity] = await Promise.all([
      Party.countDocuments(),
      Party.countDocuments({ reminder: { $lte: now } }),
      Party.countDocuments({ reminder: { $gte: startOfToday, $lte: endOfToday } }),
      Party.countDocuments({ reminder: { $lt: startOfToday } }),
      Party.aggregate([{ $match: { quantity: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: "$quantity" } } }]),
      Party.aggregate([
        { $match: { batchFrom: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$batchFrom" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]),
      Party.aggregate([
        { $match: { place: { $ne: null, $ne: "" } } },
        { $group: { _id: "$place", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Party.aggregate([
        { $match: { sellingPlace: { $ne: null, $ne: "" } } },
        { $group: { _id: "$sellingPlace", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(5)
    ]);

    const avgQuantity = avgQuantityAgg?.[0]?.avg || 0;

    res.json({
      total,
      remindersDue,
      dueToday,
      overdue,
      avgQuantity,
      batches,
      topPlaces,
      topSellingPlaces,
      recentActivity
    });
  } catch (err) { next(err); }
}
