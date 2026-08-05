# ARCHITECTURE.md — Feedne Frontend

## Project Overview

**Feedne** is a creator-focused social media platform where users share photos, videos, and stories.  
The frontend is built with **React 19 + Vite + Tailwind CSS + Zustand**, designed to connect seamlessly to an **Express.js / MongoDB / JWT / Socket.IO** backend without any structural refactoring.

---

## Main Modules

| Module | Purpose |
|---|---|
| `features/` | Self-contained feature areas (feed, explore, post, chat, etc.) |
| `components/` | Shared, feature-agnostic UI primitives and composites |
| `layouts/` | Page shell components (Sidebar, Topbar, MainLayout) |
| `pages/` | Route-level thin wrappers composing layouts + features |
| `store/` | Zustand global state slices |
| `services/` | API call abstractions (swap mock → real HTTP when backend is ready) |
| `data/` | Mock data (delete when backend is connected) |
| `lib/` | Pure utility functions |
| `hooks/` | Reusable React hooks |
| `constants/` | App-wide constants (routes, config, query keys) |
| `types/` | JSDoc type definitions serving as API contracts |

---

## Folder Structure Explained

```
src/
├── assets/          Static assets (images, svgs). Import, don't copy-paste URLs.
├── components/
│   ├── ui/          Primitive building blocks: Avatar, Button, Badge, Input, Modal, Spinner, Toggle.
│   │                These have NO knowledge of the app domain.
│   └── shared/      Composite components reused across features: UserCard, SearchInput, EmptyState.
│                    These may use domain types but hold no business logic.
├── features/        The core of the application. Each feature is a vertical slice:
│   ├── auth/        Login + signup forms and auth hook
│   ├── feed/        StoriesRow, PostCard, PostEngagement
│   ├── explore/     ExploreGrid, ExploreGridItem, CategoryTabs
│   ├── post/        CreatePostModal (and future post detail modal)
│   ├── trending/    TrendingCreatorCard, CreatorHubCTA
│   ├── profile/     ProfileHeader, ProfilePostGrid
│   ├── chat/        ChatList, ChatWindow, MessageBubble
│   └── notifications/ NotificationItem, NotificationList
├── layouts/         Page shells — Sidebar, Topbar, MainLayout, AuthLayout, RightPanel.
│                    Layouts do NOT fetch data; they only compose other components.
├── pages/           One file per route. Thin orchestrators only.
│                    Pages = Layout + Feature components. Zero business logic here.
├── routes/          React Router config, ProtectedRoute, path constants.
├── store/           Zustand slices: auth, ui, post, notification, chat.
├── services/        One file per domain. API call functions only. No React here.
├── data/            Mock data arrays. Delete these when real APIs are connected.
├── hooks/           Generic hooks (useDebounce, useIntersectionObserver, useWindowSize).
├── lib/             Pure JS utils (cn, formatCount, timeAgo, etc.).
├── constants/       routes.js, config.js, queryKeys.js.
└── types/           JSDoc @typedef files acting as interface contracts between UI and API.
```

---

## Component Guidelines

### When to create a UI component (`components/ui/`)
- It has no knowledge of users, posts, or any domain entity
- It can be reused in any app (Avatar, Button, Modal, Toggle)
- It accepts generic props only (variant, size, children)

### When to create a shared component (`components/shared/`)
- It is used in 2+ different features
- It knows about domain types but holds no business logic
- Examples: UserCard, SearchInput, EmptyState

### When to create a feature component (`features/*/components/`)
- It belongs to a specific feature and wouldn't exist outside of it
- It may read from the store or call services via hooks
- Examples: PostCard, CreatePostModal, ChatWindow

### When to create a page (`pages/`)
- It corresponds 1:1 to a route
- It only composes layouts and feature components
- It should rarely exceed 60 lines

### Naming Conventions
- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Services: `camelCaseService.js`
- Stores: `camelCaseStore.js`
- Constants: `UPPER_SNAKE_CASE` for values, `camelCase.js` for files

---

## State Management

### Global State (Zustand) — `store/`
Use for state that must be shared across multiple routes or components:
- `authStore` — current user, token, isAuthenticated
- `uiStore` — theme, sidebar open, active modal
- `postStore` — feed/explore posts, optimistic like/bookmark
- `notificationStore` — notifications, unread count
- `chatStore` — conversations, messages, Socket.IO state

### Local State (useState)
Use for state that belongs to a single component:
- Form field values, toggle states inside a modal
- Hover state, animation triggers
- One-off UI interactions

### Server State
Currently handled via Zustand fetch actions + mock services.  
When backend is live, consider adding **TanStack Query (React Query)** for caching, refetching, and pagination.  
Add it without removing Zustand — they serve different purposes.

---

## API Layer

### Where API calls SHOULD be made
- **Service files only** (`services/*.js`)
- **Zustand store actions** (which call service functions)
- **Custom hooks** that wrap store actions (e.g., `useFeed.js`)

### Where API calls should NEVER be made
- Inside JSX / render functions
- Inside `components/ui/` primitives
- Inside `layouts/` (Sidebar, Topbar)
- Directly inside page components

---

## Future Backend Integration

### Authentication (JWT)
1. Replace mock returns in `authService.js` with `api.post('/auth/login')` etc.
2. The Axios interceptor in `api.js` already attaches the token automatically.
3. The `ProtectedRoute` already reads `isAuthenticated` from `authStore`.

### Posts & Comments
1. Replace mock returns in `postService.js` with real Axios calls.
2. Zustand store actions (`fetchFeed`, `toggleLike`, etc.) call service functions — no component changes needed.

### Real-time Chat (Socket.IO)
1. Create `src/lib/socket.js`:
   ```js
   import { io } from 'socket.io-client';
   import { CONFIG } from '@/constants/config';
   export const socket = io(CONFIG.SOCKET_URL, { autoConnect: false });
   ```
2. Uncomment Socket.IO lines in `chatService.js`.
3. Call `chatService.connect()` in `authStore.login()`.
4. Call `chatStore.receiveMessage()` inside the `'new_message'` Socket.IO listener.

### Notifications (Socket.IO)
1. Listen to `'new_notification'` event.
2. Call `notificationStore.addNotification(notification)` — already implemented.

---

## Development Rules

1. **No API calls in components.** Always go through a service file.
2. **No business logic in pages.** Pages only compose layouts and features.
3. **No domain knowledge in `components/ui/`.** These must stay generic.
4. **All files under 300 lines.** Split into smaller modules when approaching the limit.
5. **Optimistic updates in stores.** Update UI immediately; revert on API error.
6. **Dark mode via CSS class.** Always use `dark:` Tailwind variants, never inline style.
7. **Import paths via `@/`.** Never use relative `../../` paths beyond 1 level.
8. **Mock data in `data/`.** Never hardcode lists inside components.
9. **Constants in `constants/`.** Never hardcode route strings, API URLs, or config in components.
10. **Types in `types/`.** Document every data shape with JSDoc even in JavaScript.
