import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/mentions?user=xxx — 获取 @ 列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');

    if (!user) {
      return NextResponse.json({ error: 'user query param is required' }, { status: 400 });
    }

    const mentions = await prisma.commentMention.findMany({
      where: { mentionedUser: user },
      orderBy: { createdAt: 'desc' },
      include: {
        comment: {
          select: { id: true, articleId: true, content: true, authorName: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ mentions });
  } catch (error) {
    console.error('MENTIONS error:', error);
    return NextResponse.json({ error: 'Failed to fetch mentions' }, { status: 500 });
  }
}
