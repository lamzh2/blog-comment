import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/comments/[id]/like — 点赞切换 (upsert toggle)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const { visitorId } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
    }

    // 检查评论存在且未删除
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 检查是否已点赞
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_visitorId: { commentId, visitorId } },
    });

    if (existing) {
      // 取消点赞
      await prisma.commentLike.delete({ where: { id: existing.id } });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false, likesCount: comment.likesCount - 1 });
    } else {
      // 添加点赞
      await prisma.commentLike.create({ data: { commentId, visitorId } });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      });

      return NextResponse.json({ liked: true, likesCount: comment.likesCount + 1 });
    }
  } catch (error) {
    console.error('LIKE error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
