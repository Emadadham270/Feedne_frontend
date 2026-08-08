/**
 * userMapper.js
 *
 * Converts the backend Prisma user shape into the shape expected
 * by all frontend components.
 *
 * Backend shape:
 *   { id, username, email?, profile: { imgUrl, backImgUrl, bio }, settings, _count: { followers, following, posts } }
 *
 * Frontend shape expected by components:
 *   { id, username, displayName, handle, avatar, coverImage, bio,
 *     followersCount, followingCount, postsCount, isPrivate, isFollowing }
 */
export const mapUser = (user) => {
  if (!user) return null;
  return {
    id:             user.id,
    username:       user.username,
    email:          user.email,
    // Components use displayName for the friendly display name
    displayName:    user.username,
    // Components use handle for the @username line
    handle:         `@${user.username}`,
    // Avatar URL from nested profile
    avatar:         user.profile?.imgUrl ?? null,
    // Cover / banner image
    coverImage:     user.profile?.backImgUrl ?? null,
    bio:            user.profile?.bio ?? null,
    // Flat count fields
    followersCount: user._count?.followers ?? 0,
    followingCount: user._count?.following ?? 0,
    postsCount:     user._count?.posts ?? 0,
    // Privacy
    isPrivate:      user.settings?.isPrivateAccount ?? user.isPrivate ?? false,
    // Verification
    isVerified:     user.isVerified ?? false,
    // Social state — set by the caller when known
    isFollowing:    user.isFollowing ?? false,
    hasStory:       user.hasStory ?? false,
  };
};

/**
 * Maps an array of users, skipping nulls.
 */
export const mapUsers = (users) =>
  Array.isArray(users) ? users.map(mapUser).filter(Boolean) : [];
