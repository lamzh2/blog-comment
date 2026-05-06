'use client';

import { useEffect } from 'react';
import { useCommentStore } from '@/lib/store';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentManagement } from './CommentManagement';

interface Props {
  articleId: string;
}

export function CommentSection({ articleId }: Props) {
  const { loading, error, fetchComments, initVisitorId, checkAuthor } = useCommentStore();

  useEffect(() => {
    initVisitorId();
    checkAuthor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchComments(articleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <section className="w-full max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Discussion
      </h2>

      <CommentForm articleId={articleId} />

      <CommentManagement articleId={articleId} />

      {loading && (
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-lg h-24" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && <CommentList articleId={articleId} />}
    </section>
  );
}
