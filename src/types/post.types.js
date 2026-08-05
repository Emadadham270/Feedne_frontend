/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {import('./user.types').User} author
 * @property {string} [caption]
 * @property {string} [location]
 * @property {MediaItem[]} media
 * @property {string[]} tags          - hashtags
 * @property {string[]} taggedUsers   - user IDs
 * @property {number} likesCount
 * @property {number} commentsCount
 * @property {boolean} isLiked        - relative to current user
 * @property {boolean} isBookmarked
 * @property {boolean} isNew
 * @property {'trending'|'new'|null} badge
 * @property {'For You'|'Trending'|'Music'|'Art'|'Fashion'|'Travel'} category
 * @property {PostSettings} settings
 * @property {string} createdAt
 */

/**
 * @typedef {Object} MediaItem
 * @property {string} url
 * @property {'image'|'video'} type
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} PostSettings
 * @property {boolean} commentsOff
 * @property {boolean} hideLikeCount
 * @property {boolean} shareToTwitter
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {import('./user.types').User} author
 * @property {string} text
 * @property {number} likesCount
 * @property {boolean} isLiked
 * @property {Comment[]} [replies]
 * @property {string} createdAt
 */
