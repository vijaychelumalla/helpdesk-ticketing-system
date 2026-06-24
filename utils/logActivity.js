import Activity from "../models/Activity.js";

const logActivity = async (
  ticketId,
  userId,
  action,
  details = ""
) => {
  try {
    console.log({
      ticketId,
      userId,
      action,
      details,
    });

    const activity = await Activity.create({
      ticket: ticketId,
      user: userId,
      action,
      details,
    });

    console.log("Activity Saved:", activity);
  } catch (error) {
    console.log("Activity Log Error:", error);
  }
};

export default logActivity;
// import Activity from "../models/Activity.js";

// const logActivity = async (
//   ticketId,
//   userId,
//   action,
//   details = ""
// ) => {
//   try {
//     await Activity.create({
//       ticket: ticketId,
//       user: userId,
//       action,
//       details,
//     });
//   } catch (error) {
//     console.log("Activity Log Error:", error);
//   }
// };

// export default logActivity;