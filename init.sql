
CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT PRIMARY KEY,
  "article_id" TEXT NOT NULL,
  "parent_id" TEXT,
  "root_id" TEXT,
  "content" TEXT NOT NULL,
  "author_name" TEXT,
  "depth" INTEGER NOT NULL DEFAULT 0,
  "likes_count" INTEGER NOT NULL DEFAULT 0,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comment_likes" (
  "id" TEXT PRIMARY KEY,
  "comment_id" TEXT NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
  "visitor_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("comment_id", "visitor_id")
);

CREATE TABLE IF NOT EXISTS "comment_reports" (
  "id" TEXT PRIMARY KEY,
  "comment_id" TEXT NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
  "reason" TEXT NOT NULL,
  "visitor_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comment_mentions" (
  "id" TEXT PRIMARY KEY,
  "comment_id" TEXT NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
  "mentioned_user" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "comments_article_id_idx" ON "comments"("article_id");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments"("parent_id");
CREATE INDEX IF NOT EXISTS "comments_root_id_idx" ON "comments"("root_id");
CREATE INDEX IF NOT EXISTS "comment_likes_visitor_id_idx" ON "comment_likes"("visitor_id");
CREATE INDEX IF NOT EXISTS "comment_reports_comment_id_idx" ON "comment_reports"("comment_id");
CREATE INDEX IF NOT EXISTS "comment_mentions_mentioned_user_idx" ON "comment_mentions"("mentioned_user");
