import Ticket from "../models/Ticket.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();

    const openTickets = await Ticket.countDocuments({
      status: "open",
    });

    const inProgressTickets = await Ticket.countDocuments({
      status: "in_progress",
    });

    const resolvedTickets = await Ticket.countDocuments({
      status: "resolved",
    });

    const closedTickets = await Ticket.countDocuments({
      status: "closed",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};