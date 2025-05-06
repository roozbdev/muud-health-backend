---

````markdown
# MUUD Health Backend

This is the backend API service for the MUUD Health application, built as part of the MUUD Health Coding Challenge. It provides endpoints for journal entries, contact management, and user authentication.

---

## 🚀 Technologies Used

- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **PostgreSQL** – Database
- **JWT** – Authentication
- **Joi** – Request validation
- **Jest** – Testing framework
- **BCrypt** – Password hashing

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following tables:

### 🔐 Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
````

### 📓 Journal Entries Table

```sql
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  entry_text TEXT NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 5),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 📇 Contacts Table

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL
);
```

---

## 📡 API Endpoints

### 🔐 Authentication

* `POST /auth/register` – Create a new user account
* `POST /auth/login` – Authenticate user and receive JWT token
* `GET /auth/me` – Get current authenticated user information

### 📓 Journal Entries

* `POST /journal/entry` – Create a new journal entry
* `GET /journal/user/:id` – Get all journal entries for a user
* `GET /journal/entry/:id` – Get a specific journal entry
* `PUT /journal/entry/:id` – Update a journal entry
* `DELETE /journal/entry/:id` – Delete a journal entry

### 📇 Contacts

* `POST /contacts/add` – Add a new contact
* `GET /contacts/user/:id` – Get all contacts for a user
* `GET /contacts/:id` – Get a specific contact
* `PUT /contacts/:id` – Update a contact
* `DELETE /contacts/:id` – Delete a contact

---

## 🛠️ Setup Instructions

### ✅ Prerequisites

* Node.js (v14 or higher)
* PostgreSQL (v12 or higher)

### ⚙️ Configuration

1. Clone the repository:

   ```bash
   git clone https://github.com/roozbdev/muud-health-backend.git
   cd muud-health-backend
   ```

2. Create a `.env` file in the root directory with the following contents:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=muud_health
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=muud-health-jwt-secret-key
   JWT_EXPIRES_IN=24h
   ```

### 🧱 Database Setup

1. Create a PostgreSQL database named `muud_health` (https://muud-heath-backend.onrender.com/)
2. Run the initialization script:

   ```bash
   npm run init-db
   ```

   Or manually execute the SQL in:

   ```
   /src/config/init-db.sql
   ```

### 📦 Installation

1. Install project dependencies:

   ```bash
   npm install
   ```

2. Run database migrations: (optional)

   ```bash
   npm run migrate
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. For development with auto-reload:

   ```bash
   npm run dev
   ```

---

## ✅ Running Tests

```bash
npm test
```

---

## ✨ Additional Features

* **JWT Authentication** – Secures API routes
* **Input Validation** – Joi-based request validation
* **Centralized Error Handling** – Custom middleware for catching and formatting errors
* **Database Migrations** – Scripts to manage schema changes
* **CORS Enabled** – Allows cross-origin access for client apps

```
