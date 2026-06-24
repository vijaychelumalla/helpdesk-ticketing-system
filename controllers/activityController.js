import Activity from "../models/Activity.js";

export const getTicketActivities = async (
  req,
  res
) => {
  try {
    const activities = await Activity.find({
      ticket: req.params.ticketId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
