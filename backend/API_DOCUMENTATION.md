# Adept-AI Backend API Documentation

> **Base URL**: `http://localhost:{PORT}`
>
> **Content-Type**: `application/json` (unless specified otherwise)

> ⚠️ **Disclaimer**: This API is under active development. Parameters, request body fields, and authentication requirements for some routes may change in future versions. Please check for updates regularly.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Auth Routes](#auth-routes)
3. [Profile Routes](#profile-routes)
4. [Course Routes](#course-routes)
5. [Department Routes](#department-routes)
6. [Document Routes](#document-routes)
7. [Database Schema Reference](#database-schema-reference)
8. [Error Responses](#error-responses)

---

## Authentication

Some routes require authentication via Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

**Protected Routes:**

- All `/profiles` routes
- `/documents` routes (authentication middleware commented out but designed for protection)
- `/couses` routes (same as documents routes)
- `/departments` routes (same as documents routes)

---

## Auth Routes

Base path: `/auth`

### Register User

Creates a new user account and associated profile.

| Attribute          | Value            |
| ------------------ | ---------------- |
| **Method**         | `POST`           |
| **Endpoint**       | `/auth/register` |
| **Authentication** | Not required     |

#### Request Body

| Field      | Type     | Required | Description          |
| ---------- | -------- | -------- | -------------------- |
| `email`    | `string` | ✅ Yes   | User's email address |
| `password` | `string` | ✅ Yes   | User's password      |

#### Example Request

```json
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Registration successful"
}
```

---

### Delete User

Deletes a user account by ID.

| Attribute          | Value                          |
| ------------------ | ------------------------------ |
| **Method**         | `DELETE`                       |
| **Endpoint**       | `/auth/:id`                    |
| **Authentication** | Not required (Admin operation) |

#### Path Parameters

| Parameter | Type            | Required | Description       |
| --------- | --------------- | -------- | ----------------- |
| `id`      | `string` (UUID) | ✅ Yes   | User ID to delete |

#### Example Request

```
DELETE /auth/550e8400-e29b-41d4-a716-446655440000
```

#### Example Response

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Profile Routes

Base path: `/profiles`

> ⚠️ **All routes require authentication**

### Get Profile

Retrieves a user's profile. Users can only access their own profile.

| Attribute          | Value           |
| ------------------ | --------------- |
| **Method**         | `GET`           |
| **Endpoint**       | `/profiles/:id` |
| **Authentication** | ✅ Required     |

#### Path Parameters

| Parameter | Type            | Required | Description                             |
| --------- | --------------- | -------- | --------------------------------------- |
| `id`      | `string` (UUID) | ✅ Yes   | User ID (must match authenticated user) |

#### Example Request

```
GET /profiles/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "avatar": "https://example.com/avatar.jpg",
    "dept_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2026-01-28T10:00:00.000Z"
  },
  "message": "Profile fetched successfully"
}
```

---

### Update Profile

Updates a user's profile. Users can only update their own profile.

| Attribute          | Value           |
| ------------------ | --------------- |
| **Method**         | `PATCH`         |
| **Endpoint**       | `/profiles/:id` |
| **Authentication** | ✅ Required     |

#### Path Parameters

| Parameter | Type            | Required | Description                             |
| --------- | --------------- | -------- | --------------------------------------- |
| `id`      | `string` (UUID) | ✅ Yes   | User ID (must match authenticated user) |

#### Request Body

| Field    | Type     | Required | Description                    |
| -------- | -------- | -------- | ------------------------------ |
| `avatar` | `string` | ✅ Yes   | URL to the user's avatar image |

#### Example Request

```json
PATCH /profiles/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "avatar": "https://example.com/new-avatar.jpg",
    "dept_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2026-01-28T10:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

## Course Routes

Base path: `/courses`

### Get All Courses

Retrieves all courses.

| Attribute          | Value        |
| ------------------ | ------------ |
| **Method**         | `GET`        |
| **Endpoint**       | `/courses`   |
| **Authentication** | Not required |

#### Example Request

```
GET /courses
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "created_at": "2026-01-28T10:00:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "code": "CS201",
      "name": "Data Structures",
      "created_at": "2026-01-28T11:00:00.000Z"
    }
  ],
  "message": "Courses fetched successfully"
}
```

---

### Get Course by ID

Retrieves a single course by its ID.

| Attribute          | Value                |
| ------------------ | -------------------- |
| **Method**         | `GET`                |
| **Endpoint**       | `/courses/:courseId` |
| **Authentication** | Not required         |

#### Path Parameters

| Parameter  | Type            | Required | Description |
| ---------- | --------------- | -------- | ----------- |
| `courseId` | `string` (UUID) | ✅ Yes   | Course ID   |

#### Example Request

```
GET /courses/770e8400-e29b-41d4-a716-446655440002
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "created_at": "2026-01-28T10:00:00.000Z"
  },
  "message": "Course fetched successfully"
}
```

---

### Create Course

Creates a new course.

| Attribute          | Value        |
| ------------------ | ------------ |
| **Method**         | `POST`       |
| **Endpoint**       | `/courses`   |
| **Authentication** | Not required |

#### Request Body

| Field  | Type     | Required | Description                        |
| ------ | -------- | -------- | ---------------------------------- |
| `code` | `string` | ✅ Yes   | Unique course code (e.g., "CS101") |
| `name` | `string` | ❌ No    | Course name                        |

#### Example Request

```json
POST /courses
Content-Type: application/json

{
  "code": "CS301",
  "name": "Algorithms"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440004",
    "code": "CS301",
    "name": "Algorithms",
    "created_at": "2026-01-28T12:00:00.000Z"
  },
  "message": "Course created successfully"
}
```

---

### Update Course

Updates an existing course.

| Attribute          | Value                |
| ------------------ | -------------------- |
| **Method**         | `PATCH`              |
| **Endpoint**       | `/courses/:courseId` |
| **Authentication** | Not required         |

#### Path Parameters

| Parameter  | Type            | Required | Description         |
| ---------- | --------------- | -------- | ------------------- |
| `courseId` | `string` (UUID) | ✅ Yes   | Course ID to update |

#### Request Body

| Field  | Type     | Required | Description         |
| ------ | -------- | -------- | ------------------- |
| `code` | `string` | ❌ No    | Updated course code |
| `name` | `string` | ❌ No    | Updated course name |

> **Note**: At least one field should be provided for the update.

#### Example Request

```json
PATCH /courses/770e8400-e29b-41d4-a716-446655440004
Content-Type: application/json

{
  "name": "Advanced Algorithms"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440004",
    "code": "CS301",
    "name": "Advanced Algorithms",
    "created_at": "2026-01-28T12:00:00.000Z"
  },
  "message": "Course updated successfully"
}
```

---

### Delete Course

Deletes a course.

| Attribute          | Value                |
| ------------------ | -------------------- |
| **Method**         | `DELETE`             |
| **Endpoint**       | `/courses/:courseId` |
| **Authentication** | Not required         |

#### Path Parameters

| Parameter  | Type            | Required | Description         |
| ---------- | --------------- | -------- | ------------------- |
| `courseId` | `string` (UUID) | ✅ Yes   | Course ID to delete |

#### Example Request

```
DELETE /courses/770e8400-e29b-41d4-a716-446655440004
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440004",
      "code": "CS301",
      "name": "Advanced Algorithms",
      "created_at": "2026-01-28T12:00:00.000Z"
    }
  ],
  "message": "Course deleted successfully"
}
```

---

### Assign Course to Department

Links a course to a department (many-to-many relationship).

| Attribute          | Value                 |
| ------------------ | --------------------- |
| **Method**         | `POST`                |
| **Endpoint**       | `/courses/providedBy` |
| **Authentication** | Not required          |

#### Request Body

| Field          | Type            | Required | Description                           |
| -------------- | --------------- | -------- | ------------------------------------- |
| `courseId`     | `string` (UUID) | ✅ Yes   | Course ID to assign                   |
| `departmentId` | `string` (UUID) | ✅ Yes   | Department ID to assign the course to |

#### Example Request

```json
POST /courses/providedBy
Content-Type: application/json

