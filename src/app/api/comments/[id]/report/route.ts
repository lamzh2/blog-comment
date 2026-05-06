import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/comments/[id]/report — 举报评论
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const { reason, visitorId } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const report = await prisma.commentReport.create({
      data: {
        commentId,
        reason: reason.trim(),
        visitorId,
        status: 'pending',
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('REPORT error:', error);
    return NextResponse.json({ error: 'Failed to report comment' }, { status: 500 });
  }
}
