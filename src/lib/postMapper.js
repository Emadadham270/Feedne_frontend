import { mapUser } from './userMapper';

/**
 * postMapper.js
 *
 * Converts the backend Prisma post shape into the shape expected
 * by PostCard and other frontend components.
 *
 * Backend POST_INCLUDE shape:
 *   {
 *     id, caption, mediaUrl, mediaPublicId, numOfShares, createdAt,
 *     authorId,
 *     author: { id, username, profile: { imgUrl } },
 *     sharedFrom: { id, caption, mediaUrl, createdAt, author, group },
 *     _count: { reactions, comments, shares },
 *     reactions: [{ userId, type }],
 *   }
 */
export const mapPost = (post, currentUserId = null) => {
  if (!post) return null;

  const author = post.author
    ? {
        id:          post.author.id,
        username:    post.author.username,
        displayName: post.author.username,
        handle:      `@${post.author.username}`,
        avatar:      post.author.profile?.imgUrl ?? null,
      }
    : null;

  const reactions = Array.isArray(post.reactions) ? post.reactions : [];
  const isLiked   = currentUserId
    ? reactions.some((r) => r.userId === currentUserId)
    : false;

  const myReaction = currentUserId
    ? reactions.find((r) => r.userId === currentUserId)?.type ?? null
    : null;

  return {
    id:           post.id,
    caption:      post.caption ?? '',
    content:      post.caption ?? '',   // alias used by some components
    mediaUrl:     post.mediaUrl || null,
    numOfShares:  post.numOfShares ?? 0,
    createdAt:    post.createdAt,
    groupId:      post.groupId ?? null,
    author,
    sharedFrom:   post.sharedFrom ?? null,
    reactions,
    _count: {
      reactions: post._count?.reactions ?? reactions.length,
      comments:  post._count?.comments  ?? 0,
      shares:    post._count?.shares    ?? 0,
    },
    // Convenience flat fields
    isLiked,
    myReaction,
    isBookmarked: post.isBookmarked ?? false,
  };
};

export const mapPosts = (posts, currentUserId = null) =>
  Array.isArray(posts) ? posts.map((p) => mapPost(p, currentUserId)).filter(Boolean) : [];
