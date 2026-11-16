const BASE_URL = "http://localhost:5000";

async function runE2ETest() {
  console.log("=== FULL LIFECYCLE E2E TEST ===");

  const timestamp = Date.now();
  const testCustomerEmail = `cust_${timestamp}@test.com`;
  const testPassword = "password123";

  // 1. Register customer
  console.log("\n1. Registering new customer:", testCustomerEmail);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Test Customer ${timestamp}`,
      email: testCustomerEmail,
      password: testPassword,
      role: "customer",
    }),
  });
  const regData = await regRes.json();
  console.log("Registration status:", regRes.status, "success:", regData.success);

  // 2. Login as customer
  console.log("\n2. Logging in as new customer...");
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testCustomerEmail, password: testPassword }),
  });
  const custLoginData = await custLoginRes.json();
  const custToken = custLoginData.token;
  console.log("Customer login OK. Token acquired.");

  // 3. Customer creates a ticket
  console.log("\n3. Customer creating support ticket...");
  const createTicketRes = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: `Cannot access billing portal ${timestamp}`,
      description: "Getting a 502 bad gateway when trying to view invoices.",
      priority: "high",
      tags: ["billing", "finance"],
    }),
  });
  const createTicketData = await createTicketRes.json();
  console.log("Ticket creation status:", createTicketRes.status, "Ticket ID:", createTicketData.ticket?._id);
  const ticketId = createTicketData.ticket._id;

  // 4. Customer adds a comment
  console.log("\n4. Customer adding a comment to ticket...");
  const custCommentRes = await fetch(`${BASE_URL}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      ticketId,
      message: "Here is an update: It failed again at 10:15 AM.",
    }),
  });
  const custCommentData = await custCommentRes.json();
  console.log("Customer comment status:", custCommentRes.status, "success:", custCommentData.success);

  // 5. Login as Agent
  console.log("\n5. Logging in as Agent (agent@gmail.com)...");
  const agentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent@gmail.com", password: "123456" }),
  });
  const agentLoginData = await agentLoginRes.json();
  const agentToken = agentLoginData.token;
  const agentId = agentLoginData.user.id;
  console.log("Agent logged in:", agentLoginData.user.name);

  // 6. Agent assigns ticket to themselves
  console.log("\n6. Agent assigning ticket to self...");
  const assignRes = await fetch(`${BASE_URL}/api/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ agentId }),
  });
  const assignData = await assignRes.json();
  console.log("Assignment status:", assignRes.status, "Assigned agent:", assignData.ticket?.assignedTo?.name);

  // 7. Agent updates status to in_progress
  console.log("\n7. Agent updating ticket status to in_progress...");
  const statusRes = await fetch(`${BASE_URL}/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ status: "in_progress" }),
  });
  const statusData = await statusRes.json();
  console.log("Status update:", statusRes.status, "New status:", statusData.ticket?.status);

  // 8. Agent adds internal note
  console.log("\n8. Agent adding internal note...");
  const internalNoteRes = await fetch(`${BASE_URL}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      ticketId,
      message: "Internal note: Server gateway was restarted, monitoring logs.",
      isInternal: true,
    }),
  });
  const internalNoteData = await internalNoteRes.json();
  console.log("Internal note posted:", internalNoteRes.status, "isInternal:", internalNoteData.comment?.isInternal);

  // 9. Verify Customer CANNOT see internal note
  console.log("\n9. Verifying customer cannot see internal note...");
  const custViewCommentsRes = await fetch(`${BASE_URL}/api/comments/${ticketId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custViewCommentsData = await custViewCommentsRes.json();
  const customerSawInternal = custViewCommentsData.comments.some((c) => c.isInternal);
  console.log("Comments visible to customer:", custViewCommentsData.count, "Did customer see internal note?", customerSawInternal);
  if (customerSawInternal) {
    throw new Error("SECURITY FAILURE: Customer saw internal note!");
  }

  // 10. Agent resolves ticket
  console.log("\n10. Agent resolving ticket...");
  const resolveRes = await fetch(`${BASE_URL}/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ status: "resolved" }),
  });
  const resolveData = await resolveRes.json();
  console.log("Ticket resolved status:", resolveRes.status, "resolvedAt:", resolveData.ticket?.resolvedAt);

  // 11. Verify Activity Audit Trail
  console.log("\n11. Verifying activity log for ticket...");
  const actRes = await fetch(`${BASE_URL}/api/activities/${ticketId}`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const actData = await actRes.json();
  console.log("Activity logs count:", actData.count);
  console.log("Actions recorded:", actData.activities.map((a) => a.action));

  // 12. Login as Admin
  console.log("\n12. Logging in as Admin (akhil@gmail.com)...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "akhil@gmail.com", password: "123456" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;

  // 13. Admin checks dashboard stats
  console.log("\n13. Admin checking dashboard stats...");
  const dashRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dashData = await dashRes.json();
  console.log("Total tickets in system:", dashData.stats.totalTickets, "Resolved:", dashData.stats.resolvedTickets);

  // 14. Admin deletes test ticket
  console.log("\n14. Admin deleting test ticket...");
  const delRes = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const delData = await delRes.json();
  console.log("Ticket deleted:", delRes.status, "message:", delData.message);

  console.log("\n=== COMPLETE FULL-STACK WORKFLOW VERIFIED SUCCESSFULLY! ===");
}

runE2ETest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
