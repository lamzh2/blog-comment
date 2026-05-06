'use client';

import { useState } from 'react';
import { useCommentStore } from '@/lib/store';

interface Props {
  commentId: string;
  likesCount: number;
  isNestedLimit: boolean;
}

export function CommentActions({ commentId, likesCount, isNestedLimit }: Props) {
  const { toggleLike, setActiveReply, setActiveReport, activeReportId } = useCommentStore();
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likesCount);
  const showReport = activeReportId === commentId;

  const handleLike = async () => {
    setLiked(!liked);
    setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
    try {
      await toggleLike(commentId);
    } catch {
      setLiked(liked);
      setLocalLikes(likesCount);
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 transition-colors ${
          liked ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {localLikes > 0 && <span>{localLikes}</span>}
      </button>

      {!isNestedLimit && (
        <button
          onClick={() => setActiveReply(commentId)}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          Reply
        </button>
      )}

      <button
        onClick={() => setActiveReport(showReport ? null : commentId)}
        className="text-neutral-400 hover:text-orange-500 transition-colors"
      >
        Report
      </button>

      {showReport && <ReportDialog commentId={commentId} />}
    </div>
  );
}

function ReportDialog({ commentId }: { commentId: string }) {
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const reportComment = useCommentStore(s => s.reportComment);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setStatus('submitting');
    try {
      await reportComment(commentId, reason);
      setStatus('done');
    } catch {
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="mt-2 text-xs text-green-600">
        Report submitted. Thank you.
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="text-xs border rounded px-2 py-1"
      >
        <option value="">Select reason...</option>
        <option value="spam">Spam</option>
        <option value="harassment">Harassment</option>
        <option value="inappropriate">Inappropriate content</option>
        <option value="other">Other</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={!reason || status === 'submitting'}
        className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
