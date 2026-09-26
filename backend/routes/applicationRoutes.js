const express = require("express");

const {
  applyToEvent,
  getAllApplications,
  updateApplicationStatus,
  getMyApplications
} = require("../controllers/applicationController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Kaarigar applies to an event
router.post(
  "/",
  authMiddleware,
  authorizeRoles("KAARIGAR"),
  applyToEvent
);

// Admin gets all applications
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllApplications
);

// Kaarigar gets their own applications
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("KAARIGAR"),
  getMyApplications
);

// Admin approves or rejects an application
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateApplicationStatus
);

module.exports = router;