import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import logActivity from "../utils/logActivity.js";

// export const addComment = async (req, res) => {
//   try {
//     const { ticketId, message, isInternal } = req.body;

//     const ticket = await Ticket.findById(ticketId);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     const comment = await Comment.create({
//       ticket: ticketId,
//       user: req.user.id,
//       message,
//       isInternal: isInternal || false,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Comment added successfully",
//       comment,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const addComment = async (req, res) => {
  try {
    const { ticketId, message, isInternal } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Customer cannot create internal notes
    if (isInternal && req.user.role === "customer") {
      return res.status(403).json({
        success: false,
        message: "Customers cannot create internal notes",
      });
    }

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user.id,
      message,
      isInternal: isInternal || false,
    });

await logActivity(
  ticketId,
  req.user.id,
  "Comment Added",
  message
);


    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// export const getCommentsByTicket = async (req, res) => {
//   try {
//     const comments = await Comment.find({
//       ticket: req.params.ticketId,
//     })
//       .populate("user", "name email role")
//       .sort({ createdAt: 1 });

//     res.status(200).json({
//       success: true,
//       count: comments.length,
//       comments,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };


export const getCommentsByTicket = async (req, res) => {
  try {
    let query = {
      ticket: req.params.ticketId,
    };

    // Customers should not see internal notes
    if (req.user.role === "customer") {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};