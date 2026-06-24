import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import logActivity from "../utils/logActivity.js";

import sendEmail from "../utils/sendEmail.js";
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, tags } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      tags,
      createdBy: req.user.id,
    });


await logActivity(
  ticket._id,
  req.user.id,
  "Ticket Created",
  ticket.title
);
    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
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


// export const getTickets = async (req, res) => {
//   try {
//     let tickets;

//     if (req.user.role === "customer") {
//       tickets = await Ticket.find({
//         createdBy: req.user.id,
//       })
//         .populate("createdBy", "name email")
//         .populate("assignedTo", "name email");
//     } else {
//       tickets = await Ticket.find()
//         .populate("createdBy", "name email")
//         .populate("assignedTo", "name email");
//     }

//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       tickets,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      tickets,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Customer can only view their own ticket
    if (
      req.user.role === "customer" &&
      ticket.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
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

export const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const agent = await User.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    if (!["agent", "admin"].includes(agent.role)) {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an agent",
      });
    }

    ticket.assignedTo = agentId;

    await ticket.save();

    await sendEmail(
  agent.email,
  "New Ticket Assigned",
  `You have been assigned a new ticket: ${ticket.title}`
);
    await logActivity(
  ticket._id,
  req.user.id,
  "Ticket Assigned",
  `Assigned to ${agent.name}`
);

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "open",
      "in_progress",
      "waiting",
      "resolved",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    if (status === "resolved") {
  const user = await User.findById(
    ticket.createdBy
  );

  await sendEmail(
    user.email,
    "Ticket Resolved",
    `Your ticket "${ticket.title}" has been resolved.`
  );
}

await logActivity(
  ticket._id,
  req.user.id,
  "Status Updated",
  status
);

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
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

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};