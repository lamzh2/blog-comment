import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthor } from '@/lib/auth';

// DELETE /api/comments/[id] — 软删除（级联删除子评论）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 权限验证：只有作者可删除
    if (!isAuthor(req)) {
      return NextResponse.json({ error: 'Unauthorized: author only' }, { status: 403 });
    }

    const commentId = params.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.isDeleted) {
      return NextResponse.json({ error: 'Comment already deleted' }, { status: 400 });
    }

    // 收集所有需要级联删除的子评论 ID
    const childIds = await collectChildIds(commentId);

    // 批量软删除：自身 + 所有子评论
    const allIds = [commentId, ...childIds];
    await prisma.comment.updateMany({
      where: { id: { in: allIds } },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      deleted: allIds.length,
      commentIds: allIds,
    });
  } catch (error) {
    console.error('DELETE comment error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

// 递归收集所有子评论 ID
async function collectChildIds(parentId: string): Promise<string[]> {
  const children = await prisma.comment.findMany({
    where: { parentId, isDeleted: false },
    select: { id: true },
  });

  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const grandChildren = await collectChildIds(child.id);
    ids.push(...grandChildren);
  }

  return ids;
}
