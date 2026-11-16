import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import logActivity from "../utils/logActivity.js";
import sendEmail from "../utils/sendEmail.js";
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, tags, attachments } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      tags: tags || [],
      attachments: attachments || [],
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

export const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      assignedTo,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Scoped to customer: customer only sees their own tickets
    if (req.user.role === "customer") {
      query.createdBy = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

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
    // Only authenticated Admin users can assign or reassign tickets
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only administrators can assign or reassign tickets",
      });
    }

    const { agentId } = req.body;

    if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "A valid Agent ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ticket ID",
      });
    }

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

    if (agent.role !== "agent") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an agent",
      });
    }

    if (agent.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Selected agent account is deactivated",
      });
    }

    const isReassignment = !!ticket.assignedTo && ticket.assignedTo.toString() !== agentId.toString();

    ticket.assignedTo = agentId;
    await ticket.save();

    await sendEmail(
      agent.email,
      isReassignment ? "Ticket Reassigned" : "New Ticket Assigned",
      `You have been assigned to ticket: ${ticket.title}`
    );

    await logActivity(
      ticket._id,
      req.user.id,
      isReassignment ? "Ticket Reassigned" : "Ticket Assigned",
      `Assigned to ${agent.name} (${agent.email})`
    );

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      message: isReassignment ? "Ticket reassigned successfully" : "Ticket assigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Assign Ticket Error:", error);

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