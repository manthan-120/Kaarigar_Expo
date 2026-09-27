const RSVP = require("../models/rsvp");
const Event = require("../models/event");

// Visitor registers for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Check whether event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check whether visitor already registered
    const existingRSVP = await RSVP.findOne({
      event: eventId,
      visitor: req.user.userId,
    });

    if (existingRSVP) {
      return res.status(400).json({
        message: "You are already registered for this event",
      });
    }

    // Create RSVP
    const rsvp = await RSVP.create({
      event: eventId,
      visitor: req.user.userId,
      paymentStatus: event.visitorFee > 0 ? "PENDING" : "PAID",
    });

    res.status(201).json({
      message: "Event registration successful",
      rsvp,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register for event",
      error: error.message,
    });
  }
};

const getMyRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({
      visitor: req.user.userId,
    })
      .populate(
        "event",
        "name date location description visitorFee"
      )
      .sort({ createdAt: -1 });

    res.json({
      rsvps,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your registrations",
      error: error.message,
    });
  }
};

const getEventVisitors = async (req, res) => {
  try {
    const rsvps = await RSVP.find({
      event: req.params.eventId,
      status: "REGISTERED",
    })
      .populate("visitor", "name email")
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    res.json({
      rsvps,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch event visitors",
      error: error.message,
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRSVPs,
  getEventVisitors,
};