/**
 * 博客作者权限验证（MVP：基于环境变量 AUTHOR_KEY 的简单方案）
 *
 * 生产环境中应替换为 JWT / OAuth 等完整认证方案。
 */

const AUTHOR_KEY = process.env.AUTHOR_KEY || 'blog-author-secret-key';

/**
 * 验证请求是否来自博客作者
 */
export function isAuthor(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  // Bearer token scheme
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7) === AUTHOR_KEY;
  }

  // Cookie fallback
  const cookie = request.headers.get('cookie') || '';
  return cookie.includes(`author_key=${AUTHOR_KEY}`);
}

/**
 * 获取作者身份标识（如果已认证）
 */
export function getAuthorIdentity(request: Request): string | null {
  return isAuthor(request) ? 'blog-author' : null;
}
