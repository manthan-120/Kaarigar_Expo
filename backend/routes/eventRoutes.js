const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  getEventKaarigars,
} = require("../controllers/eventController");

const {authMiddleware,authorizeRoles} = require("../middleware/authMiddleware");

const router = express.Router();

// Create event
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createEvent);

// Get all events
router.get("/", getEvents);

// Get approved participating kaarigars for an event
router.get("/:id/kaarigars", getEventKaarigars);

// Get single event
router.get("/:id", getEventById);

module.exports = router;