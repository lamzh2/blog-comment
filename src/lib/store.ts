import { create } from 'zustand';

interface Comment {
  id: string;
  articleId: string;
  parentId: string | null;
  rootId: string | null;
  content: string;
  authorName: string | null;
  depth: number;
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  mentions?: { mentionedUser: string; isRead: boolean }[];
  _count?: { likes: number };
  children: Comment[];
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  visitorId: string;
  isAuthor: boolean;
  activeReplyId: string | null;
  activeReportId: string | null;

  fetchComments: (articleId: string) => Promise<void>;
  addComment: (articleId: string, content: string, authorName?: string) => Promise<void>;
  addReply: (parentId: string, content: string, authorName?: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
  reportComment: (commentId: string, reason: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  batchDelete: (commentIds: string[]) => Promise<void>;
  checkAuthor: () => Promise<void>;
  setActiveReply: (id: string | null) => void;
  setActiveReport: (id: string | null) => void;
  initVisitorId: () => void;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'visitor_' + crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,
  visitorId: '',
  isAuthor: false,
  activeReplyId: null,
  activeReportId: null,

  initVisitorId: () => set({ visitorId: getVisitorId() }),

  checkAuthor: async () => {
    try {
      const res = await fetch('/api/author/check');
      const data = await res.json();
      set({ isAuthor: data.isAuthor });
    } catch { /* ignore */ }
  },

  fetchComments: async (articleId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      set({ comments: data.comments || [], loading: false });
    } catch {
      set({ error: 'Failed to load comments', loading: false });
    }
  },

  addComment: async (articleId: string, content: string, authorName?: string) => {
    const visitorId = get().visitorId || getVisitorId();
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, authorName, visitorId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post');
    }
    await get().fetchComments(articleId);
  },

  addReply: async (parentId: string, content: string, authorName?: string) => {
    const visitorId = get().visitorId || getVisitorId();
    const res = await fetch(`/api/comments/${parentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, authorName, visitorId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reply');
    }
    set({ activeReplyId: null });
  },

  toggleLike: async (commentId: string) => {
    const visitorId = get().visitorId || getVisitorId();
    await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    });
  },

  reportComment: async (commentId: string, reason: string) => {
    const visitorId = get().visitorId || getVisitorId();
    await fetch(`/api/comments/${commentId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, visitorId }),
    });
    set({ activeReportId: null });
  },

  deleteComment: async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTHOR_KEY || 'blog-author-secret-key'}` },
    });
    if (!res.ok) throw new Error('Failed to delete');
  },

  batchDelete: async (commentIds: string[]) => {
    const res = await fetch('/api/comments/batch-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTHOR_KEY || 'blog-author-secret-key'}`,
      },
      body: JSON.stringify({ commentIds }),
    });
    if (!res.ok) throw new Error('Failed to batch delete');
  },

  setActiveReply: (id) => set({ activeReplyId: id }),
  setActiveReport: (id) => set({ activeReportId: id }),
}));
