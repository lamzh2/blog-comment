'use client';

import { useState, useRef, useEffect } from 'react';
import { useCommentStore } from '@/lib/store';

interface Props {
  parentId: string;
  articleId: string;
  isNestedLimit: boolean;
}

export function ReplyForm({ parentId, articleId, isNestedLimit }: Props) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addReply, setActiveReply, fetchComments } = useCommentStore();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    if (isNestedLimit) {
      setError('Maximum nesting depth reached');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addReply(parentId, content, authorName || undefined);
      setContent('');
      setAuthorName('');
      setActiveReply(null);
      await fetchComments(articleId);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border border-neutral-200 rounded-md bg-neutral-50">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={authorName}
        onChange={e => setAuthorName(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-neutral-200 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        maxLength={50}
      />
      <textarea
        ref={textareaRef}
        placeholder="Write a reply..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        className="w-full px-2 py-1 text-sm border border-neutral-200 rounded resize-y font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
        maxLength={10000}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1 bg-neutral-900 text-white text-xs rounded hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? '...' : 'Reply'}
        </button>
        <button
          type="button"
          onClick={() => setActiveReply(null)}
          className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
