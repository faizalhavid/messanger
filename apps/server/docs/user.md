# 👤 User API Documentation

A simple RESTful API for user management.

---

<!-- User model interface -->
## 📜 User Model
```typescript
export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string; 
}
```

## 📋 Endpoints Overview

| Method | Endpoint                | Description          |
|--------|------------------------ |----------------------|
| POST   | `/api/user/register`    | Register a new user  |
| POST   | `/api/user/login`       | Login user           |
| POST   | `/api/user/update`      | Update user profile  |
| GET    | `/api/user/:id`         | Get user by ID       |
| POST   | `/api/user/logout`      | Logout user          |

---

## 📝 Register User

**Endpoint:**  
`POST /api/user/register`

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "username": "string",
    "name": "string"
  }
}
```

**Error Response:**
```json
{
  "errors": "Error message(s)"
}
```

---

## 🔑 Login User

**Endpoint:**  
`POST /api/user/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Succes Response**
```json
{
  "data": {
    "username": "string",
    "name": "string",
    "token": "string"
  }
}
```

---

## ✏️ Update User

**Endpoint:**  
`PATCH /api/user/update`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "username": "string",
  "name": "string"
}
```

**Succes Response**
```json
{
  "data": {
    "username": "string",
    "name": "string"
  }
}
```

---

## 🔍 Get User

**Endpoint:**  
`GET /api/user/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "id": "string",
  "username": "string",
  "name": "string"
}
```

---

## 🚪 Logout User

**Endpoint:**  
`DELETE /api/user/logout`

**Request Headers:**
```
Authorization: <token>
```
**Success Response:**
```json
{
  "message": "User logged out successfully"
}
```

---

> **Note:**  
> All endpoints expect and return JSON.  
> Authentication may be required for some endpoints.