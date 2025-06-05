# 📝 Biodata API Documentation

A simple RESTful API for managing user biodata.

---

## 📜 Biodata Model

```typescript
export interface Biodata {
  id: string;
  birthdate?: string;
  gender?: string;
  phone?: string;
  address?: string;
}
```

---

## 📋 Endpoints Overview

| Method | Endpoint            | Description           |
|--------|--------------------|-----------------------|
| GET    | `/api/biodata/:id` | Get biodata by ID     |
| POST   | `/api/biodata`     | Create new biodata    |
| PATCH  | `/api/biodata/:id` | Update biodata by ID  |
| DELETE | `/api/biodata/:id` | Delete biodata by ID  |

---

## 📖 Get Biodata

**Endpoint:**  
`GET /api/biodata/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "id": "string",
  "birthdate": "string",
  "gender": "string",
  "phone": "string",
  "address": "string"
}
```

---

## 📝 Create Biodata

**Endpoint:**  
`POST /api/biodata`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "birthdate": "string",
  "gender": "string",
  "phone": "string",
  "address": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "birthdate": "string",
    "gender": "string",
    "phone": "string",
    "address": "string"
  }
}
```

---

## ✏️ Update Biodata

**Endpoint:**  
`PATCH /api/biodata/:id`

**Request Headers:**
```
Authorization: <token>
```

**Request Body:**
```json
{
  "birthdate": "string",
  "gender": "string",
  "phone": "string",
  "address": "string"
}
```

**Success Response:**
```json
{
  "data": {
    "id": "string",
    "birthdate": "string",
    "gender": "string",
    "phone": "string",
    "address": "string"
  }
}
```

---

## 🗑️ Delete Biodata

**Endpoint:**  
`DELETE /api/biodata/:id`

**Request Headers:**
```
Authorization: <token>
```

**Success Response:**
```json
{
  "message": "Biodata deleted successfully"
}
```

---

> **Note:**  
> All endpoints expect and return JSON.  
> Authentication is required for all biodata endpoints.