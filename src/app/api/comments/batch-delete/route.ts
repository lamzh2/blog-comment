import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthor } from '@/lib/auth';

// POST /api/comments/batch-delete — 批量软删除评论
export async function POST(req: NextRequest) {
  try {
    if (!isAuthor(req)) {
      return NextResponse.json({ error: 'Unauthorized: author only' }, { status: 403 });
    }

    const { commentIds } = await req.json();

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json({ error: 'commentIds array is required' }, { status: 400 });
    }

    // 收集所有需要级联删除的 ID
    const allIds = new Set(commentIds);
    for (const id of commentIds) {
      const children = await collectAllChildren(id);
      children.forEach(c => allIds.add(c));
    }

    await prisma.comment.updateMany({
      where: { id: { in: [...allIds] } },
      data: { isDeleted: true },
    });

    return NextResponse.json({ deleted: allIds.size, commentIds: [...allIds] });
  } catch (error) {
    console.error('BATCH DELETE error:', error);
    return NextResponse.json({ error: 'Failed to batch delete' }, { status: 500 });
  }
}

async function collectAllChildren(parentId: string): Promise<string[]> {
  const children = await prisma.comment.findMany({
    where: { parentId, isDeleted: false },
    select: { id: true },
  });

  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const grand = await collectAllChildren(child.id);
    ids.push(...grand);
  }
  return ids;
}
