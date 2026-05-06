'use client';

import { useState } from 'react';
import { useCommentStore } from '@/lib/store';

interface Props {
  articleId: string;
}

export function CommentManagement({ articleId }: Props) {
  const { isAuthor, comments, deleteComment, batchDelete, fetchComments } = useCommentStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  if (!isAuthor) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    try {
      await batchDelete(Array.from(selected));
      setSelected(new Set());
      await fetchComments(articleId);
    } catch (e) {
      console.error('Batch delete failed', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteComment(id);
      await fetchComments(articleId);
    } catch (e) {
      console.error('Delete failed', e);
    } finally {
      setDeleting(false);
    }
  };

  const allCommentIds = collectAllIds(comments);

  return (
    <div className="mb-6 p-3 border border-neutral-300 rounded-md bg-neutral-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-700">Comment Management</h3>
        <span className="text-xs text-neutral-400">{allCommentIds.length} comments</span>
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setSelected(new Set(allCommentIds))}
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          Select All
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          Clear
        </button>
        {selected.size > 0 && (
          <button
            onClick={handleBatchDelete}
            disabled={deleting}
            className="text-xs px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Delete {selected.size} selected
          </button>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {allCommentIds.map(id => {
          const comment = findComment(comments, id);
          if (!comment) return null;
          return (
            <div key={id} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={selected.has(id)}
                onChange={() => toggleSelect(id)}
              />
              <span className="text-neutral-600 truncate flex-1">
                {comment.authorName || 'Anonymous'}: {comment.content.slice(0, 40)}...
              </span>
              <button
                onClick={() => handleSingleDelete(id)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function collectAllIds(comments: { id: string; children?: any[] }[]): string[] {
  const ids: string[] = [];
  const walk = (list: { id: string; children?: any[] }[]) => {
    list.forEach(c => {
      ids.push(c.id);
      if (c.children) walk(c.children);
    });
  };
  walk(comments);
  return ids;
}

function findComment(comments: { id: string; children?: any[]; authorName: string | null; content: string }[], id: string): { id: string; children?: any[]; authorName: string | null; content: string } | null {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.children) {
      const found = findComment(c.children, id);
      if (found) return found;
    }
  }
  return null;
}
