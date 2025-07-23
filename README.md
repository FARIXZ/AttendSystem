# AttendSystem

A simple Node.js + Express + MongoDB attendance system.

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB instance (local or cloud)

## API Endpoints

### Users

- `POST /users/add`

  - Body: `{ "name": "John", "email": "john@example.com", "password": "yourpassword" }`
  - Creates a new user.

- `GET /users/all`

  - Returns all users.

- `GET /users/:id`
  - Returns a user by id.

### Attendance

- `POST /attend/add`

  - Body: `{ "id": "<user_id>" }`
  - Adds an attendance record for the user.

- `GET /attend/all`
  - Returns all users who have an attendance record for today.

## Notes

- All data is managed via API (no frontend).
- Make sure MongoDB is running and accessible.
- For development, use tools like Postman or curl to interact with the API.
