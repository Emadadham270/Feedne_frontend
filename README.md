# Feedne Frontend

This is the frontend application for Feedne. The platform's core philosophy is to encourage users to share actionable insights and detail how others can benefit from their experiments and experiences, acting as an alternative to the self-promotional nature of traditional professional networks.

## Core Technologies

*   **Framework**: React 19 (via Vite)
*   **Styling**: TailwindCSS
*   **State Management**: Zustand
*   **Routing**: React Router DOM
*   **Icons & UI Primitives**: Lucide React, Radix UI
*   **Data Visualization**: Recharts (for Admin dashboards)
*   **Real-time Services**: Socket.IO-client (Chat) and Server-Sent Events (Notifications)
*   **Communications**: Daily.co & ZegoCloud (Video and Voice calls)

## Key Functionality & Features

### Core Social Mechanics
*   **Feed & Posts**: Users can view a global or personalized feed, create rich-text posts, attach media, and interact via reactions and nested comments.
*   **Trending**: A dedicated section that ranks posts based on engagement velocity rather than static follower counts.
*   **Stories**: Users can post temporary updates that disappear after 24 hours. 

### User Interaction & Privacy
*   **Profile Management**: Users can edit bios, upload avatars, and view their post history.
*   **Account Privacy**: Accounts can be toggled to "Private", which requires manual approval of follow requests. The UI interactively manages "Follow", "Requested", and "Following" states.
*   **Blocking**: Users can block others, preventing any interaction or visibility between the two accounts.

### Communities
*   **Groups**: Users can create public or private groups, generate invite links, and assign admin roles. Group posts and discussions remain isolated from the global feed.

### Real-Time Features
*   **Live Notifications**: Utilizes Server-Sent Events (SSE) to push instant toast notifications and update badge counts without page refreshes.
*   **Direct Messaging**: Integrated real-time chat interface using Socket.IO.
*   **Video/Voice Calls**: Interactive call overlays and modals utilizing WebRTC-based providers.

### Security & UX
*   **Strong Password Enforcement**: Interactive, real-time UI component that validates passwords against length, casing, numerical, and special character requirements.
*   **OTP Verification**: Multi-step forms for verifying emails and resetting passwords via One Time Passwords.
*   **Responsive Layout**: Features a persistent desktop sidebar and a slide-out overlay drawer for mobile devices.
*   **Dark Mode**: Native support for light and dark themes, persisted via local storage.

## Setup Instructions

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Configure environment variables. Create a `.env` file pointing to your backend:
    ```env
    VITE_API_URL="http://localhost:5000/api"
    # Add external provider keys (e.g., Daily.co)
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Build for Production

1.  Build the static assets:
    ```bash
    npm run build
    ```
    *The output will be generated in the `dist` directory.*
2.  Preview the production build locally:
    ```bash
    npm run preview
    ```
