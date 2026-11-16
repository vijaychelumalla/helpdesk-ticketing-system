import Ticket from "../models/Ticket.js";

export const getDashboardStats = async (req, res) => {
  try {
    const scope = req.user.role === "customer" ? { createdBy: req.user.id } : {};

    const totalTickets = await Ticket.countDocuments(scope);

    const openTickets = await Ticket.countDocuments({
      ...scope,
      status: "open",
    });

    const inProgressTickets = await Ticket.countDocuments({
      ...scope,
      status: "in_progress",
    });

    const waitingTickets = await Ticket.countDocuments({
      ...scope,
      status: "waiting",
    });

    const resolvedTickets = await Ticket.countDocuments({
      ...scope,
      status: "resolved",
    });

    const closedTickets = await Ticket.countDocuments({
      ...scope,
      status: "closed",
    });

    // Priority breakdown
    const lowPriority = await Ticket.countDocuments({
      ...scope,
      priority: "low",
    });
    const mediumPriority = await Ticket.countDocuments({
      ...scope,
      priority: "medium",
    });
    const highPriority = await Ticket.countDocuments({
      ...scope,
      priority: "high",
    });
    const urgentPriority = await Ticket.countDocuments({
      ...scope,
      priority: "urgent",
    });

    // Recent tickets
    const recentTickets = await Ticket.find(scope)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        waitingTickets,
        resolvedTickets,
        closedTickets,
        lowPriority,
        mediumPriority,
        highPriority,
        urgentPriority,
      },
      recentTickets,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};