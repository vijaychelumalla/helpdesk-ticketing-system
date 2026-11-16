import Ticket from "../models/Ticket.js";
import logActivity from "../utils/logActivity.js";
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = {
      ...req.file,
      path: req.file.path.replace(/\\/g, "/"),
    };

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const attachFileToTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const normalizedPath = req.file.path.replace(/\\/g, "/");
    ticket.attachments.push(normalizedPath);

    await ticket.save();

    await logActivity(
  ticket._id,
  req.user.id,
  "File Attached",
  req.file.filename
);
    res.status(200).json({
      success: true,
      message: "File attached successfully",
      ticket,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};