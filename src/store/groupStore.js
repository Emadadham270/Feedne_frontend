import { create } from 'zustand';
import { groupService } from '@/services/groupService';
import { getErrorMessage } from '@/services/api';

export const useGroupStore = create((set, get) => ({
  groups: [],
  myGroups: [],
  isLoadingGroups: false,
  isSubmitting: false,
  error: null,

  // Floating Widget State
  isWidgetOpen: false,
  widgetTab: 'my', // 'my' | 'explore' | 'create' | 'viewGroup'

  // Active Selected Group
  activeGroup: null,
  activeGroupPosts: [],
  activeGroupMembers: [],
  isLoadingActiveGroup: false,

  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  openWidget: (tab = 'my') => set({ isWidgetOpen: true, widgetTab: tab }),
  closeWidget: () => set({ isWidgetOpen: false }),
  setWidgetTab: (tab) => set({ widgetTab: tab }),

  fetchGroups: async (filter = 'all') => {
    set({ isLoadingGroups: true, error: null });
    try {
      const res = await groupService.getGroups({ filter });
      const items = res.data || [];

      if (filter === 'my') {
        set({ myGroups: items, isLoadingGroups: false });
      } else {
        const mine = items.filter((g) => g.isMember);
        set({ groups: items, myGroups: mine, isLoadingGroups: false });
      }
    } catch (err) {
      set({ error: getErrorMessage(err), isLoadingGroups: false });
    }
  },

  selectGroup: async (groupOrId) => {
    const groupId = typeof groupOrId === 'string' ? groupOrId : groupOrId.id;
    set({ isLoadingActiveGroup: true, widgetTab: 'viewGroup' });
    try {
      const [details, postsRes, membersRes] = await Promise.all([
        groupService.getGroupById(groupId).catch(() => groupOrId),
        groupService.getGroupPosts(groupId).catch(() => ({ data: [] })),
        groupService.getGroupMembers(groupId).catch(() => ({ data: [] })),
      ]);

      set({
        activeGroup: details,
        activeGroupPosts: postsRes.data || [],
        activeGroupMembers: membersRes.data || [],
        isLoadingActiveGroup: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoadingActiveGroup: false });
    }
  },

  createGroup: async (formData) => {
    set({ isSubmitting: true, error: null });
    try {
      const newGroup = await groupService.createGroup(formData);
      set((state) => ({
        myGroups: [newGroup, ...state.myGroups],
        groups: [newGroup, ...state.groups],
        isSubmitting: false,
      }));
      await get().selectGroup(newGroup);
      return newGroup;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  joinGroup: async (groupId) => {
    try {
      await groupService.joinGroup(groupId);
      set((state) => {
        const update = (list) =>
          list.map((g) => (g.id === groupId ? { ...g, isMember: true, memberCount: (g.memberCount || 0) + 1 } : g));
        const updatedActive = state.activeGroup?.id === groupId
          ? { ...state.activeGroup, isMember: true, memberCount: (state.activeGroup.memberCount || 0) + 1 }
          : state.activeGroup;

        return {
          groups: update(state.groups),
          myGroups: update(state.myGroups),
          activeGroup: updatedActive,
        };
      });
      get().fetchGroups('all');
    } catch (err) {
      console.error('Join group failed:', err);
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await groupService.leaveGroup(groupId);
      set((state) => {
        const update = (list) =>
          list.map((g) => (g.id === groupId ? { ...g, isMember: false, memberCount: Math.max(0, (g.memberCount || 1) - 1) } : g));
        const updatedActive = state.activeGroup?.id === groupId
          ? { ...state.activeGroup, isMember: false, memberCount: Math.max(0, (state.activeGroup.memberCount || 1) - 1) }
          : state.activeGroup;

        return {
          groups: update(state.groups),
          myGroups: state.myGroups.filter((g) => g.id !== groupId),
          activeGroup: updatedActive,
        };
      });
      get().fetchGroups('all');
    } catch (err) {
      console.error('Leave group failed:', err);
    }
  },

  joinByInvite: async (code) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await groupService.joinByInviteCode(code);
      set({ isSubmitting: false });
      if (res.member?.groupId) {
        await get().selectGroup(res.member.groupId);
      }
      get().fetchGroups('all');
      return res;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  createGroupPost: async (groupId, formData) => {
    set({ isSubmitting: true, error: null });
    try {
      const newPost = await groupService.createGroupPost(groupId, formData);
      set((state) => ({
        activeGroupPosts: [newPost, ...state.activeGroupPosts],
        isSubmitting: false,
      }));
      return newPost;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateMemberRole: async (groupId, memberUserId, role) => {
    try {
      await groupService.updateMemberRole(groupId, memberUserId, role);
      set((state) => ({
        activeGroupMembers: state.activeGroupMembers.map((m) =>
          m.user?.id === memberUserId ? { ...m, role } : m
        ),
      }));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  removeMember: async (groupId, memberUserId) => {
    try {
      await groupService.removeMember(groupId, memberUserId);
      set((state) => ({
        activeGroupMembers: state.activeGroupMembers.filter((m) => m.user?.id !== memberUserId),
        activeGroup: state.activeGroup?.id === groupId
          ? { ...state.activeGroup, memberCount: Math.max(0, (state.activeGroup.memberCount || 1) - 1) }
          : state.activeGroup,
      }));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },
}));
