/**
 * 验证评论内容非空
 */
export function validateContent(content: unknown): string | null {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return 'Content cannot be empty';
  }
  if (content.trim().length > 10000) {
    return 'Content exceeds maximum length (10000 characters)';
  }
  return null;
}

/**
 * XSS 防护 — 移除 HTML 标签和危险字符
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * 生成匿名访客标识
 */
export function generateVisitorId(): string {
  return 'visitor_' + crypto.randomUUID();
}

/**
 * 验证 visitorId 格式（基本校验）
 */
export function validateVisitorId(id: unknown): string | null {
  if (!id || typeof id !== 'string' || id.length < 8 || id.length > 128) {
    return 'Invalid visitor ID';
  }
  return null;
}
