# 📅 Booking & Reservation Management System

> **CSC3074 - Cloud Computing Final Assignment**
> A scalable, cloud-native web application for managing resource bookings, built with the MERN stack and deployed on AWS.

---

## 📖 Project Overview

This **Booking & Reservation System** is a comprehensive solution designed to streamline the process of scheduling and managing shared resources (e.g., meeting rooms, sports facilities, equipment). It provides a seamless experience for users to book resources and powerful tools for administrators to manage inventory, users, and reservations.

The system is architected to be **cloud-native**, leveraging Amazon Web Services (AWS) for high availability, scalability, and security.

### 🌟 Key Objectives
- **Efficiency**: Automate the booking process and prevent double-booking.
- **Scalability**: Handle growing user bases and data loads using AWS RDS and S3.
- **Security**: Implement robust authentication (JWT), role-based access control (RBAC), and secure data storage.
- **Reliability**: ensuring uptime with PM2 process management and automated backups.

---

## 🚀 Features

### 👤 User Features (Public/Private)
1.  **Authentication & Security**
    -   Secure Registration & Login with JWT.
    -   **Email Verification & OTP**: Two-factor authentication flow using **Mailgun SMTP** (due to AWS Learner Lab sandbox restrictions).
    -   **Password Reset**: Secure implementation for lost passwords.
    -   **Profile Management**: Update personal details, change password, and **upload profile pictures** (stored on S3).

2.  **Dashboard & Navigation**
    -   **Global Search (⌘K)**: Quick navigation to any feature or resource.
    -   **Interactive Dashboard**: View upcoming bookings and quick actions.

3.  **Booking Workflow**
    -   **Visual Calendar**: Monthly/Weekly/Daily views of bookings.
    -   **Smart Booking Form**:
        -   Step-by-step wizard.
        -   **Availability Check**: Real-time conflict detection.
        -   **Add Attendees**: Invite other users to the booking.
        -   **Email Notifications**: Auto-send invites using Mailgun.
    -   **My Bookings**:
        -   Filter by Upcoming / Past / Cancelled.
        -   **Reschedule**: Drag-and-drop or form-based editing.
        -   **RSVP**: Accept/Decline invitations from others.
        -   **Export to Calendar**: Download `.ics` files for Outlook/Google Calendar.
    -   **Resources Page**: Browse facilities with images, descriptions, and capacity details.

### 🛠 Admin Features (Protected)
1.  **Admin Dashboard**
    -   **Real-time Analytics**: Visual charts for Booking Trends and Resource Utilization.
    -   Quick stats (Total Users, Active Bookings, etc.).

2.  **Resource Management**
    -   **CRUD Operations**: Create, Read, Update, Delete resources.
    -   **Image Uploads**: Drag-and-drop upload for resource images (saved to AWS S3).
    -   **Categorization**: Manage resource types (e.g., "Sports", "Rooms").

3.  **User Management**
    -   View all registered users and their roles (Admin/User).
    -   **Role Management**: Promote/Demote users.
    -   **Account Status**: Activate/Deactivate access.
    -   **Add User**: Manually register users from the admin panel.

---

## 🏗 Technical Architecture

### Tech Stack (MERN)
-   **Frontend**: React.js 18, Vite, TailwindCSS, Shadcn UI (Component Library).
-   **Backend**: Node.js, Express.js.
-   **Database**: MySQL (Relational Data Model).
-   **ORM/Driver**: `mysql2` with connection pooling.

### ☁️ AWS Cloud Infrastructure
The system is fully deployed on the AWS Cloud ecosystem:

| Service | Usage & Configuration |
| :--- | :--- |
| **Amazon EC2** | **Compute**: Hosts the Node.js Backend and React Frontend (served via Nginx).<br>- OS: Ubuntu 22.04 LTS.<br>- **PM2**: Used for process management and zero-downtime reloads.<br>- **Nginx**: Reverse proxy to route traffic between port 80 and localhost:5000. |
| **Amazon RDS** | **Database**: Managed MySQL instance.<br>- Ensures high availability and automated backups.<br>- **Security Group**: Inbound rules restricted to the EC2 instance only (Port 3306). |
| **Amazon S3** | **Storage**: Object storage for images (Profile Pictures & Resource Photos).<br>- **Middleware**: `multer-s3` handles direct uploads.<br>- **Credentials**: Used `AWS_SESSION_TOKEN` (Temporary Credentials) as mandated by the Learner Lab environment.<br>- **Fallback**: Implemented a "Local Fallback" mechanism to save files to disk if S3 connectivity is interrupted. |
| **Mailgun (SMTP)** | **Email Service**: Replaced Amazon SES for this assignment.<br>- **Reason**: AWS Learner Lab Sandbox does not permit SES usage/identity verification.<br>- **Implementation**: Used `nodemailer` with Mailgun Sandbox SMTP for reliable delivery of OTPs and booking invites. |
| **IAM** | **Security**: Utilized the pre-defined **`LabRole`**.<br>- **Constraint**: Custom IAM user creation is restricted in the Learner Lab, so the system operates under the provided temporary role credentials. |

### 🔒 Security Implementation
1.  **Data Transmission**: All API requests routed via proper HTTP methods.
2.  **Passwords**: Hashed securely using `bcrypt` before storage.
3.  **Environment Variables**: All sensitive keys (DB Credentials, AWS Keys, JWT Secret) are stored in `.env` files and **never** committed to version control.
4.  **Network Security**: AWS Security Groups configured to allow only necessary traffic (HTTP/HTTPS/SSH).

---

## 💻 Installation & Setup (Local)

### Prerequisites
-   Node.js (v18+)
-   MySQL Server
-   AWS Learner Lab Account (for S3/EC2/RDS)
-   Mailgun Account (for Email SMTP)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/booking-system.git
cd booking-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=booking_system
JWT_SECRET=your_secret_key
# AWS Credentials (Temporary from Learner Lab)
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=IQoJ...
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket
# Mailgun SMTP
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@sandbox...
SMTP_PASS=your_mailgun_password
```
Run Database Migration:
```bash
# Import database/schema.sql into your MySQL instance
mysql -u root -p < ../database/schema.sql
```
Start Server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start Client:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

---

## 📈 Future Enhancements
-   **Payment Integration**: Stripe/PayPal for paid bookings.
-   **Waitlist System**: Auto-notify users when a slot frees up.
-   **Mobile App**: React Native adaptation for iOS/Android.

---
*Built by Yong Chun for CSC3074.*