{
  "courseId": "770e8400-e29b-41d4-a716-446655440002",
  "departmentId": "660e8400-e29b-41d4-a716-446655440001"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "course_id": "770e8400-e29b-41d4-a716-446655440002",
    "dept_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2026-01-28T12:30:00.000Z"
  },
  "message": "Course assigned to department successfully"
}
```

---

## Department Routes

Base path: `/departments`

### Get All Departments

Retrieves all departments.

| Attribute          | Value          |
| ------------------ | -------------- |
| **Method**         | `GET`          |
| **Endpoint**       | `/departments` |
| **Authentication** | Not required   |

#### Example Request

```
GET /departments
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Computer Science",
      "abbreviation": "CS",
      "created_at": "2026-01-28T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "name": "Electrical Engineering",
      "abbreviation": "EE",
      "created_at": "2026-01-28T11:00:00.000Z"
    }
  ],
  "message": "Departments fetched successfully"
}
```

---

### Get Department by ID

Retrieves a single department by its ID.

| Attribute          | Value                  |
| ------------------ | ---------------------- |
| **Method**         | `GET`                  |
| **Endpoint**       | `/departments/:deptId` |
| **Authentication** | Not required           |

#### Path Parameters

| Parameter | Type            | Required | Description   |
| --------- | --------------- | -------- | ------------- |
| `deptId`  | `string` (UUID) | ✅ Yes   | Department ID |

#### Example Request

```
GET /departments/660e8400-e29b-41d4-a716-446655440001
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Computer Science",
    "abbreviation": "CS",
    "created_at": "2026-01-28T10:00:00.000Z"
  },
  "message": "Department fetched successfully"
}
```

---

### Create Department

Creates a new department.

| Attribute          | Value          |
| ------------------ | -------------- |
| **Method**         | `POST`         |
| **Endpoint**       | `/departments` |
| **Authentication** | Not required   |

#### Request Body

| Field          | Type     | Required | Description             |
| -------------- | -------- | -------- | ----------------------- |
| `name`         | `string` | ✅ Yes   | Department name         |
| `abbreviation` | `string` | ❌ No    | Department abbreviation |

#### Example Request

```json
POST /departments
Content-Type: application/json

