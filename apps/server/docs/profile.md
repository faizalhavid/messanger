# 🧑‍💼 Profile API Documentation

A simple RESTful API for user profile management.

---

## 📜 Profile Model

```typescript
export interface Profile {
  id: string;
  user: User;
  bio?: Biodata;
  avatarUrl?: string;
  location?: string;
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint                  | Description                |
|--------|--------------------------|----------------------------|
| GET    | `/api/profile/:name`       | Get profile by name        |
| GET    | `/api/profile`           | Search user profiles       |
| POST   | `/api/profile`           | Create a new profile       |
| PATCH  | `/api/profile/:id`       | Update profile by ID       |
| DELETE | `/api/profile/:id`       | Delete profile by ID       |

---

## 📖 Get Profile

**Endpoint:**  
`GET /api/profile/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "id": "string",
  "userId": "string",
  "bio": "string",
  "avatarUrl": "string",
  "location": "string"
}
```

---

## 🔍 Search User Profiles

**Endpoint:**  
`GET /api/profile?bio=string&location=string`
**Query Parameters:**
- `bio`: Filter by bio content
- `location`: Filter by location


**Request Headers:**
```
Authorization: <token>
```

**Query Parameters (optional):**
- `bio`: Filter by bio content
- `location`: Filter by location

**Success Response:**
```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "bio": "string",
      "avatarUrl": "string",
      "location": "string"
    }
  ]
}
```

---

## 📝 Create Profile

**Endpoint:**  
`POST /api/profile`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "bio": "string",
  "avatarUrl": "string",
  "location": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "userId": "string",
    "bio": "string",
    "avatarUrl": "string",
    "location": "string"
  }
}
```

---

## ✏️ Update Profile

**Endpoint:**  
`PATCH /api/profile/:id`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "bio": "string",
  "avatarUrl": "string",
  "location": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "userId": "string",
    "bio": "string",
    "avatarUrl": "string",
    "location": "string"
  }
}
```

---

## 🗑️ Delete Profile

**Endpoint:**  
`DELETE /api/profile/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "message": "Profile deleted successfully"
}
```

---

> **Note:**  
> All endpoints expect and return JSON.  
> Authentication is required for all profile endpoints.