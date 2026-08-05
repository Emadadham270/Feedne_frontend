/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {import('./user.types').User} participant
 * @property {Message} lastMessage
 * @property {number} unreadCount
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} senderId
 * @property {string} [text]
 * @property {string} [imageUrl]
 * @property {'sent'|'delivered'|'read'} status
 * @property {string} createdAt
 */
