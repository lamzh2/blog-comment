'use client';

import { useCommentStore } from '@/lib/store';
import { CommentItem } from './CommentItem';

interface Props {
  articleId: string;
}

export function CommentList({ articleId }: Props) {
  const comments = useCommentStore(s => s.comments);

  if (comments.length === 0) {
    return (
      <div className="mt-8 text-center py-12 text-neutral-400">
        <p className="text-lg mb-2">No comments yet</p>
        <p className="text-sm">Be the first to share your thoughts.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-1">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} articleId={articleId} depth={0} />
      ))}
    </div>
  );
}
