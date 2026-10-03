const Application = require("../models/application");
const Event = require("../models/event");

// Kaarigar applies to an event
const applyToEvent = async (req, res) => {
  try {
    const { eventId, craftType, description, photo } = req.body;

    // Check event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      event: eventId,
      kaarigar: req.user.userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this event",
      });
    }

    // Create application
    const application = await Application.create({
      event: eventId,
      kaarigar: req.user.userId,
      craftType,
      description,
      photo,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};


// Kaarigar sees their own applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      kaarigar: req.user.userId,
    })
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    res.json({
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};


// Admin sees all applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("event", "name date location")
      .populate("kaarigar", "name email")
      .sort({ createdAt: -1 });

    res.json({
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};


// Admin approves/rejects application
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = status;

    await application.save();

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update application",
      error: error.message,
    });
  }
};


module.exports = {
  applyToEvent,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
};