# 🚚 TrackShip — Premium Courier Management & Live Tracking System

TrackShip is a full-stack, enterprise-grade courier booking, live route tracking, and distribution management system. Powered by a modern, high-performance stack (**Vite + React, Tailwind CSS v4, Node.js + Express, Socket.io, Leaflet, and MongoDB**), TrackShip provides users, agents, and administrators with an interactive, responsive, and visually stunning dashboard experience.

---

## 🌟 Key Features

### 👤 Customer Experience
*   **Dynamic Courier Booking:** Book shipments by entering source/destination addresses, parcel weight, category (e.g., Documents, Electronics, Apparel), and shipping priority (Express vs Standard).
*   **Secure Payment Integration:** Integrated with Razorpay SDK (and UPI mock backup) for frictionless checkouts and secure transaction validation.
*   **In-App QR Labels:** Automatic QR code generation for every successfully booked package. Customers can print or download shipping labels containing their unique tracking QR code.
*   **Interactive Live Map Tracking:** A premium tracking console displaying real-time delivery progress. It integrates with Leaflet maps to showcase the delivery agent's live coordinates.
*   **Order History & Receipts:** Interactive list of bookings showing delivery timelines, current status badges, and transaction invoices.

### 🚴 Delivery Agent Portal
*   **Interactive Delivery Queue:** Real-time dashboard showing assigned packages, customer contact info, and delivery routes.
*   **In-App QR Code Scanner:** Utilizes `html5-qrcode` to allow camera-based scanning of shipment labels directly in the browser to instantly progress shipping statuses (e.g., *Dispatched*, *In-Transit*, *Out for Delivery*, *Delivered*).
*   **Real-time GPS Simulator:** Broadcasts live latitude and longitude coordinates to the Socket.io server to display agent movement on the customer's map.
*   **Navigation & Map Routing:** Renders route paths on Leaflet to guide the agent to their destination.

### 👑 Administrator Console
*   **Analytics & Business Intelligence:** Displays high-impact metrics (total revenue, active shipments, delivery success rates, and customer growth charts) using `recharts`.
*   **Smart Shipment Assignment:** Interface to search and assign unallocated packages to nearby delivery agents.
*   **User & Agent Management:** Create, delete, and inspect all platform users, agents, and admins.
*   **Live Activities Monitor:** Real-time logger of system events, payments, and agent assignments.

### 🛡️ System Architecture & Security
*   **Hybrid Authentication:** Supports traditional credentials (email/password with `bcryptjs` hashing) and Google OAuth 2.0 via `passport`.
*   **Socket.io Real-Time Synchronization:** Keeps all connected clients updated with immediate notifications and coordinate broadcasts without page reloads.
*   **Nodemailer Email Alerts:** Sends automatic transactional email updates (e.g., booking receipts and delivery success notifications).
*   **Robust Security Middleware:** Hardened with `helmet` for security headers and `express-rate-limit` to prevent brute-force attacks.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client (Vite + React 19 + Leaflet)
        C[Customer UI]
        AG[Agent UI]
        AD[Admin UI]
    end
    subgraph Server (Node.js + Express + Socket.io)
        API[Express REST API]
        SIO[Socket.io Hub]
    end
    subgraph Services
        DB[(MongoDB Database)]
        RP[Razorpay Gateway]
        CLD[Cloudinary Uploads]
        EM[Nodemailer SMTP]
    end

    C -->|1. Book Courier & Pay| API
    API -->|Process Payment| RP
    API -->|Save Booking| DB
    API -->|Send Confirmation Email| EM
    AD -->|2. Assign Agent| API
    AG -->|3. Scan QR Code & Start Trip| API
    AG -->|4. Broadcast GPS Coordinates| SIO
    SIO -->|5. Real-Time Map Location| C
```

---

## 💻 Tech Stack

### Frontend
*   **Framework:** React 19 (Vite-powered)
*   **Styling:** Tailwind CSS v4 & custom modern components (Glassmorphism, animations)
*   **Routing:** React Router Dom v7
*   **State & API Fetching:** Axios, React Context API
*   **Real-Time Data:** Socket.io-client
*   **Maps & QR Scanning:** Leaflet, html5-qrcode
*   **Data Visualization:** Recharts, Lucide Icons

### Backend
*   **Runtime:** Node.js, Express.js
*   **Database:** MongoDB via Mongoose
*   **Authentication:** JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0)
*   **Real-time Services:** Socket.io
*   **Security:** Helmet, CORS, Express Rate Limit, BcryptJS
*   **Uploads & Assets:** Multer, Cloudinary SDK
*   **Testing:** Jest, Supertest

---

## 🚀 Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas URI)

### Repository Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trackship.git
   cd trackship
   ```

### 1. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory (reference the template below) and supply your API credentials:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/trackship
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password

   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   CLIENT_URL=http://localhost:5173
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   MERCHANT_UPI_VPA=your_vpa@upi
   ```
4. Start the server:
   *   **Development mode (auto-reload):** `npm run dev`
   *   **Production mode:** `npm start`
   *   **Run Backend Tests:** `npm test`

---

### 2. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Project Structure

```text
trackship/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Shared layouts, cards, protection wrappers
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, Assignments
│   │   │   ├── agent/          # Agent Dashboard, Live Delivery Tracker
│   │   │   ├── customer/       # Customer Bookings, MyBookings, Profile
│   │   │   └── LandingPage.jsx # Hero Landing Page
│   │   └── services/           # Axios HTTP endpoints (Auth, Booking, Payments)
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node/Express Backend
│   ├── config/                 # Database Connection, Passport OAuth rules
│   ├── controllers/            # Request handlers (Auth, Booking, Admin, Payments)
│   ├── middleware/             # Role verification, Auth checks, Error handling
│   ├── models/                 # Mongoose schemas (User, Booking, Notification)
│   ├── routes/                 # Express API endpoints
│   ├── socket/                 # Socket.io events & live agent tracker logic
│   ├── tests/                  # Backend unit/integration tests (Jest & Supertest)
│   ├── server.js               # Application Entrypoint
│   └── package.json
│
└── README.md                   # System documentation
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
