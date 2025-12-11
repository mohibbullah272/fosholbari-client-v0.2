# FosholBari Frontend

![FosholBari Logo](https://via.placeholder.com/150?text=FosholBari) <!-- Replace with actual logo URL if available -->

**FosholBari** is an innovative agricultural investment platform designed to connect investors with secure farming projects. Built with modern web technologies, it enables users to invest safely in agricultural ventures and earn profits upon project completion.

## Project Description

ফসল বাড়ি একটি কৃষি বিনিয়োগ প্ল্যাটফর্ম, যেখানে আপনি নিরাপদভাবে কৃষি প্রকল্পে বিনিয়োগ করতে পারেন এবং নির্দিষ্ট সময় শেষে লাভ অর্জন করতে পারেন।

(Translation: Foshol Bari is an agricultural investment platform where you can safely invest in agricultural projects and earn profits at the end of a specific time.)

This repository contains the **frontend** part of the project, focusing on user interfaces for admins and investors. It features role-based access, real-time interactions, and AI-powered support.

## Technologies Used

- **Framework**: Next.js (React-based)
- **Language**: TypeScript
- **Authentication**: NextAuth
- **UI Components**: Shadcn
- **Styling**: Tailwind CSS
- **Real-time Features**: Socket.io (for chatting and notifications)
- **Other**: React for core UI, PDF generation for certificates, AI chatbot integration

## Features

FosholBari supports two primary user roles: **Admin** and **Investor**. Below is a breakdown of key features for each role.

### Admin Features
Admins have comprehensive control over platform management, including projects, users, and interactions.

- **Project Management**:
  - Create, edit, and delete projects.
  - Update project progress and status.

- **User Management**:
  - Manage user accounts and payments.
  - Approve payments and KYC requests.

- **Payment Methods**:
  - Add new payment methods.
  - Update existing payment methods.

- **Notifications**:
  - Create, read, and manage notifications for users.

- **Chat and Support**:
  - Respond to user chats in real-time (via Socket.io).

- **Comments Management**:
  - Moderate and manage comments on projects.

- **Data Handling**:
  - Search, sorting, and pagination on most tables (e.g., users, projects, payments).

### Investor Features
Investors can explore opportunities, invest securely, and track their progress.

- **Project Exploration**:
  - View latest projects.
  - Filter, sort, and search projects from the `/projects` page.
  - Comment on individual projects.

- **Investment and Payments**:
  - Invest in specific projects.
  - Make payments using preferred website methods.
  - Manage personal payments.
  - Download payment receipts and investment certificates as PDFs.

- **Progress Tracking**:
  - View project progress for invested projects.

- **Notifications and Chat**:
  - Receive notifications from admins.
  - Engage in real-time chat with admins (via Socket.io) for support.

- **Profile Management**:
  - Update and manage personal profile details.

### Additional Platform Features
- **AI Chatbot**: A simple AI-powered chatbot for 24/7 user support.
- **Real-time System**: Socket.io implementation for live chatting, notifications, and support interactions.

## Role-Based Access Overview

| Role      | Key Responsibilities | Core Tools/Features                  |
|-----------|----------------------|--------------------------------------|
| **Admin** | Platform oversight and management | Project updates, payment approvals, KYC verification, notifications, chat responses, comments moderation, search/sorting/pagination |
| **Investor** | Investment and tracking | Project browsing, investing, payments, PDF downloads, progress viewing, notifications, real-time chat, profile management |

## Installation

1. **Clone the Repository**:
   ```
   git clone https://github.com/mohibullah247/fosholbari_v2.0.git
   cd fosholbari-frontend
   ```

2. **Install Dependencies**:
   ```
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**:
   - Create a `.env.local` file in the root directory.
   - Add necessary environment variables (e.g., NextAuth secrets, API endpoints, Socket.io URL).

4. **Run the Development Server**:
   ```
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Admin Dashboard**: Access via `/admin` after logging in with admin credentials.
- **Investor Portal**: Default user routes like `/projects`, `/profile`, `/investments`.
- **Real-time Chat**: Integrated in support sections; requires backend Socket.io server.
- **AI Chatbot**: Available on the support page for instant queries.

For production builds:
```
npm run build
npm run start
```

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.



*Built with ❤️ for sustainable agriculture investments.*