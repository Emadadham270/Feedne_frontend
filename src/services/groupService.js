import api from './api';

/**
 * groupService — REST API calls for groups functionality.
 */
export const groupService = {
  /** GET /api/groups — list groups with filter ('all'|'my'|'public') */
  async getGroups({ filter = 'all', page = 1, limit = 20 } = {}) {
    const response = await api.get('/groups', { params: { filter, page, limit } });
    return response.data; // { data: Group[], meta }
  },

  /** GET /api/groups/:groupId */
  async getGroupById(groupId) {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  /** POST /api/groups — create group (multipart/form-data) */
  async createGroup(formData) {
    const response = await api.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** PATCH /api/groups/:groupId — update group */
  async updateGroup(groupId, formData) {
    const response = await api.patch(`/groups/${groupId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** DELETE /api/groups/:groupId */
  async deleteGroup(groupId) {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },

  /** POST /api/groups/:groupId/join */
  async joinGroup(groupId) {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  /** DELETE /api/groups/:groupId/leave */
  async leaveGroup(groupId) {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data;
  },

  /** GET /api/groups/:groupId/members */
  async getGroupMembers(groupId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/groups/${groupId}/members`, { params: { page, limit } });
    return response.data; // { data: Member[], meta }
  },

  /** POST /api/groups/:groupId/invites */
  async generateInviteCode(groupId, expiresInHours = 24) {
    const response = await api.post(`/groups/${groupId}/invites`, { expiresInHours });
    return response.data; // { code, inviteUrl, expiresAt }
  },

  /** POST /api/groups/join/:inviteCode */
  async joinByInviteCode(inviteCode) {
    const response = await api.post(`/groups/join/${inviteCode}`);
    return response.data;
  },

  /** GET /api/groups/:groupId/posts */
  async getGroupPosts(groupId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/groups/${groupId}/posts`, { params: { page, limit } });
    return response.data; // { data: Post[], meta }
  },

  /** POST /api/groups/:groupId/posts — create post inside group */
  async createGroupPost(groupId, formData) {
    const response = await api.post(`/groups/${groupId}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** PATCH /api/groups/:groupId/members/:userId/role */
  async updateMemberRole(groupId, userId, role) {
    const response = await api.patch(`/groups/${groupId}/members/${userId}/role`, { role });
    return response.data;
  },

  /** DELETE /api/groups/:groupId/members/:userId */
  async removeMember(groupId, userId) {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },
};