{
  "name": "Mechanical Engineering",
  "abbreviation": "ME"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "name": "Mechanical Engineering",
    "abbreviation": "ME",
    "created_at": "2026-01-28T12:00:00.000Z"
  },
  "message": "Department created successfully"
}
```

---

### Update Department

Updates an existing department.

| Attribute          | Value                  |
| ------------------ | ---------------------- |
| **Method**         | `PATCH`                |
| **Endpoint**       | `/departments/:deptId` |
| **Authentication** | Not required           |

#### Path Parameters

| Parameter | Type            | Required | Description             |
| --------- | --------------- | -------- | ----------------------- |
| `deptId`  | `string` (UUID) | ✅ Yes   | Department ID to update |

#### Request Body

| Field          | Type     | Required | Description                     |
| -------------- | -------- | -------- | ------------------------------- |
| `name`         | `string` | ❌ No    | Updated department name         |
| `abbreviation` | `string` | ❌ No    | Updated department abbreviation |

> **Note**: At least one field should be provided for the update.

#### Example Request

```json
PATCH /departments/660e8400-e29b-41d4-a716-446655440003
Content-Type: application/json

{
  "abbreviation": "MECH"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "name": "Mechanical Engineering",
    "abbreviation": "MECH",
    "created_at": "2026-01-28T12:00:00.000Z"
  },
  "message": "Department updated successfully"
}
```

---

### Delete Department

Deletes a department.

| Attribute          | Value                  |
| ------------------ | ---------------------- |
| **Method**         | `DELETE`               |
| **Endpoint**       | `/departments/:deptId` |
| **Authentication** | Not required           |

#### Path Parameters

| Parameter | Type            | Required | Description             |
| --------- | --------------- | -------- | ----------------------- |
| `deptId`  | `string` (UUID) | ✅ Yes   | Department ID to delete |

#### Example Request

```
DELETE /departments/660e8400-e29b-41d4-a716-446655440003
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440003",
    "name": "Mechanical Engineering",
    "abbreviation": "MECH",
    "created_at": "2026-01-28T12:00:00.000Z"
  },
  "message": "Department deleted successfully"
}
```

---

## Document Routes

Base path: `/documents`

> **Note**: Authentication middleware is currently commented out but designed for these routes.

### Upload Document

Uploads a PDF document and stores metadata in the database.

| Attribute          | Value                         |
| ------------------ | ----------------------------- |
| **Method**         | `POST`                        |
| **Endpoint**       | `/documents`                  |
| **Authentication** | Designed (currently disabled) |
| **Content-Type**   | `multipart/form-data`         |

#### Request Body (Form Data)

| Field      | Type            | Required | Description                           |
| ---------- | --------------- | -------- | ------------------------------------- |
| `document` | `file` (PDF)    | ✅ Yes   | PDF file to upload (max 10MB)         |
| `title`    | `string`        | ❌ No    | Document title (defaults to filename) |
| `unit`     | `number`        | ❌ No    | Unit number for the document          |
| `courseId` | `string` (UUID) | ✅ Yes   | Associated course ID                  |

#### File Restrictions

- **File Type**: PDF only (`application/pdf`)
- **Max Size**: 10 MB

#### Example Request

```
POST /documents
Content-Type: multipart/form-data

