# 🏠 Chat Room API Documentation

A simple RESTful API for managing chat rooms.

---

## 📜 Chat Room Model

```typescript
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[]; 
  messages?: Message[];
  createdAt: string;
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/chatroom/:id`               | Get chat room by ID                |
| GET    | `/api/chatroom`                   | List chat rooms                    |
| POST   | `/api/chatroom`                   | Create a new chat room             |
| PATCH  | `/api/chatroom/:id`               | Update chat room (e.g., name)      |
| DELETE | `/api/chatroom/:id`               | Delete chat room                   |
| GET    | `/api/chatroom/:id/history`       | Get chat room message history      |

---

## 📖 Get Chat Room

**Endpoint:**  
`GET /api/chatroom/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "id": "string",
  "name": "string",
  "memberIds": ["string"],
  "createdAt": "string"
}
```

---

## 📄 List Chat Rooms

**Endpoint:**  
`GET /api/chatroom`

**Request Headers:**
```
Authorization: <token>
```

**Query Parameters (optional):**
- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 20)

**Success Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "memberIds": ["string"],
      "createdAt": "string"
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

## 📝 Create Chat Room

**Endpoint:**  
`POST /api/chatroom`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "name": "string",
  "memberIds": ["string"]
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "memberIds": ["string"],
    "createdAt": "string"
  }
}
```

---

## ✏️ Update Chat Room

**Endpoint:**  
`PATCH /api/chatroom/:id`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**  
_Update chat room name or members_
```json
{
  "name": "string",
  "memberIds": ["string"]
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "memberIds": ["string"],
    "createdAt": "string"
  }
}
```

---

## 🗑️ Delete Chat Room

**Endpoint:**  
`DELETE /api/chatroom/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "message": "Chat room deleted successfully"
}
```

---

## 🕑 Get Chat Room Message History

**Endpoint:**  
`GET /api/chatroom/:id/history`

**Request Headers:**
```
Authorization: <token>
```

**Query Parameters (optional):**
- `limit`: Number of messages to return (default: 20)
- `offset`: Number of messages to skip (for pagination)

**Success Response:**
```json
{
  "data": [
    {
      "id": "string",
      "senderId": "string",
      "content": "string",
      "timestamp": "string",
      "read": true
    }
  ]
}
```

---