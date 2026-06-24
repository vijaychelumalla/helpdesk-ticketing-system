# Helpdesk / Ticketing System API

A comprehensive backend API for a Helpdesk and Ticketing System built using **Node.js**, **Express**, and **MongoDB (Mongoose)**. It includes complete user authentication, role-based authorization, ticket management workflows, comments, file attachments, activities logging, dashboard statistics, and interactive Swagger documentation.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**:
  - Secure registration, login, profile retrieval, and forgot/reset password via tokens (using Nodemailer).
  - Role-based Access Control (RBAC) with support for `customer`, `agent`, and `admin` roles.
- 🎫 **Ticket Management**:
  - Customer-specific ticket creation.
  - View all tickets (scoped to role privileges: customers see their own, agents/admins see all).
  - Update ticket status (`open`, `in-progress`, `resolved`, `closed`).
  - Assign tickets to agents/admins.
  - Delete tickets (admin only).
- 💬 **Commenting System**:
  - Add comments to tickets to enable customer-agent communication.
  - Fetch comments history per ticket.
- 📁 **File Uploads & Attachments**:
  - Upload standalone files or attach them directly to support tickets (using Multer).
- 📊 **Dashboard Stats**:
  - High-level metrics showing ticket counts by status, priority, and assignments.
- 📋 **Activity Logs**:
  - Chronological history tracking ticket updates, assignments, status changes, and comments.
- 📖 **API Documentation**:
  - Interactive API documentation powered by Swagger.

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js (ES Modules import/export)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **File Uploads**: Multer
- **API Documentation**: Swagger (swagger-jsdoc & swagger-ui-express)
- **Development Tooling**: Nodemon

---

## 📂 Directory Structure

```text
helpdesk/
├── config/             # Database connection & Swagger configuration
├── controllers/        # Express route handlers containing business logic
├── middleware/         # Custom authentication, RBAC, and file upload middlewares
├── models/             # Mongoose schemas (User, Ticket, Comment, Activity, etc.)
├── routes/             # REST API endpoint definitions
├── uploads/            # Local storage folder for uploaded files (git-ignored)
├── utils/              # Helper utilities (email notifications, etc.)
├── .env                # Local environment variables (git-ignored)
├── .gitignore          # Git exclusion specifications
├── package.json        # Dependencies and startup scripts
└── server.js           # Express application entrypoint
```

---

## ⚙️ Installation & Setup

Follow these steps to set up and run the application locally:

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd helpdesk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory and define the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_jwt_secret_key_here

# Nodemailer SMTP Configuration (for password reset emails)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 4. Running the Application

#### Development Mode (with hot-reloading)
```bash
npm run dev
```

#### Production Mode
```bash
node server.js
```

Once started, the backend server will run at: `http://localhost:5000`

---

## 📖 API Documentation (Swagger)

An interactive UI to test all APIs is available at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create a new user account.
* `POST /api/auth/login` - Authenticate user and receive a JWT.
* `GET /api/auth/me` - Retrieve logged-in user profile *(requires authentication)*.
* `POST /api/auth/forgot-password` - Request a password reset link.
* `POST /api/auth/reset-password/:token` - Reset password using reset token.
* `GET /api/auth/admin-test` - Endpoint restricted to Admin role.

### Tickets (`/api/tickets`)
* `POST /api/tickets` - Create a support ticket *(restricted to customers)*.
* `GET /api/tickets` - Retrieve tickets list *(scoped to user role)*.
* `GET /api/tickets/:id` - Fetch single ticket detail.
* `PATCH /api/tickets/:id/assign` - Assign ticket to an agent *(restricted to agent/admin)*.
* `PATCH /api/tickets/:id/status` - Update ticket resolution status *(restricted to agent/admin)*.
* `DELETE /api/tickets/:id` - Delete a ticket *(restricted to admin)*.

### Comments (`/api/comments`)
* `POST /api/comments` - Post a comment to a ticket.
* `GET /api/comments/:ticketId` - Retrieve all comments on a ticket.

### Files & Attachments (`/api/files`)
* `POST /api/files/upload` - Upload file to local storage.
* `POST /api/files/attach` - Upload and link file as attachment to a ticket.

### Dashboard (`/api/dashboard`)
* `GET /api/dashboard/stats` - Fetch overall stats on tickets.

### Ticket Activities (`/api/activities`)
* `GET /api/activities/:ticketId` - Retrieve audit log of actions performed on a ticket.

---

## 🔒 License

This project is licensed under the ISC License.
