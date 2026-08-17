# Store Rating Platform
A full-stack web application that allows users to discover and rate stores. The platform supports three distinct roles: Normal Users, Store Owners, and Administrators.



## Video Walkthrough
Watch a full walkthrough of the project here: [Loom Video](https://www.loom.com/share/78be178540a64982ae4df9e231d9e9c5)


## Features

*   **Role-Based Access Control:**
    *   **Admin:** Complete control over the platform. Can manage users, create stores, and assign store owners.
    *   **Store Owner:** Can view their own store's dashboard, see their average ratings, and view a detailed list of users who have rated their store.
    *   **Normal User:** Can browse stores, view ratings, and submit their own ratings for stores.
*   **Dynamic Theming:** Features a built-in Dark/Light mode toggle with a premium, accessible color palette.
*   **Modern UI/UX:** Built with React and stylized using modern CSS patterns, avoiding inline AI-generated comments.
*   **Robust Backend:** Powered by Node.js, Express, and MySQL.

## Tech Stack

*   **Frontend:** React, Vite, React Router, Lucide React (for icons).
*   **Backend:** Node.js, Express, MySQL, bcrypt (for password hashing), jsonwebtoken (for authentication).
*   **Database:** MySQL

##  Installation & Setup

### Prerequisites

*   Node.js (v16 or higher recommended)
*   MySQL Server installed and running

### 1. Database Setup

1. Open your MySQL server and ensure it is running.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Run the database setup script, passing your MySQL root password as an argument (replace `YOUR_PASSWORD` with your actual password):
   ```bash
   node setup_db.js YOUR_PASSWORD
   ```
   *This script will create the `store_rating_platform` database, set up the required tables, and seed the initial Admin user.*

### 2. Backend Setup

1. Inside the `backend` folder, install the dependencies:
   ```bash
   npm install
   ```
2. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend runs on `http://localhost:5000` by default.*

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:5173` by default.*

## Default Credentials

After successfully running the `setup_db.js` script, the following default Administrator account is created:

*   **Email:** `admin@example.com`
*   **Password:** `Admin@1234`

Use these credentials to log in and begin setting up additional users and stores.
