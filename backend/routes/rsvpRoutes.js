const express = require("express");

const {
  registerForEvent,
  getMyRSVPs,
  getEventVisitors,
} = require("../controllers/rsvpController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Visitor registers for an event
router.post(
  "/",
  authMiddleware,
  authorizeRoles("VISITOR"),
  registerForEvent
);

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("VISITOR"),
  getMyRSVPs
);

// Admin gets visitors registered for an event
router.get(
  "/event/:eventId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getEventVisitors
);

module.exports = router;