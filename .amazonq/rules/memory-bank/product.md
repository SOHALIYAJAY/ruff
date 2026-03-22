# Product Overview

## Project Purpose
Civic Issue Reporting System (CivicTrack) is a full-stack web platform that enables citizens to report, track, and manage civic complaints (infrastructure issues, water supply, sanitation, etc.) to government departments. It bridges the gap between citizens and municipal authorities by providing a transparent, trackable complaint lifecycle.

## Key Features
- **Complaint Submission**: Citizens submit complaints with title, description, location (district/taluka), priority level, and optional image/video attachments
- **Complaint Tracking**: Citizens track complaint status by ID (Pending → In Progress → Resolved/Rejected)
- **Interactive Map**: Leaflet-based map showing complaint locations across Gujarat districts
- **Role-Based Dashboards**:
  - Civic User: personal complaint stats, monthly trends, activity feed
  - Department User: assigned complaints, officer workload, performance metrics
  - Admin: full system stats, user management, officer management, category management
- **Officer Management**: Admins create/assign officers to complaints; officers have KPI tracking
- **Category Management**: Complaint categories mapped to departments (Roads, Water, Sanitation, etc.)
- **Google OAuth Login**: Social login via Google in addition to email/password
- **JWT Authentication**: Secure token-based auth with refresh token support
- **Statistics & Analytics**: Monthly trends, SLA compliance, priority distribution, district-wise user maps

## Target Users
- **Citizens (Civic-User)**: Report and track personal civic complaints
- **Department Officers (Department-User)**: View and resolve assigned complaints
- **Administrators (Admin-User)**: Manage the entire system — users, officers, categories, complaints

## Use Cases
- A citizen reports a pothole with location and photo; tracks resolution progress
- A department officer views their assigned complaints and updates status
- An admin monitors SLA compliance, assigns officers, manages categories
- Public visitors view aggregate statistics and recent complaints on the homepage
