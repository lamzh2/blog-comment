'use client';

import { useState } from 'react';
import { useCommentStore } from '@/lib/store';

interface Props {
  articleId: string;
}

export function CommentForm({ articleId }: Props) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addComment = useCommentStore(s => s.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addComment(articleId, content, authorName || undefined);
      setContent('');
      setAuthorName('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border border-neutral-200 rounded-lg bg-white">
      <div className="mb-3">
        <input
          type="text"
          placeholder="Your name (optional — anonymous if blank)"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          maxLength={50}
        />
      </div>

      <div className="mb-3">
        <textarea
          placeholder="Write a comment... (supports @username mentions and Markdown)"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-y font-mono"
          maxLength={10000}
        />
        <div className="mt-1 text-xs text-neutral-400 text-right">
          {content.length}/10000 &middot; Markdown &amp; @mentions supported
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
