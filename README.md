# Cloud-Native Booking & Reservation System
(CSC3074 Final Assignment)

A complete booking/reservation system built using Node.js (Express), MySQL, and Vanilla JavaScript/Bootstrap. Designed for deployment on AWS.

## Features
- **User Authentication**: Register, Login, JWT-based auth.
- **Resource Management**: Admin can create/update resources (Rooms, Equipment).
- **Booking System**: Users can book resources, view availability on a calendar, and manage their bookings.
- **File Uploads**: Integration with AWS S3 for uploading attachments to bookings.
- **Admin Dashboard**: Overview of all resources and bookings.

## Tech Stack
- **Frontend**: HTML5, Bootstrap 5, Vanilla JS, FullCalendar.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL (compatible with AWS RDS)
- **Cloud Services**: AWS EC2 (Hosting), AWS S3 (Storage), AWS RDS (Database)

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL Database running (Local or Cloud)
- AWS Account (for S3 and eventually EC2/RDS deployment)

### 1. Database Setup
Run the `database/schema.sql` script in your MySQL interface to create the tables.

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` (in the root or backend folder, update paths accordingly)
   - Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
The frontend is composed of static files.
- Open `frontend/index.html` in your browser.
- Ensure the API URL in `frontend/js/api.js` points to your backend (default: `http://localhost:5000/api`).

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Resources
- `GET /api/resources`
- `POST /api/resources` (Admin)

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `DELETE /api/bookings/:id`
- `POST /api/bookings/:id/upload`

## Deployment Checklist
1. Create RDS MySQL instance.
2. Create S3 Bucket.
3. Launch EC2 instance (Ubuntu/Amazon Linux).
4. Clone repo to EC2.
5. Install Node.js & NPM on EC2.
6. Set PM2 for process management.
7. Configure Nginx as reverse proxy.
