# Adept AI Backend API Documentation

### **Base URL**

All routes are prefixed with their respective resource path defined in `app.ts` (e.g., `/auth`, `/documents`, etc.).

---

### **1. Authentication**

**Base Path:** `/auth`
_Note: Login is handled directly by Supabase on the frontend._

#### **Register User**

- **Endpoint:** `POST /auth/register`
- **Description:** Creates a new user in Supabase Auth and a corresponding profile in the database.
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "fullName": "John Doe",
    "deptId": "uuid-of-department"
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "message": "Registration successful"
  }
  ```

#### **Delete User**

- **Endpoint:** `DELETE /auth/:id`
- **Description:** Deletes a user from Supabase Auth.
- **Params:** `id` (User UUID)
- **Returns:**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

---

### **2. Profiles**

**Base Path:** `/profiles`

#### **Get Profile**

- **Endpoint:** `GET /profiles/:id`
- **Headers:** `Authorization` (Bearer Token)
- **Description:** Fetches a user's profile. You can only access your own profile.
- **Params:** `id` (User UUID)
- **Returns:**
  ```json
  {
    "success": true,
    "data": { "user_id": "...", "full_name": "...", "dept_id": "..." },
    "message": "Profile fetched successfully"
  }
  ```

#### **Update Profile**

- **Endpoint:** `PATCH /profiles/:id`
- **Headers:** `Authorization` (Bearer Token)
- **Description:** Updates profile information.
- **Params:** `id` (User UUID)
- **Body:** (At least one required)
  ```json
  {
    "fullName": "New Name",
    "deptId": "new-dept-uuid"
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "data": { ...updatedProfile },
    "message": "Profile updated successfully"
  }
  ```

---

### **3. Documents**

**Base Path:** `/documents`

#### **Upload Document**

- **Endpoint:** `POST /documents`
- **Headers:** `Authorization` (Bearer Token), `Content-Type: multipart/form-data`
- **Body:**
  - `document`: File object (Required)
  - `title`: string (Optional, defaults to filename)
  - `unit`: number (Optional)
  - `courseId`: string (Optional)
- **Returns:**
  ```json
  {
    "success": true,
    "message": "Uploaded document successfully",
    "data": { "id": "...", "title": "..." }
  }
  ```

#### **Get Document**

- **Endpoint:** `GET /documents/:id`
- **Headers:** `Authorization` (Bearer Token)
- **Params:** `id` (Document UUID)
- **Returns:** Content of the document (logic depends on `getDocument` implementation details, usually metadata or file link).

#### **Update Document**

- **Endpoint:** `PATCH /documents/:id`
- **Headers:** `Authorization` (Bearer Token)
- **Body:** (At least one required)
  ```json
  {
    "title": "New Title",
    "unit": 2,
    "courseId": "new-course-uuid"
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "data": { ...updatedDoc },
    "message": "Updated document successfully"
  }
  ```

#### **Delete Document**

- **Endpoint:** `DELETE /documents/:id`
- **Headers:** `Authorization` (Bearer Token)
- **Description:** Deletes document record from DB and file from S3.
- **Params:** `id` (Document UUID)
- **Returns:**
  ```json
  {
    "status": true,
    "message": "Document deleted successfully"
  }
  ```

---

### **4. Courses**

**Base Path:** `/courses`

#### **Get All Courses**

- **Endpoint:** `GET /courses`
- **Returns:** List of all courses.

#### **Get Course by ID**

- **Endpoint:** `GET /courses/:courseId`
- **Params:** `courseId` (Course UUID)
- **Returns:** Single course object.

#### **Create Course**

- **Endpoint:** `POST /courses`
- **Body:**
  ```json
  {
    "name": "Introduction to AI",
    "code": "CS101"
  }
  ```
- **Returns:** Created course object.

#### **Update Course**

- **Endpoint:** `PATCH /courses/:courseId`
- **Body:**
  ```json
  {
    "name": "New Name",
    "code": "New Code"
  }
  ```
- **Returns:** Updated course object.

#### **Delete Course**

- **Endpoint:** `DELETE /courses/:courseId`
- **Returns:** Success message.

#### **Assign Course to Department**

- **Endpoint:** `POST /courses/providedBy`
- **Body:**
  ```json
  {
    "courseId": "uuid-course",
    "departmentId": "uuid-dept"
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "message": "Course assigned to department successfully"
  }
  ```

---

### **5. Departments**

**Base Path:** `/departments`

#### **Get All Departments**

- **Endpoint:** `GET /departments`
- **Returns:** List of all departments.

#### **Get Department by ID**

- **Endpoint:** `GET /departments/:deptId`
- **Params:** `deptId` (Department UUID)
- **Returns:** Single department object.

#### **Create Department**

- **Endpoint:** `POST /departments`
- **Body:**
  ```json
  {
    "name": "Computer Science",
    "abbreviation": "CS"
  }
  ```
- **Returns:** Created department object.

#### **Update Department**

- **Endpoint:** `PATCH /departments/:deptId`
- **Body:**
  ```json
  {
    "name": "New Name",
    "abbreviation": "New Abbr"
  }
  ```
- **Returns:** Updated department object.

#### **Delete Department**

- **Endpoint:** `DELETE /departments/:deptId`
- **Returns:** Success message.

---

### **6. Library**

**Base Path:** `/libraries`

#### **Get My Library**

- **Endpoint:** `GET /libraries`
- **Headers:** `Authorization` (Bearer Token)
- **Description:** Fetches all documents saved by the current user. Validates specific user ownership.
- **Returns:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "library-entry-id",
        "saved_at": "timestamp",
        "title": "Document Title",
        "course_code": "CS101",
        ...
      }
    ],
    "message": "Library fetched successfully"
  }
  ```

#### **Add to Library**

- **Endpoint:** `POST /libraries`
- **Headers:** `Authorization` (Bearer Token)
- **Body:**
  ```json
  {
    "documentId": "uuid-document"
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "message": "Document added to library successfully"
  }
  ```

#### **Remove from Library**

- **Endpoint:** `DELETE /libraries/:docId`
- **Headers:** `Authorization` (Bearer Token)
- **Params:** `docId` (Start Document UUID, _not_ the library entry ID)
- **Returns:**
  ```json
  {
    "success": true,
    "message": "Document removed from library successfully"
  }
  ```
