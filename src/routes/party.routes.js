import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { listParties, getParty, createParty, updateParty, deleteParty, getPartyHistory, exportParties, bulkUpdate, bulkDelete } from "../controllers/party.controller.js";

const router = Router();

router.get("/", requireAuth, listParties);
router.get("/:id", requireAuth, getParty);
router.get("/:id/history", requireAuth, getPartyHistory);
router.get("/export/file", requireAuth, exportParties);
router.get("/export", requireAuth, exportParties);
router.post("/", requireAuth, [
  body("partyName").notEmpty(),
], validateRequest, createParty);
router.put("/:id", requireAuth, updateParty);
router.delete("/:id", requireAuth, deleteParty);
router.post("/bulk-update", requireAuth, bulkUpdate);
router.post("/bulk-delete", requireAuth, bulkDelete);

export default router;
