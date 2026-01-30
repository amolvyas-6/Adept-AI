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
7. [Library Routes](#library-routes)
8. [Database Schema Reference](#database-schema-reference)
9. [Error Responses](#error-responses)

---

## Authentication

Some routes require authentication via Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

**Protected Routes:**

- All `/profiles` routes
- All `/documents` routes
- All `/library` routes

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
| `fullName` | `string` | ❌ No    | User's full name     |

#### Response Body

| Field     | Type      | Description      |
| --------- | --------- | ---------------- |
| `success` | `boolean` | Operation status |
| `message` | `string`  | Status message   |

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

#### Response Body

| Field     | Type      | Description      |
| --------- | --------- | ---------------- |
| `success` | `boolean` | Operation status |
| `message` | `string`  | Status message   |

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

#### Response Body

| Field             | Type                    | Description        |
| ----------------- | ----------------------- | ------------------ |
| `success`         | `boolean`               | Operation status   |
| `message`         | `string`                | Status message     |
| `data.user_id`    | `string` (UUID)         | User ID            |
| `data.full_name`  | `string`                | User's full name   |
| `data.dept_id`    | `string \| null` (UUID) | Department ID      |
| `data.created_at` | `string` (timestamp)    | Creation timestamp |

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

| Field      | Type     | Required | Description      |
| ---------- | -------- | -------- | ---------------- |
| `fullName` | `string` | ❌ No    | User's full name |
| `deptId`   | `string` | ❌ No    | Department ID    |

> **Note**: At least one field must be provided for the update.

#### Response Body

| Field             | Type                    | Description        |
| ----------------- | ----------------------- | ------------------ |
| `success`         | `boolean`               | Operation status   |
| `message`         | `string`                | Status message     |
| `data.user_id`    | `string` (UUID)         | User ID            |
| `data.full_name`  | `string`                | User's full name   |
| `data.dept_id`    | `string \| null` (UUID) | Department ID      |
| `data.created_at` | `string` (timestamp)    | Creation timestamp |

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

#### Response Body

| Field               | Type                 | Description        |
| ------------------- | -------------------- | ------------------ |
| `success`           | `boolean`            | Operation status   |
| `message`           | `string`             | Status message     |
| `data`              | `array`              | Array of courses   |
| `data[].id`         | `string` (UUID)      | Course ID          |
| `data[].code`       | `string`             | Course code        |
| `data[].name`       | `string \| null`     | Course name        |
| `data[].created_at` | `string` (timestamp) | Creation timestamp |

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

#### Response Body

| Field             | Type                 | Description        |
| ----------------- | -------------------- | ------------------ |
| `success`         | `boolean`            | Operation status   |
| `message`         | `string`             | Status message     |
| `data.id`         | `string` (UUID)      | Course ID          |
| `data.code`       | `string`             | Course code        |
| `data.name`       | `string \| null`     | Course name        |
| `data.created_at` | `string` (timestamp) | Creation timestamp |

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

#### Response Body

| Field             | Type                 | Description        |
| ----------------- | -------------------- | ------------------ |
| `success`         | `boolean`            | Operation status   |
| `message`         | `string`             | Status message     |
| `data.id`         | `string` (UUID)      | Course ID          |
| `data.code`       | `string`             | Course code        |
| `data.name`       | `string \| null`     | Course name        |
| `data.created_at` | `string` (timestamp) | Creation timestamp |

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

#### Response Body

| Field             | Type                 | Description        |
| ----------------- | -------------------- | ------------------ |
| `success`         | `boolean`            | Operation status   |
| `message`         | `string`             | Status message     |
| `data.id`         | `string` (UUID)      | Course ID          |
| `data.code`       | `string`             | Course code        |
| `data.name`       | `string \| null`     | Course name        |
| `data.created_at` | `string` (timestamp) | Creation timestamp |

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

#### Response Body

| Field               | Type                 | Description            |
| ------------------- | -------------------- | ---------------------- |
| `success`           | `boolean`            | Operation status       |
| `message`           | `string`             | Status message         |
| `data`              | `array`              | Array of deleted items |
| `data[].id`         | `string` (UUID)      | Course ID              |
| `data[].code`       | `string`             | Course code            |
| `data[].name`       | `string \| null`     | Course name            |
| `data[].created_at` | `string` (timestamp) | Creation timestamp     |

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

#### Response Body

| Field             | Type                 | Description        |
| ----------------- | -------------------- | ------------------ |
| `success`         | `boolean`            | Operation status   |
| `message`         | `string`             | Status message     |
| `data.course_id`  | `string` (UUID)      | Course ID          |
| `data.dept_id`    | `string` (UUID)      | Department ID      |
| `data.created_at` | `string` (timestamp) | Creation timestamp |

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

#### Response Body

| Field                 | Type                 | Description             |
| --------------------- | -------------------- | ----------------------- |
| `success`             | `boolean`            | Operation status        |
| `message`             | `string`             | Status message          |
| `data`                | `array`              | Array of departments    |
| `data[].id`           | `string` (UUID)      | Department ID           |
| `data[].name`         | `string`             | Department name         |
| `data[].abbreviation` | `string \| null`     | Department abbreviation |
| `data[].created_at`   | `string` (timestamp) | Creation timestamp      |

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

#### Response Body

| Field               | Type                 | Description             |
| ------------------- | -------------------- | ----------------------- |
| `success`           | `boolean`            | Operation status        |
| `message`           | `string`             | Status message          |
| `data.id`           | `string` (UUID)      | Department ID           |
| `data.name`         | `string`             | Department name         |
| `data.abbreviation` | `string \| null`     | Department abbreviation |
| `data.created_at`   | `string` (timestamp) | Creation timestamp      |

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

#### Response Body

| Field               | Type                 | Description             |
| ------------------- | -------------------- | ----------------------- |
| `success`           | `boolean`            | Operation status        |
| `message`           | `string`             | Status message          |
| `data.id`           | `string` (UUID)      | Department ID           |
| `data.name`         | `string`             | Department name         |
| `data.abbreviation` | `string \| null`     | Department abbreviation |
| `data.created_at`   | `string` (timestamp) | Creation timestamp      |

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

#### Response Body

| Field               | Type                 | Description             |
| ------------------- | -------------------- | ----------------------- |
| `success`           | `boolean`            | Operation status        |
| `message`           | `string`             | Status message          |
| `data.id`           | `string` (UUID)      | Department ID           |
| `data.name`         | `string`             | Department name         |
| `data.abbreviation` | `string \| null`     | Department abbreviation |
| `data.created_at`   | `string` (timestamp) | Creation timestamp      |

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

#### Response Body

| Field               | Type                 | Description             |
| ------------------- | -------------------- | ----------------------- |
| `success`           | `boolean`            | Operation status        |
| `message`           | `string`             | Status message          |
| `data.id`           | `string` (UUID)      | Department ID           |
| `data.name`         | `string`             | Department name         |
| `data.abbreviation` | `string \| null`     | Department abbreviation |
| `data.created_at`   | `string` (timestamp) | Creation timestamp      |

---

## Document Routes

Base path: `/documents`

> **Note**: Authentication middleware is currently commented out but designed for these routes.

### Upload Document

Uploads a PDF document and stores metadata in the database.

| Attribute          | Value                 |
| ------------------ | --------------------- |
| **Method**         | `POST`                |
| **Endpoint**       | `/documents`          |
| **Authentication** | ✅ Required           |
| **Content-Type**   | `multipart/form-data` |

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

#### Response Body

| Field             | Type                    | Description        |
| ----------------- | ----------------------- | ------------------ |
| `success`         | `boolean`               | Operation status   |
| `message`         | `string`                | Status message     |
| `data.id`         | `string` (UUID)         | Document ID        |
| `data.title`      | `string \| null`        | Document title     |
| `data.unit`       | `number \| null`        | Unit number        |
| `data.course_id`  | `string` (UUID)         | Course ID          |
| `data.user_id`    | `string \| null` (UUID) | Uploader user ID   |
| `data.created_at` | `string` (timestamp)    | Creation timestamp |

---

### Get Document by ID

Retrieves a single document with its details and related information.

| Attribute          | Value            |
| ------------------ | ---------------- |
| **Method**         | `GET`            |
| **Endpoint**       | `/documents/:id` |
| **Authentication** | ✅ Required      |

#### Path Parameters

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string` (UUID) | ✅ Yes   | Document ID |

#### Response Body

| Field                     | Type                    | Description           |
| ------------------------- | ----------------------- | --------------------- |
| `success`                 | `boolean`               | Operation status      |
| `message`                 | `string`                | Status message        |
| `data.id`                 | `string` (UUID)         | Document ID           |
| `data.title`              | `string \| null`        | Document title        |
| `data.unit`               | `number \| null`        | Unit number           |
| `data.course_id`          | `string` (UUID)         | Course ID             |
| `data.user_id`            | `string \| null` (UUID) | Uploader user ID      |
| `data.created_at`         | `string` (timestamp)    | Creation timestamp    |
| `data.profiles`           | `object \| null`        | Uploader profile info |
| `data.profiles.full_name` | `string`                | Uploader's full name  |
| `data.courses`            | `object`                | Course information    |
| `data.courses.name`       | `string \| null`        | Course name           |
| `data.courses.code`       | `string`                | Course code           |

---

### Update Document

Updates document metadata.

| Attribute          | Value            |
| ------------------ | ---------------- |
| **Method**         | `PATCH`          |
| **Endpoint**       | `/documents/:id` |
| **Authentication** | ✅ Required      |

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

#### Response Body

| Field             | Type                    | Description        |
| ----------------- | ----------------------- | ------------------ |
| `success`         | `boolean`               | Operation status   |
| `message`         | `string`                | Status message     |
| `data.id`         | `string` (UUID)         | Document ID        |
| `data.title`      | `string \| null`        | Document title     |
| `data.unit`       | `number \| null`        | Unit number        |
| `data.course_id`  | `string` (UUID)         | Course ID          |
| `data.user_id`    | `string \| null` (UUID) | Uploader user ID   |
| `data.created_at` | `string` (timestamp)    | Creation timestamp |

---

### Delete Document

Deletes a document and its associated file from S3 storage.

| Attribute          | Value            |
| ------------------ | ---------------- |
| **Method**         | `DELETE`         |
| **Endpoint**       | `/documents/:id` |
| **Authentication** | ✅ Required      |

#### Path Parameters

| Parameter | Type            | Required | Description           |
| --------- | --------------- | -------- | --------------------- |
| `id`      | `string` (UUID) | ✅ Yes   | Document ID to delete |

#### Response Body

| Field     | Type      | Description      |
| --------- | --------- | ---------------- |
| `status`  | `boolean` | Operation status |
| `message` | `string`  | Status message   |

---

## Library Routes

Base path: `/library`

> ⚠️ **All routes require authentication**

### Get User's Library

Retrieves all documents saved in the authenticated user's personal library/collection.

| Attribute          | Value       |
| ------------------ | ----------- |
| **Method**         | `GET`       |
| **Endpoint**       | `/library`  |
| **Authentication** | ✅ Required |

#### Response Body

| Field                | Type                 | Description              |
| -------------------- | -------------------- | ------------------------ |
| `success`            | `boolean`            | Operation status         |
| `message`            | `string`             | Status message           |
| `data`               | `array`              | Array of saved documents |
| `data[].id`          | `string` (UUID)      | Library entry ID         |
| `data[].saved_at`    | `string` (timestamp) | When document was saved  |
| `data[].document_id` | `string` (UUID)      | Document ID              |
| `data[].title`       | `string \| null`     | Document title           |
| `data[].unit`        | `number \| null`     | Unit number              |
| `data[].uploader`    | `string \| null`     | Full name of uploader    |
| `data[].course_code` | `string`             | Course code              |
| `data[].course_name` | `string \| null`     | Course name              |

---

### Add Document to Library

Saves a document to the authenticated user's personal library/collection.

| Attribute          | Value       |
| ------------------ | ----------- |
| **Method**         | `POST`      |
| **Endpoint**       | `/library`  |
| **Authentication** | ✅ Required |

#### Request Body

| Field        | Type            | Required | Description         |
| ------------ | --------------- | -------- | ------------------- |
| `documentId` | `string` (UUID) | ✅ Yes   | Document ID to save |

#### Response Body

| Field              | Type                 | Description        |
| ------------------ | -------------------- | ------------------ |
| `success`          | `boolean`            | Operation status   |
| `message`          | `string`             | Status message     |
| `data.id`          | `string` (UUID)      | Library entry ID   |
| `data.user_id`     | `string` (UUID)      | User ID            |
| `data.document_id` | `string` (UUID)      | Document ID        |
| `data.created_at`  | `string` (timestamp) | Creation timestamp |

---

### Remove Document from Library

Removes a document from the authenticated user's personal library/collection.

| Attribute          | Value             |
| ------------------ | ----------------- |
| **Method**         | `DELETE`          |
| **Endpoint**       | `/library/:docId` |
| **Authentication** | ✅ Required       |

#### Path Parameters

| Parameter | Type            | Required | Description           |
| --------- | --------------- | -------- | --------------------- |
| `docId`   | `string` (UUID) | ✅ Yes   | Document ID to remove |

#### Response Body

| Field              | Type                 | Description        |
| ------------------ | -------------------- | ------------------ |
| `success`          | `boolean`            | Operation status   |
| `message`          | `string`             | Status message     |
| `data.id`          | `string` (UUID)      | Library entry ID   |
| `data.user_id`     | `string` (UUID)      | User ID            |
| `data.document_id` | `string` (UUID)      | Document ID        |
| `data.created_at`  | `string` (timestamp) | Creation timestamp |

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
| `full_name`  | `string`                | ❌ No (default "") | User's full name                  |
| `dept_id`    | `string \| null` (UUID) | ❌ No              | Foreign key to departments        |
| `created_at` | `string` (timestamp)    | ❌ Auto-generated  | Creation timestamp                |

---

### Library Table

Junction table for user's saved documents (personal collections).

| Column        | Type                 | Required on Insert | Description                     |
| ------------- | -------------------- | ------------------ | ------------------------------- |
| `id`          | `string` (UUID)      | ❌ Auto-generated  | Primary key                     |
| `user_id`     | `string` (UUID)      | ✅ Yes             | Foreign key to profiles         |
| `document_id` | `string` (UUID)      | ✅ Yes             | Foreign key to documents        |
| `created_at`  | `string` (timestamp) | ❌ Auto-generated  | Creation timestamp (when saved) |

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

All errors follow a consistent format.

#### Error Response Body

| Field     | Type      | Description               |
| --------- | --------- | ------------------------- |
| `success` | `boolean` | Always `false` for errors |
| `message` | `string`  | Error description         |

### Common HTTP Status Codes

| Status Code | Description                                              |
| ----------- | -------------------------------------------------------- |
| `400`       | Bad Request - Invalid input or missing required fields   |
| `401`       | Unauthorized - Missing or invalid authentication token   |
| `403`       | Forbidden - User doesn't have permission for this action |
| `404`       | Not Found - Resource doesn't exist                       |
| `500`       | Internal Server Error - Server-side error                |

---

## API Routes Summary

| Method   | Endpoint               | Description                  | Auth Required |
| -------- | ---------------------- | ---------------------------- | ------------- |
| `POST`   | `/auth/register`       | Register new user            | ❌            |
| `DELETE` | `/auth/:id`            | Delete user                  | ❌            |
| `GET`    | `/profiles/:id`        | Get user profile             | ✅            |
| `PATCH`  | `/profiles/:id`        | Update user profile          | ✅            |
| `GET`    | `/courses`             | Get all courses              | ❌            |
| `GET`    | `/courses/:courseId`   | Get course by ID             | ❌            |
| `POST`   | `/courses`             | Create course                | ❌            |
| `PATCH`  | `/courses/:courseId`   | Update course                | ❌            |
| `DELETE` | `/courses/:courseId`   | Delete course                | ❌            |
| `POST`   | `/courses/providedBy`  | Assign course to department  | ❌            |
| `GET`    | `/departments`         | Get all departments          | ❌            |
| `GET`    | `/departments/:deptId` | Get department by ID         | ❌            |
| `POST`   | `/departments`         | Create department            | ❌            |
| `PATCH`  | `/departments/:deptId` | Update department            | ❌            |
| `DELETE` | `/departments/:deptId` | Delete department            | ❌            |
| `POST`   | `/documents`           | Upload document (PDF)        | ✅            |
| `GET`    | `/documents/:id`       | Get document by ID           | ✅            |
| `PATCH`  | `/documents/:id`       | Update document              | ✅            |
| `DELETE` | `/documents/:id`       | Delete document              | ✅            |
| `GET`    | `/library`             | Get user's library           | ✅            |
| `POST`   | `/library`             | Add document to library      | ✅            |
| `DELETE` | `/library/:docId`      | Remove document from library | ✅            |

---

_Generated on: January 28, 2026_
