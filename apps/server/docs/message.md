# 💬 Message API Documentation

A simple RESTful API for managing chat messages.

---

## 📜 Message Model

```typescript
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint                | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/message/:id`     | Get message by ID            |
| GET    | `/api/message`         | List messages (with filters) |
| POST   | `/api/message`         | Send a new message           |
| PATCH  | `/api/message/:id`     | Update message by ID         |
| DELETE | `/api/message/:id`     | Delete message by ID         |

---

## 📖 Get Message

**Endpoint:**  
`GET /api/message/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "id": "string",
  "senderId": "string",
  "receiverId": "string",
  "content": "string",
  "timestamp": "string",
  "read": true
}
```

---

## 📄 List Messages

**Endpoint:**  
`GET /api/message?senderId=string&receiverId=string&page=1&pageSize=20`

**Request Headers:**
```
Authorization: <token>
```

**Query Parameters (optional):**
- `senderId`: Filter by sender
- `receiverId`: Filter by receiver
- `chatRoomId`: Filter by chat room (if applicable)
- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 20)

**Success Response:**
```json
{
  "data": [
    {
      "id": "string",
      "senderId": "string",
      "receiverId": "string",
      "content": "string",
      "timestamp": "string",
      "read": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

---

## 📝 Send Message

**Endpoint:**  
`POST /api/message`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "receiverId": "string",
  "content": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "senderId": "string",
    "receiverId": "string",
    "content": "string",
    "timestamp": "string",
    "read": false
  }
}
```

---

## ✏️ Update Message

**Endpoint:**  
`PATCH /api/message/:id`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**  
_Update message content or read status_
```json
{
  "content": "string",
  "read": true
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "senderId": "string",
    "receiverId": "string",
    "content": "string",
    "timestamp": "string",
    "read": true
  }
}
```

---

## 🗑️ Delete Message

**Endpoint:**  
`DELETE /api/message/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "message": "Message deleted successfully"
}
```

---

> **Note:**  
> All endpoints expect and return JSON.  
> Authentication is required for all message endpoints.