document: [PDF file]
title: "Chapter 1 Notes"
unit: 1
courseId: "770e8400-e29b-41d4-a716-446655440002"
```

#### Example Response

```json
{
  "success": true,
  "message": "Uploaded document successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440005",
    "title": "Chapter 1 Notes",
    "unit": 1,
    "course_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-28T13:00:00.000Z"
  }
}
```

---

### Update Document

Updates document metadata.

| Attribute          | Value                         |
| ------------------ | ----------------------------- |
| **Method**         | `PATCH`                       |
| **Endpoint**       | `/documents/:id`              |
| **Authentication** | Designed (currently disabled) |

#### Path Parameters

| Parameter | Type            | Required | Description           |
| --------- | --------------- | -------- | --------------------- |
| `id`      | `string` (UUID) | ✅ Yes   | Document ID to update |

#### Request Body

| Field      | Type            | Required | Description            |
| ---------- | --------------- | -------- | ---------------------- |
| `title`    | `string`        | ❌ No    | Updated document title |
| `unit`     | `number`        | ❌ No    | Updated unit number    |
| `courseId` | `string` (UUID) | ❌ No    | Updated course ID      |

> **Note**: At least one field must be provided for the update.

#### Example Request

```json
PATCH /documents/880e8400-e29b-41d4-a716-446655440005
Content-Type: application/json

