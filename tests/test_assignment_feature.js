import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

async function runAssignmentTests() {
  console.log("====================================================");
  console.log("STARTING TEST SUITE: Ticket Stakeholders Agent Assignment");
  console.log("====================================================\n");

  // Step 1: Login as Admin
  console.log("1. Logging in as Admin (akhil@gmail.com)...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "akhil@gmail.com", password: "password123" }),
  });
  let adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.token) {
    // try 123456
    const res2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "akhil@gmail.com", password: "123456" }),
    });
    adminLoginData = await res2.json();
  }
  const adminToken = adminLoginData.token;
  console.log("Admin logged in successfully:", adminLoginData.user.name, adminLoginData.user.role);

  // Step 2: Login as Agent 1 & Agent 2
  console.log("\n2. Logging in as Agent 1 (agent@gmail.com)...");
  const agent1LoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent@gmail.com", password: "123456" }),
  });
  const agent1Data = await agent1LoginRes.json();
  const agent1Token = agent1Data.token;
  const agent1Id = agent1Data.user.id;
  console.log("Agent 1 logged in:", agent1Data.user.name, `(${agent1Id})`);

  console.log("\n2b. Logging in as Agent 2 (yash@gmail.com)...");
  const agent2LoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "yash@gmail.com", password: "123456" }),
  });
  const agent2Data = await agent2LoginRes.json();
  const agent2Token = agent2Data.token;
  const agent2Id = agent2Data.user.id;
  console.log("Agent 2 logged in:", agent2Data.user.name, `(${agent2Id})`);

  // Step 3: Verify dynamic agents list API (GET /api/users?role=agent)
  console.log("\n3. Testing dynamic Agents fetch API (GET /api/users?role=agent)...");
  const agentsListRes = await fetch(`${BASE_URL}/api/users?role=agent&limit=100`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const agentsListData = await agentsListRes.json();
  console.log("Fetch status:", agentsListRes.status, "Agents found:", agentsListData.users?.length);
  const foundAgents = agentsListData.users || [];
  if (foundAgents.some((u) => u.role !== "agent")) {
    throw new Error("ERROR: Non-agent returned in agents list!");
  }
  console.log("Verified: All returned users have role 'agent':", foundAgents.map((a) => `${a.name} <${a.email}>`));

  // Step 4: Create a fresh unassigned ticket (as Customer or Admin)
  console.log("\n4. Creating fresh unassigned ticket for assignment testing...");
  const createTicketRes = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Printer Network Connection Failure",
      description: "Network printer on 2nd floor is not responding to ping.",
      priority: "medium",
      tags: ["hardware", "network"],
    }),
  });
  const createTicketData = await createTicketRes.json();
  const testTicketId = createTicketData.ticket._id;
  console.log("Ticket created:", testTicketId, "initial assignedTo:", createTicketData.ticket.assignedTo);

  // Step 5: Test Non-Admin authorization rejection (Requirement 8)
  console.log("\n5. Testing Security: Confirm non-Admin cannot assign or reassign tickets (direct API request)...");
  const agentAssignRes = await fetch(`${BASE_URL}/api/tickets/${testTicketId}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agent1Token}`,
    },
    body: JSON.stringify({ agentId: agent1Id }),
  });
  console.log("Agent direct assignment attempt status:", agentAssignRes.status);
  if (agentAssignRes.status !== 403) {
    throw new Error(`SECURITY FAILURE: Expected 403 Forbidden for agent, got ${agentAssignRes.status}`);
  }
  console.log("Verified: Agent assignment rejected with 403 Forbidden.");

  // Customer direct API attempt
  const testCustEmail = `cust_perm_${Date.now()}@test.com`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Perm Test Customer",
      email: testCustEmail,
      password: "password123",
      role: "customer",
    }),
  });
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testCustEmail, password: "password123" }),
  });
  const custLoginData = await custLoginRes.json();
  const custToken = custLoginData.token;
  const custAssignRes = await fetch(`${BASE_URL}/api/tickets/${testTicketId}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({ agentId: agent1Id }),
  });
  console.log("Customer direct assignment attempt status:", custAssignRes.status);
  if (custAssignRes.status !== 403) {
    throw new Error(`SECURITY FAILURE: Expected 403 Forbidden for customer, got ${custAssignRes.status}`);
  }
  console.log("Verified: Customer assignment rejected with 403 Forbidden.");

  // Step 6: Test Admin Assigns ticket to Agent 1 (VijayAgent)
  console.log(`\n6. Admin assigning ticket to Agent 1 (${agent1Data.user.name} - ${agent1Id})...`);
  const assign1Res = await fetch(`${BASE_URL}/api/tickets/${testTicketId}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agentId: agent1Id }),
  });
  const assign1Data = await assign1Res.json();
  console.log("Assignment response status:", assign1Res.status, "message:", assign1Data.message);
  console.log("Assigned agent in returned ticket:", assign1Data.ticket?.assignedTo?.name, `(${assign1Data.ticket?.assignedTo?.email})`);
  if (assign1Data.ticket?.assignedTo?._id !== agent1Id) {
    throw new Error("ERROR: Ticket assignedTo does not match Agent 1 ID!");
  }

  // Step 7: Verify database persistence directly
  console.log("\n7. Verifying MongoDB database persistence...");
  await mongoose.connect(process.env.MONGO_URI);
  const Ticket = (await import("../models/Ticket.js")).default;
  const dbTicket1 = await Ticket.findById(testTicketId);
  console.log("Direct DB query assignedTo ObjectId:", dbTicket1.assignedTo.toString());
  if (dbTicket1.assignedTo.toString() !== agent1Id) {
    throw new Error("ERROR: Database assignedTo does not match Agent 1 ObjectId!");
  }
  console.log("Verified: Database stores correct Agent ObjectId.");

  // Step 8: Verify GET /api/tickets/:id returns populated assignedTo
  console.log("\n8. Testing Ticket Details API (GET /api/tickets/:id) persistence...");
  const detail1Res = await fetch(`${BASE_URL}/api/tickets/${testTicketId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const detail1Data = await detail1Res.json();
  console.log("Ticket details assignedTo:", detail1Data.ticket?.assignedTo);
  if (detail1Data.ticket?.assignedTo?.email !== "agent@gmail.com") {
    throw new Error("ERROR: Ticket details API did not return populated assignedTo name and email!");
  }
  console.log("Verified: Ticket details returns populated name and email.");

  // Step 9: Verify Agent 1 dashboard / assigned list shows this ticket
  console.log("\n9. Testing Agent 1 assigned tickets list...");
  const agent1TicketsRes = await fetch(`${BASE_URL}/api/tickets?assignedTo=${agent1Id}`, {
    headers: { Authorization: `Bearer ${agent1Token}` },
  });
  const agent1TicketsData = await agent1TicketsRes.json();
  const agent1HasTicket = agent1TicketsData.tickets.some((t) => t._id === testTicketId);
  console.log("Does Agent 1 see ticket in their assigned list?", agent1HasTicket);
  if (!agent1HasTicket) {
    throw new Error("ERROR: Ticket does not appear in Agent 1's assigned ticket list!");
  }

  // Step 10: Reassign ticket to Agent 2 (yash)
  console.log(`\n10. Admin REASSIGNING ticket to Agent 2 (${agent2Data.user.name} - ${agent2Id})...`);
  const reassignRes = await fetch(`${BASE_URL}/api/tickets/${testTicketId}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agentId: agent2Id }),
  });
  const reassignData = await reassignRes.json();
  console.log("Reassign status:", reassignRes.status, "message:", reassignData.message);
  console.log("New assigned agent:", reassignData.ticket?.assignedTo?.name, `(${reassignData.ticket?.assignedTo?.email})`);
  if (reassignData.ticket?.assignedTo?._id !== agent2Id) {
    throw new Error("ERROR: Ticket assignedTo does not match Agent 2 ID after reassignment!");
  }

  // Step 11: Verify both Agent dashboards after reassignment (Requirement 7)
  console.log("\n11. Verifying dashboards after reassignment...");
  const agent1AfterRes = await fetch(`${BASE_URL}/api/tickets?assignedTo=${agent1Id}`, {
    headers: { Authorization: `Bearer ${agent1Token}` },
  });
  const agent1AfterData = await agent1AfterRes.json();
  const agent1StillHasTicket = agent1AfterData.tickets.some((t) => t._id === testTicketId);
  console.log("Agent 1 still has ticket?", agent1StillHasTicket, "(Expected: false)");
  if (agent1StillHasTicket) {
    throw new Error("ERROR: Ticket still appears in previous Agent's assigned list!");
  }

  const agent2AfterRes = await fetch(`${BASE_URL}/api/tickets?assignedTo=${agent2Id}`, {
    headers: { Authorization: `Bearer ${agent2Token}` },
  });
  const agent2AfterData = await agent2AfterRes.json();
  const agent2HasTicket = agent2AfterData.tickets.some((t) => t._id === testTicketId);
  console.log("Agent 2 has ticket now?", agent2HasTicket, "(Expected: true)");
  if (!agent2HasTicket) {
    throw new Error("ERROR: Ticket does not appear in new Agent's assigned list!");
  }

  // Step 12: Verify audit trail logs (Requirement 9)
  console.log("\n12. Verifying audit trail activity log for assignments...");
  const actRes = await fetch(`${BASE_URL}/api/activities/${testTicketId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const actData = await actRes.json();
  console.log("Recorded activities count:", actData.count);
  console.log("Recorded actions:", actData.activities.map((a) => `${a.action}: ${a.details}`));
  const hasAssignLog = actData.activities.some((a) => a.action === "Ticket Assigned" || a.action === "Ticket Reassigned");
  if (!hasAssignLog) {
    throw new Error("ERROR: Activity log did not record ticket assignment!");
  }

  // Step 13: Clean up test ticket
  console.log("\n13. Cleaning up test ticket...");
  await fetch(`${BASE_URL}/api/tickets/${testTicketId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("Test ticket cleaned up.");

  console.log("\n====================================================");
  console.log("ALL TESTS PASSED! ASSIGNMENT FEATURE FULLY VERIFIED!");
  console.log("====================================================");

  process.exit(0);
}

runAssignmentTests().catch((err) => {
  console.error("\nTEST SUITE FAILED:", err);
  process.exit(1);
});
