# AWS Deployment Guide

This guide covers the step-by-step configuration required to deploy the Booking System on AWS, meeting all the mandatory technical requirements (EC2, S3, RDS, ALB, ASG).

## Prerequisite: AWS Account
Ensure you have an active AWS account and verify the region you want to deploy in (e.g., `us-east-1` or `ap-southeast-1`).

---

## Step 1: Network & Security (Security Groups)

Before creating instances, let's define the firewall rules.

1.  Go to **EC2 Dashboard** -> **Security Groups** -> **Create security group**.
2.  **Web Server SG** (for EC2):
    -   Name: `BRS-SG-WEB`
    -   Inbound Rules:
        -   Type: HTTP (80), Source: Anywhere (0.0.0.0/0)
        -   Type: SSH (22), Source: My IP (for security)
3.  **Database SG** (for RDS):
    -   Name: `BRS-SG-DB`
    -   Inbound Rules:
        -   Type: MySQL/Aurora (3306), Source: Custom -> Select `BRS-SG-WEB` (This ensures only your web servers can access the DB).
4.  **ALB SG** (for Load Balancer):
    -   Name: `BRS-SG-ALB`
    -   Inbound Rules:
        -   Type: HTTP (80), Source: Anywhere (0.0.0.0/0)
        -   (Optional) HTTPS (443) if you have a domain/cert.

---

## Step 2: IAM Role (For EC2 to access S3)

To allow the application to upload files to S3 without hardcoding keys on the server.

> [!IMPORTANT]
> **AWS Academy Learner Lab Users**: You likely cannot create new IAM roles with full access. Instead, you **must use the existing `LabRole`** which is pre-created for you and has the necessary permissions. Skip the creation steps below and just select `LabRole` when launching your EC2 instance.

1.  **If you are NOT using Learner Lab**:
    -   Go to **IAM Dashboard** -> **Roles** -> **Create role**.
    -   Select **AWS service** -> **EC2**.
    -   Add Permissions: Search for `AmazonS3FullAccess`.
    -   Role Name: `BookingAppRole`.
    -   Create Role.
2.  **If you ARE using Learner Lab**:
    -   Skip this step. You will use the existing `LabRole` in Step 5.

---

## Step 3: Cloud Storage (S3)

1.  Go to **S3 Dashboard** -> **Create bucket**.
2.  Bucket Name: `booking-system-uploads-[unique-id]` (e.g., `booking-system-uploads-yongchun`).
3.  Region: Same as your other services.
4.  **Block Public Access**: *Uncheck* "Block all public access" (Only if you want easy public download links for this demo. Ideally, keep it blocked and interpret via backend, but for this project's simple "attachment_url" direct link logic, public read is easier).
    -   *Better Security:* Keep public access blocked, but allow the specific IAM role access. However, serving private S3 files requires signed URLs. For this assignment, **Unblocking Public Access** might be easiest, or configuring a Bucket Policy for public Read.
    -   *Bucket Policy for Public Read (if unblocked):*
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
                }
            ]
        }
        ```
5.  Create Bucket.

---

## Step 4: Cloud Database (RDS MySQL)

1.  Go to **RDS Dashboard** -> **Create database**.
2.  Choose **Standard create** -> **MySQL**.
3.  Template: **Free tier** (or Dev/Test).
4.  **Settings**:
    -   DB instance identifier: `booking-db`
    -   Master username: `admin`
    -   Master password: `your_password_here` (Remember this!)
5.  **Instance configuration**: `db.t3.micro` (Free tier eligible).
6.  **Storage**: 20 GiB (default).
7.  **Connectivity**:
    -   VPC: Default
    -   Public access: **No** (Security best practice).
    -   VPC Security Group: Select `BRS-SG-DB` created in Step 1.
8.  **Additional configuration**:
    -   Initial database name: `booking_system`
9.  Create Database. (It will take a few minutes).
10. Note the **Endpoint** (e.g., `booking-db.abc12345.us-east-1.rds.amazonaws.com`) once available.

---

## Step 5: Application Deployment (EC2 Setup)

We will configure one instance first, then use it to create an Image (AMI) for Auto Scaling.

1.  **Launch Instance**:
    -   Name: `Booking-App-Base`
    -   OS: **Ubuntu Server 22.04 LTS** (Free tier).
    -   Instance Type: `t2.micro` or `t3.micro`.
    -   Key Pair: Create new (e.g., `booking-key`) and download `.pem`.
    -   Network: Select `BRS-SG-WEB`.
    -   **Advanced details** -> **IAM instance profile**: Select `BookingAppRole` (or `LabRole` for Academy users).
2.  **Connect via SSH**:
    ```bash
    chmod 400 booking-key.pem
    ssh -i booking-key.pem ubuntu@<EC2-PUBLIC-IP>
    ```
3.  **Install Dependencies & Code**:
    ```bash
    # Update & Install Node.js
    sudo apt update
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs git build-essential nginx

    # Clone your code (Push your local code to GitHub first, or SCP it)
    git clone https://github.com/YOUR_USERNAME/booking-system.git
    cd booking-system/backend

    # Install Backend Deps
    npm install
    
    # Configure Env
    cp ../.env.example .env
    nano .env
    # EDIT: DB_HOST (RDS Endpoint), DB_USER, DB_PASS, S3 details.
    # IMPORTANT: AWS Keys in .env are NOT needed if using IAM Role, 
    # but the code needs to support "empty" keys to fallback to Role. 
    # (The aws-sdk automatically does this if env vars are missing).
    ```
4.  **Start Application (PM2)**:
    ```bash
    sudo npm install -g pm2
    pm2 start server.js --name "booking-api"
    pm2 startup
    # Run the command generated by pm2 startup ...
    pm2 save
    ```
5.  **Configure Nginx (Reverse Proxy)**:
    To serve Frontend and proxy API.
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
    Replace `location /` content:
    ```nginx
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /home/ubuntu/booking-system/frontend;
        index index.html index.htm index.nginx-debian.html;
        server_name _;

        location / {
            try_files $uri $uri/ =404;
        }

        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Restart Nginx: `sudo systemctl restart nginx`

