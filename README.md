# Employee-Attendance-System


A full-stack web application for managing employee attendance.

## About The Project

This project is an Employee Attendance System. It consists of a React frontend and a Node.js (Express) backend.

### Built With

*   [React](https://reactjs.org/)
*   [Node.js](https://nodejs.org/)
*   [Express](https://expressjs.com/)
*   [PostgreSQL](https://www.postgresql.org/)
*   [Sequelize](https://sequelize.org/)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.
*   npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username_/your_project_name.git
    ```
2.  **Install backend dependencies**
    Navigate to the `EAS/server` directory and run:
    ```sh
    npm install
    ```
3.  **Install frontend dependencies**
    Navigate to the `EAS/client` directory and run:
    ```sh
    npm install
    ```

## Usage

1.  **Run the backend server**
    Navigate to the `EAS/server` directory and run:
    ```sh
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Run the frontend client**
    Navigate to the `EAS/client` directory and run:
    ```sh
    npm run dev
    ```
    The client will start on `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the `EAS/server` directory and add the following variables:

```
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eas
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Screenshots

 
## Manager Features
<p align="center">
  <-- Manager Dashboard
</p>
<p align="center">
  <img src="images/Manager%20Dashboard.png" alt="Manager Dashboard" width="800"/>
</p>

<p align="center">
  <img src="images/All%20Employee%20Attendance.png" alt="All Employee Attendance" width="800"/>
</p>

<p align="center">
  <img src="images/Reports.png" alt="Reports" width="800"/>
</p>

## Employee Features

<p align="center">
  <-- Employee Dashboard
</p>
<p align="center">
  <img src="images/Employee%20Dashboard.png" alt="Employee Dashboard" width="800"/>
</p>

<p align="center">
  <img src="images/Mark%20Attendance.png" alt="Mark Attendance" width="800"/>
</p>

<p align="center">
  <img src="images/History.png" alt="History" width="800"/>
</p>


## Database
<p align="center">
  <img src="images/Database.png" alt="Database" width="800"/>
</p>
