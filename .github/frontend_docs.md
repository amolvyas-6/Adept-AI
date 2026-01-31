# Adept AI Frontend Documentation

This document outlines the architecture, design requirements, and page structure for the Adept AI Learning Management System (LMS) frontend.

## **Tech Stack**

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (v4)
- **UI Components:** Shadcn UI
- **Routing:** React Router (v7)
- **Animations:** `tw-animate-css`
- **Icons:** Lucide React
- **Package Manager:** NPM

## **Design Philosophy**

- **Aesthetics:** Modern, clean, and highly stylized interface.
- **Interactions:** Smooth transitions and animations using `tw-animate-css` for entering/exiting elements and page transitions.
- **Layout:**
  - **Landing:** Minimalist, focused on conversion/intro.
  - **App:** Immersive experience with a persistent floating sidebar for navigation.

## **Page Structure & Routing**

### **1. Public Routes**

These pages are accessible without authentication.

#### **Home Page (`/`)**

- **Layout:** Standalone (No Sidebar/Navbar).
- **Components:**
  - **Header:** Minimal header with a "Sign In" button on the top right.
  - **Hero Section:** Introductory text and visuals about the LMS.
  - **Key Features:** Brief highlights.
- **Action:** Clicking "Sign In" redirects to the Auth page.

#### **Authentication Page (`/auth`)**

- **Layout:** Centered card/container on a stylized background.
- **Components:**
  - **Shadcn Tabs:** Toggle between **Sign In** and **Sign Up** forms.
  - **Sign In Form:** Email & Password.
  - **Sign Up Form:** Email, Password, Full Name, Department Selection.

---

### **2. Protected Routes (The App)**

These pages require user authentication. They share a common **Layout Wrapper**:

- **Floating Sidebar:** A sleek, collapsible or floating sidebar for navigation.
- **User Profile:** Located at the bottom of the sidebar (Avatar + Name), linking to the Profile page or showing a logout menu.

#### **Dashboard (`/dashboard`)**

- **Purpose:** Overview of the user's activity.
- **Content:** Recent activity, quick stats, or recommended courses/documents.

#### **Documents Browser (`/documents`)**

- **Purpose:** Browse the global collection of documents.
- **Features:**
  - **List/Grid View:** Display documents belonging to various courses and departments.
  - **Filtering:** Filter by Course, Department, or Search by title.
  - **Action:** "Add to Library" button for each document.

#### **My Library (`/library`)**

- **Purpose:** Personal collection of saved resources.
- **Content:** List of documents the user has explicitly added.
- **Action:** Open/View document, Remove from Library.

#### **User Profile (`/profile`)**

- **Purpose:** Manage account settings.
- **Content:**
  - Update Full Name.
  - Update Department.
  - View Account details.

## **Development Context**

- **Shadcn UI:** Reference `components.json` for configuration.
- **LLM Helper:** Use [Shadcn LLM Context](https://ui.shadcn.com/llms.txt) for component generation best practices.
- **Animations:** Utilize `animate-fade-in`, `animate-slide-in`, etc., from `tw-animate-css` to make the UI feel alive.
