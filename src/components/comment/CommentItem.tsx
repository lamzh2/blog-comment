'use client';

import { useCommentStore } from '@/lib/store';
import { CommentActions } from './CommentActions';
import { ReplyForm } from './ReplyForm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Comment {
  id: string;
  content: string;
  authorName: string | null;
  depth: number;
  likesCount: number;
  createdAt: string;
  children: Comment[];
}

interface Props {
  comment: Comment;
  articleId: string;
  depth: number;
}

export function CommentItem({ comment, articleId, depth }: Props) {
  const activeReplyId = useCommentStore(s => s.activeReplyId);
  const isReplying = activeReplyId === comment.id;

  const displayName = comment.authorName || 'Anonymous';
  const timeAgo = formatTimeAgo(comment.createdAt);
  const isNestedLimit = depth >= 5;

  return (
    <div className="group">
      <div
        className={`relative pl-${Math.min(depth * 4, 16)} ${
          depth > 0 ? 'border-l-2 border-neutral-100 ml-6' : ''
        }`}
        style={{
          marginLeft: depth > 0 ? `${Math.min(depth * 24, 96)}px` : undefined,
          borderLeftWidth: depth > 0 ? '2px' : undefined,
          borderColor: depth > 0 ? '#f5f5f5' : undefined,
          paddingLeft: depth > 0 ? '16px' : undefined,
        }}
      >
        <div className="py-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-neutral-900">
              {displayName}
            </span>
            <span className="text-xs text-neutral-400">{timeAgo}</span>
            {depth > 0 && (
              <span className="text-xs text-neutral-300">· reply</span>
            )}
          </div>

          {/* Content */}
          <div className="text-sm text-neutral-700 leading-relaxed mb-2">
            <MarkdownRenderer content={comment.content} />
          </div>

          {/* Actions */}
          <CommentActions
            commentId={comment.id}
            likesCount={comment.likesCount}
            isNestedLimit={isNestedLimit}
          />

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-2">
              <ReplyForm parentId={comment.id} articleId={articleId} isNestedLimit={isNestedLimit} />
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map(child => (
            <CommentItem key={child.id} comment={child} articleId={articleId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
