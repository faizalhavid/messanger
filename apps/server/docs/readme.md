# 💬 Message & Chat Room API Documentation

A simple RESTful API for managing chat messages and chat rooms.

---

## 📖 General API Overview

- **Base URL:** `/api`
- **Content-Type:** All endpoints expect and return `application/json`.
- **Authentication:**  
  Most endpoints require a valid JWT token in the `Authorization` header:
  ```
  Authorization: <token>
  ```
- **Versioning:**  
  Add `/v1/` to the base URL if you use versioning (e.g., `/api/v1/message`).

### Error Handling

All error responses follow this format:
```json
{
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```
- **401 Unauthorized:** Missing or invalid token.
- **404 Not Found:** Resource does not exist.
- **400 Bad Request:** Invalid input or missing required fields.
- **500 Internal Server Error:** Unexpected server error.

---

## 📦 Pagination Pattern

All endpoints that return a list use this pagination wrapper:

```json
{
  "data": [
    // array of items
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

### Common Query Parameters for List Endpoints

| Parameter   | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `page`      | number | Page number (default: 1)             |
| `pageSize`  | number | Items per page (default: 20)         |
| ...         | ...    | Additional filters per endpoint      |

---

## 📚 API Modules

- [User API Documentation](user.md)
- [Profile API Documentation](profile.md)
- [Biodata API Documentation](biodata.md)
- [Message API Documentation](message.md)
- [Chat Room API Documentation](chat-room.md)

---

## 📜 Message Model

See [Message API Documentation](message.md) for full details.

```typescript
export interface Message {
  id: string;
  senderId: string;    // User ID
  receiverId: string;  // User ID or ChatRoom ID
  content: string;
  timestamp: string;
  read?: boolean;
  chatRoomId?: string; // If message belongs to a chat room
}
```

---

## 📜 Chat Room Model

See [Chat Room API Documentation](chat-room.md) for full details.

```typescript
export interface ChatRoom {
  id: string;
  name: string;
  memberIds: string[]; // Array of User IDs
  createdAt: string;
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint                  | Description                        | Docs Link |
|--------|--------------------------|------------------------------------|-----------|
| GET    | `/api/message/:id`       | Get message by ID                  | [Message](message.md) |
| GET    | `/api/message`           | List messages (with filters)       | [Message](message.md) |
| POST   | `/api/message`           | Send a new message                 | [Message](message.md) |
| PATCH  | `/api/message/:id`       | Update message by ID               | [Message](message.md) |
| DELETE | `/api/message/:id`       | Delete message by ID               | [Message](message.md) |
| GET    | `/api/chatroom/:id`      | Get chat room by ID                | [Chat Room](chat-room.md) |
| GET    | `/api/chatroom`          | List chat rooms                    | [Chat Room](chat-room.md) |
| POST   | `/api/chatroom`          | Create a new chat room             | [Chat Room](chat-room.md) |
| PATCH  | `/api/chatroom/:id`      | Update chat room (e.g., name)      | [Chat Room](chat-room.md) |
| DELETE | `/api/chatroom/:id`      | Delete chat room                   | [Chat Room](chat-room.md) |

---

> **Note:**  
> All endpoints expect and return JSON.  
> Authentication is required for all message and chat room endpoints.  
> List endpoints support pagination and filtering via query parameters.