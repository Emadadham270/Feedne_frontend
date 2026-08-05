/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} displayName
 * @property {string} handle        - e.g. "@alexrivers"
 * @property {string} avatar        - URL
 * @property {string} [coverImage]  - URL
 * @property {string} bio
 * @property {string} [website]
 * @property {string} [location]
 * @property {number} followersCount
 * @property {number} followingCount
 * @property {number} postsCount
 * @property {boolean} isVerified
 * @property {boolean} isFollowing   - relative to the current user
 * @property {boolean} hasStory
 * @property {'creator'|'user'} role
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 */
