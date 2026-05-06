import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/articles/[articleId]/comments — 获取树形评论列表
export async function GET(
  req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const { articleId } = params;

    const comments = await prisma.comment.findMany({
      where: { articleId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        mentions: { select: { mentionedUser: true, isRead: true } },
        _count: { select: { likes: true } },
      },
    });

    // 构建树形结构
    const tree = buildCommentTree(comments);
    return NextResponse.json({ comments: tree });
  } catch (error) {
    console.error('GET comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/articles/[articleId]/comments — 发表顶级评论
export async function POST(
  req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const { articleId } = params;
    const { content, authorName, visitorId } = await req.json();

    // 空内容拒绝
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        content: content.trim(),
        authorName: authorName || null,
        depth: 0,
      },
    });

    // 解析 @ 提及
    const mentions = parseMentions(content);
    if (mentions.length > 0) {
      await prisma.commentMention.createMany({
        data: mentions.map(user => ({
          commentId: comment.id,
          mentionedUser: user,
        })),
      });
    }

    const full = await prisma.comment.findUnique({
      where: { id: comment.id },
      include: { mentions: true, _count: { select: { likes: true } } },
    });

    return NextResponse.json({ comment: full }, { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// ---- Helpers ----

interface CommentWithMeta {
  id: string;
  articleId: string;
  parentId: string | null;
  rootId: string | null;
  content: string;
  authorName: string | null;
  depth: number;
  likesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentions: { mentionedUser: string; isRead: boolean }[];
  _count: { likes: number };
}

interface TreeNode extends Omit<CommentWithMeta, 'mentions' | '_count'> {
  mentions?: { mentionedUser: string; isRead: boolean }[];
  _count?: { likes: number };
  children: TreeNode[];
}

function buildCommentTree(comments: CommentWithMeta[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  comments.forEach(c => {
    map.set(c.id, { ...c, children: [] });
  });

  comments.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 按时间倒序排列每层子节点
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}

export function parseMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(1)))];
}
