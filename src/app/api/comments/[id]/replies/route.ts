import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseMentions } from '@/app/api/articles/[articleId]/comments/route';
import { validateContent, sanitizeInput } from '@/lib/security';

// POST /api/comments/[id]/replies — 回复评论
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parentId = params.id;
    const { content, authorName, visitorId } = await req.json();

    // 输入校验
    const contentError = validateContent(content);
    if (contentError) {
      return NextResponse.json({ error: contentError }, { status: 400 });
    }

    const sanitized = sanitizeInput(content.trim());

    // 查父评论
    const parent = await prisma.comment.findUnique({
      where: { id: parentId, isDeleted: false },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // 嵌套深度限制 5 层
    if (parent.depth >= 5) {
      return NextResponse.json({ error: 'Maximum nesting depth (5) exceeded' }, { status: 400 });
    }

    const rootId = parent.rootId || parent.id;
    const newDepth = parent.depth + 1;

    const reply = await prisma.comment.create({
      data: {
        articleId: parent.articleId,
        parentId,
        rootId,
        content: sanitized,
        authorName: authorName || null,
        depth: newDepth,
      },
    });

    // 解析 @ 提及
    const mentions = parseMentions(content);
    if (mentions.length > 0) {
      await prisma.commentMention.createMany({
        data: mentions.map(user => ({
          commentId: reply.id,
          mentionedUser: user,
        })),
      });
    }

    const full = await prisma.comment.findUnique({
      where: { id: reply.id },
      include: { mentions: true, _count: { select: { likes: true } } },
    });

    return NextResponse.json({ comment: full }, { status: 201 });
  } catch (error) {
    console.error('POST reply error:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