---

## Step 6: Load Balancer & Auto Scaling (Scalability)

Now that we have a working instance, let's scale it.

1.  **Create AMI (Image)**:
    -   Select your running instance `Booking-App-Base`.
    -   Actions -> Image and templates -> **Create image**.
    -   Name: `booking-app-v1`.
2.  **Create Target Group**:
    -   Go to **Load Balancing** -> **Target Groups**.
    -   Type: **Instances**.
    -   Name: `booking-tg`.
    -   Protocol: HTTP 80.
    -   Health check path: `/` (or `/api/` if checking backend).
3.  **Create Application Load Balancer (ALB)**:
    -   Go to **Load Balancers** -> **Create Load Balancer** -> **Application Load Balancer**.
    -   Name: `booking-alb`.
    -   Scheme: Internet-facing.
    -   Network: Select all available Zones that match your EC2 subnet.
    -   Security Group: `BRS-SG-ALB`.
    -   **Listeners**: HTTP 80 -> Forward to `booking-tg`.
4.  **Create Launch Template**:
    -   Go to **EC2** -> **Launch Templates**.
    -   Name: `booking-launch-template`.
    -   AMI: Select `booking-app-v1` (My AMIs).
    -   Instance type: `t2.micro`.
    -   Security Group: `BRS-SG-WEB`.
    -   IAM Role: `BookingAppRole` (or `LabRole` for Academy users).
    -   User Data (Advanced):
        ```bash
        #!/bin/bash
        # Ensure services start if not already
        systemctl start nginx
        su - ubuntu -c "pm2 resurrect"
        ```
5.  **Create Auto Scaling Group (ASG)**:
    -   Go to **Auto Scaling Groups**.
    -   Name: `booking-asg`.
    -   Launch Template: `booking-launch-template`.
    -   Network: Select all Zones.
    -   Load Balancing: Attach to an existing load balancer -> Choose `booking-tg`.
    -   **Group Size**:
        -   Desired: 2
        -   Min: 2
        -   Max: 4
    -   **Scaling Policies**: Target Tracking -> Average CPU Utilization -> 70 (or 50 for testing).

---

## Final Verification (How to Test)

Follow these steps to prove the system works:

### 1. Wait for Auto Scaling
- Go to **EC2 Dashboard** -> **Auto Scaling Groups**.
- Click `booking-asg` and check the **Instance Management** tab.
- You should see 2 instances with status `Inservice`.

### 2. Find your Website URL
- Go to **EC2 Dashboard** -> **Load Balancers**.
- Click `booking-alb`.
- Look for the **DNS Name** in the details (e.g., `booking-alb-123456.us-east-1.elb.amazonaws.com`).
- Copy this URL.

### 3. Open in Browser
- Paste the URL into your browser.
- You should see the "Welcome to Booking System" landing page.