{
  "title": "Chapter 1 - Updated Notes",
  "unit": 2
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Updated document successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440005",
    "title": "Chapter 1 - Updated Notes",
    "unit": 2,
    "course_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-28T13:00:00.000Z"
  }
}
```

---

### Delete Document

Deletes a document and its associated file from S3 storage.

| Attribute          | Value                         |
| ------------------ | ----------------------------- |
| **Method**         | `DELETE`                      |
| **Endpoint**       | `/documents/:id`              |
| **Authentication** | Designed (currently disabled) |

#### Path Parameters

| Parameter | Type            | Required | Description           |
| --------- | --------------- | -------- | --------------------- |
| `id`      | `string` (UUID) | ✅ Yes   | Document ID to delete |

#### Example Request

```
DELETE /documents/880e8400-e29b-41d4-a716-446655440005
```

#### Example Response

```json
{
  "status": true,
  "message": "Document deleted successfully"
}
```

---

## Database Schema Reference

### Courses Table

| Column       | Type                 | Required on Insert | Description        |
| ------------ | -------------------- | ------------------ | ------------------ |
| `id`         | `string` (UUID)      | ❌ Auto-generated  | Primary key        |
| `code`       | `string`             | ✅ Yes             | Unique course code |
| `name`       | `string \| null`     | ❌ No              | Course name        |
| `created_at` | `string` (timestamp) | ❌ Auto-generated  | Creation timestamp |

---

### Departments Table

| Column         | Type                 | Required on Insert | Description             |
| -------------- | -------------------- | ------------------ | ----------------------- |
| `id`           | `string` (UUID)      | ❌ Auto-generated  | Primary key             |
| `name`         | `string`             | ✅ Yes             | Department name         |
| `abbreviation` | `string \| null`     | ❌ No              | Department abbreviation |
| `created_at`   | `string` (timestamp) | ❌ Auto-generated  | Creation timestamp      |

---

### Documents Table

| Column       | Type                    | Required on Insert | Description                    |
| ------------ | ----------------------- | ------------------ | ------------------------------ |
| `id`         | `string` (UUID)         | ❌ Auto-generated  | Primary key                    |
| `course_id`  | `string` (UUID)         | ✅ Yes             | Foreign key to courses         |
| `title`      | `string \| null`        | ❌ No              | Document title                 |
| `unit`       | `number \| null`        | ❌ No              | Unit number                    |
| `user_id`    | `string \| null` (UUID) | ❌ No              | Foreign key to user (uploader) |
| `created_at` | `string` (timestamp)    | ❌ Auto-generated  | Creation timestamp             |

---

### Profiles Table

| Column       | Type                    | Required on Insert | Description                       |
| ------------ | ----------------------- | ------------------ | --------------------------------- |
| `user_id`    | `string` (UUID)         | ✅ Yes             | Primary key (linked to auth user) |
| `avatar`     | `string \| null`        | ❌ No              | URL to avatar image               |
| `dept_id`    | `string \| null` (UUID) | ❌ No              | Foreign key to departments        |
| `created_at` | `string` (timestamp)    | ❌ Auto-generated  | Creation timestamp                |

---

### Provided_By Table (Junction Table)

Links courses to departments (many-to-many relationship).

| Column       | Type                 | Required on Insert | Description                |
| ------------ | -------------------- | ------------------ | -------------------------- |
| `course_id`  | `string` (UUID)      | ✅ Yes             | Foreign key to courses     |
| `dept_id`    | `string` (UUID)      | ✅ Yes             | Foreign key to departments |
| `created_at` | `string` (timestamp) | ❌ Auto-generated  | Creation timestamp         |

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common HTTP Status Codes

| Status Code | Description                                              |
| ----------- | -------------------------------------------------------- |
| `400`       | Bad Request - Invalid input or missing required fields   |
| `401`       | Unauthorized - Missing or invalid authentication token   |
| `403`       | Forbidden - User doesn't have permission for this action |
| `404`       | Not Found - Resource doesn't exist                       |
| `500`       | Internal Server Error - Server-side error                |

### Example Error Responses

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Forbidden: You can only access your own profile"
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**400 Bad Request (File Type):**

```json
{
  "success": false,
  "message": "Only PDF files are allowed"
}
```

---

## API Routes Summary

| Method   | Endpoint               | Description                 | Auth Required |
| -------- | ---------------------- | --------------------------- | ------------- |
| `POST`   | `/auth/register`       | Register new user           | ❌            |
| `DELETE` | `/auth/:id`            | Delete user                 | ❌            |
| `GET`    | `/profiles/:id`        | Get user profile            | ✅            |
| `PATCH`  | `/profiles/:id`        | Update user profile         | ✅            |
| `GET`    | `/courses`             | Get all courses             | ❌            |
| `GET`    | `/courses/:courseId`   | Get course by ID            | ❌            |
| `POST`   | `/courses`             | Create course               | ❌            |
| `PATCH`  | `/courses/:courseId`   | Update course               | ❌            |
| `DELETE` | `/courses/:courseId`   | Delete course               | ❌            |
| `POST`   | `/courses/providedBy`  | Assign course to department | ❌            |
| `GET`    | `/departments`         | Get all departments         | ❌            |
| `GET`    | `/departments/:deptId` | Get department by ID        | ❌            |
| `POST`   | `/departments`         | Create department           | ❌            |
| `PATCH`  | `/departments/:deptId` | Update department           | ❌            |
| `DELETE` | `/departments/:deptId` | Delete department           | ❌            |
| `POST`   | `/documents`           | Upload document (PDF)       | ⚠️ Designed   |
| `PATCH`  | `/documents/:id`       | Update document             | ⚠️ Designed   |
| `DELETE` | `/documents/:id`       | Delete document             | ⚠️ Designed   |

---

_Generated on: January 28, 2026_
