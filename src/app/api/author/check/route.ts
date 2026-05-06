import { NextRequest, NextResponse } from 'next/server';
import { isAuthor } from '@/lib/auth';

// GET /api/author/check — 检测当前请求是否为作者
export async function GET(req: NextRequest) {
  const author = isAuthor(req);
  return NextResponse.json({ isAuthor: author });
}
