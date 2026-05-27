# Nexora LMS

A modern React Native Learning Management System (LMS) mobile application built using Expo, TypeScript, and NativeWind. Nexora LMS provides a scalable and offline-capable learning experience where users can discover courses, enroll in learning paths, bookmark content, track progress, receive notifications, and continue learning seamlessly across sessions.

The application was developed with a production-oriented architecture focusing on performance optimization, modular scalability, persistent offline storage, and maintainable code organization.

---

# Features

## Authentication
- User Registration
- User Login
- Persistent User Session
- Secure Token Storage
- Form Validation
- Toast Feedback Messages
- Logout Functionality

## Course Discovery
- Browse Featured Courses
- Search Courses by Title
- Category-Based Filtering
- Responsive Course Cards
- Pull-To-Refresh Support
- Optimized Course Rendering

## Learning Experience
- Course Enrollment
- Continue Learning
- Progress Tracking
- Lesson Completion Tracking
- Persistent Learning State
- Embedded Learning Content Viewer

## Bookmarks
- Add/Remove Bookmarks
- Persistent Bookmark Storage
- Dedicated Bookmarks Screen
- Bookmark State Synchronization

## Notifications
- Local Push Notifications
- Notification Badge Counter
- Notification Center Screen
- Bookmark Achievement Notifications
- Inactivity Reminder Notifications

## Profile & Statistics
- User Statistics Dashboard
- Enrolled Courses Overview
- Overall Progress Tracking
- User Preferences
- Learning Insights

## WebView Integration
- Embedded Course Content Viewer
- Native to WebView Communication
- Custom Header Injection
- Local HTML Content Rendering
- WebView Error Handling

## Additional Features
- Dark Mode Support
- Offline Functionality
- Offline Banner Detection
- Retry Mechanism for Failed Requests
- Skeleton Loaders
- Empty States
- Reusable Components
- Modular Architecture
- Memoized Rendering
- Persistent Local Storage

---

# Tech Stack

## Core Technologies
- React Native
- Expo SDK
- TypeScript
- Expo Router
- NativeWind / TailwindCSS

## State & Storage
- React Context API
- AsyncStorage
- Expo SecureStore

## Native Features
- Expo Notifications
- Expo Network
- React Native WebView

## Development Utilities
- Axios
- Custom Retry Mechanism
- Responsive Layout Hooks

---

# API Integration

Base API:
https://api.freeapi.app/ :contentReference[oaicite:0]{index=0}

The following APIs were adapted to simulate LMS functionality within the application.

## Authentication APIs
- `/api/v1/users/login`
- `/api/v1/users/register`

Used for:
- User authentication
- Session management
- Secure token persistence

## Instructor Data API
- `/api/v1/public/randomusers`

Used for:
- Instructor profile data
- Instructor names
- Instructor avatars

## Course Data API
- `/api/v1/public/randomproducts`

Used for:
- Course listings
- Course thumbnails
- Course descriptions
- Course metadata simulation

## API Features Implemented
- Centralized API architecture
- Axios API client abstraction
- Request timeout handling
- Retry mechanism for failed requests
- Network state detection
- Offline fallback handling
- Error-safe API responses

---


# Setup Instructions

## Clone Repository

```bash
git clone https://github.com/Sreeaiswar/mini-lms.git
```

## Navigate Into Project

```bash
cd mini-lms
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npx expo start
```

## Run Android

```bash
npx expo run:android
```

## Run iOS

```bash
npx expo run:ios
```

---

# Environment Variables

No environment variables are required for this project.

The application uses publicly accessible APIs provided for assignment purposes.

---

# Architectural Decisions

## Expo Router
Expo Router was used for scalable file-based routing and structured navigation management.

## Modular Architecture
The application follows a modular structure separating:
- API layer
- Services
- Hooks
- Store management
- Reusable UI components
- Constants and themes

This improves maintainability, scalability, and readability.

## Context-Based State Management
React Context API was chosen to provide lightweight and maintainable global state management without introducing unnecessary complexity.

## Persistent Offline Storage
The application uses:
- Expo SecureStore for sensitive authentication data
- AsyncStorage for persistent app data

This allows the application to maintain critical user functionality offline.

## Reusable Component System
Reusable components were created to:
- Reduce code duplication
- Improve UI consistency
- Simplify scalability
- Improve maintainability

## Theme Architecture
A centralized theme configuration supports:
- Light Mode
- Dark Mode
- Shared color tokens
- Consistent typography and spacing

---

# Security & Storage

## Expo SecureStore
Used for securely storing:
- Authentication tokens
- User session information

## AsyncStorage
Used for storing:
- Bookmarks
- Learning progress
- Preferences
- Notifications
- Enrolled courses
- Offline state

## Offline-First Approach
Critical user data is persisted locally to ensure uninterrupted learning even during network interruptions.

---

# Offline Functionality

The application supports offline persistence using AsyncStorage.

The following data remains accessible offline:
- User session
- Bookmarks
- Enrolled courses
- Learning progress
- Notifications
- User preferences

Additional offline capabilities include:
- Offline banner detection
- Retry handling after reconnection
- Cached persistent user state

---

# Performance Optimizations

- Optimized FlatList rendering
- Memoized reusable components
- Lightweight state management
- Modular service architecture
- Reusable hooks
- Centralized constants and themes
- Cached local persistence
- Pull-to-refresh optimization
- Proper list key extraction
- Reduced unnecessary re-renders

---

# Native Features Implemented

## Notifications
- Local push notifications
- Bookmark milestone notifications
- Inactivity reminder notifications

## Network Monitoring
- Real-time offline/online detection
- Offline state banner handling
- Retry mechanism integration

## WebView
- Embedded course content viewer
- Native communication support
- Error handling support

---

# Known Limitations

- Backend infrastructure is not implemented
- Authentication flow is partially simulated
- APIs are adapted for LMS simulation purposes
- Notifications are local notifications only
- Course content is currently mock/static content
- No real-time synchronization
- No video streaming support
- No cloud-based persistence

---


# APK Build Instructions

## Install EAS CLI

```bash
npm install -g eas-cli
```

## Login to Expo

```bash
eas login
```

## Generate Development APK

```bash
eas build -p android --profile preview
```

---

# Build Configuration

The project uses Expo Application Services (EAS) for generating Android development builds.

Configured build profiles:
- preview
- development

---

# Future Improvements

- Backend Integration
- Real Authentication System
- Cloud Synchronization
- Video Streaming Support
- Downloadable Courses
- AI-Based Course Recommendations
- Instructor Dashboard
- Real-Time Notifications
- Analytics Integration
- Unit & Integration Testing
- CI/CD Automation
- Advanced Offline Syncing

---