### 4. Test User & Database (RDS)
- Click **Register**.
- Create a user (e.g., `test@example.com`).
- If successful, you will be redirected to Login.
- Login with the new account.
- **Success**: If this works, your **RDS** connection is good.

### 5. Test File Upload (S3 & IAM)
- Once logged in, go to the "My Bookings" tab (You need to book a room first).
- Go to "Resources", click "Book Now" on any item, and confirm.
- Go to "My Bookings".
- Click **Upload File**.
- Select a small image or PDF.
- If you see "File uploaded!", check your S3 bucket in the Console.
- **Success**: If the file appears in S3, your **IAM Role** is working correctly.

---

## Step 6: Deploying the Modern Frontend (The Full Guide)

Since we modernized the app, the deployment process has changed slightly. We recommend a **Hybrid Approach**:
1.  **Source Code (Backend/DB)**: Use **Git** (Push locally -> Pull on EC2).
2.  **Frontend Build**: Use **SCP** (Build locally -> Upload to EC2). *Why? Building on a small EC2 instance often crashes it.*

### 1. Local Preparation (On Your Mac)
First, save all your changes to GitHub.
```bash
# 1. Commit and Push your changes
git add .
git commit -m "feat: modernize frontend and backend"
git push origin main
```

### 2. Database Upgrade
We need to apply the new schema changes.
```bash
# 1. Upload the schema file to EC2
scp -i path/to/key.pem database/schema_v2.sql ubuntu@<EC2-IP>:~/Booking_Reservation_System/database/

# 2. Connect to EC2
ssh -i path/to/key.pem ubuntu@<EC2-IP>

# 3. Run the schema script (Run this ON EC2)
# Replace <RDS-ENDPOINT> with your actual DB endpoint
mysql -h <RDS-ENDPOINT> -u admin -p booking_system < ~/Booking_Reservation_System/database/schema_v2.sql
```

### 3. Backend Update (On EC2)
Get the new backend code onto the server.
```bash
# (Still on EC2)
cd ~/Booking_Reservation_System
git pull origin main

# Update Backend Dependencies
cd backend
npm install
pm2 restart booking-api
```

### 4. Frontend Build & Deploy (Back on Your Mac)
We will build the optimal production version of React on your powerful computer, then send it to the server.

```bash
# 1. Build the project locally
cd frontend
npm install
npm run build
# This creates a 'dist' folder with optimized HTML/CSS/JS

# 2. Upload the 'dist' folder to EC2
# We name it 'frontend-dist' on the server
scp -i path/to/key.pem -r dist ubuntu@<EC2-IP>:~/Booking_Reservation_System/frontend-dist
```

### 5. Update Nginx Config (On EC2)
Point Nginx to the new React files.

```bash
# 1. Connect to EC2
ssh -i path/to/key.pem ubuntu@<EC2-IP>

# 2. Edit Nginx Config
sudo nano /etc/nginx/sites-available/default
```

**Find** the line `root ...;` and **change** it to:
```nginx
root /home/ubuntu/Booking_Reservation_System/frontend-dist;
```

**Find** the `location /` block and ensure it looks like this (to fix React Router 404s):
```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
```

**Save and Exit**: `Ctrl+O`, `Enter`, `Ctrl+X`.

**Restart Nginx**:
```bash
sudo systemctl restart nginx
```

### 6. Verify Deployment
1. Go to your Load Balancer URL.
2. You should see the new **Modern Interface**.
3. Log in and verify that charts and resource lists are loading.


---

## Step 7: Configuring Email (Mailgun SMTP)

Due to AWS Sandbox restrictions, we are using **Mailgun SMTP** for reliable email delivery.

### Configuration
The system is already configured to use your Mailgun Sandbox credentials.

1.  **Authorized Recipients**: Since this is a Sandbox domain, you must go to your [Mailgun Dashboard](https://app.mailgun.com/) -> **Sending** -> **Domains** -> (Select Domain) -> **Authorized Recipients**.
2.  **Add Emails**: Manually add the email addresses of anyone you want to test with (e.g., yourself, your lecturer).
3.  **Sending**: The system will send emails via `postmaster@sandbox...`.

### Fallback (Console Mode)
If you try to send an email to an **Unauthorized Recipient**, Mailgun will block it.
**Don't Worry!** The system will automatically catch this error and **print the OTP code to the server console**.

To see the code, run:
```bash
ssh -i booking-key.pem ubuntu@<EC2-IP> "pm2 logs booking-api --lines 50 --nostream"
```
Look for `MOCK EMAIL TO:` and `OTP CODE:` in the logs.
