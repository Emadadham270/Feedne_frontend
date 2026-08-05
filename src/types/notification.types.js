/**
 * @typedef {'like'|'comment'|'follow'|'mention'|'tag'|'trending'} NotificationType
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {NotificationType} type
 * @property {import('./user.types').User} actor   - user who triggered the notification
 * @property {string} [postId]
 * @property {string} message
 * @property {boolean} isRead
 * @property {string} createdAt
 */
