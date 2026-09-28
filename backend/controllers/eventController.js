const Event = require("../models/event");
const Application = require("../models/application");
const cloudinary = require("../config/cloudinary");

// Create event
const createEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      location,
      description,
      visitorFee,
      kaarigarFee,
    } = req.body;

    let imageUrl = "";

    // Upload image to Cloudinary if an image was selected
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "kaarigar-expo/events",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const event = await Event.create({
      name,
      date,
      location,
      description,
      visitorFee,
      kaarigarFee,
      image: imageUrl,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json({
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

const getEventKaarigars = async (req, res) => {
  try {
    const applications = await Application.find({
      event: req.params.id,
      status: "APPROVED",
    })
      .populate("kaarigar", "name email")
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    res.json({
      kaarigars: applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch participating kaarigars",
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getEventKaarigars,
};