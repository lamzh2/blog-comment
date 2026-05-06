-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "article_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "root_id" TEXT,
    "content" TEXT NOT NULL,
    "author_name" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "comments_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comment_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comment_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_mentions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comment_id" TEXT NOT NULL,
    "mentioned_user" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_mentions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "comments_article_id_idx" ON "comments"("article_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "comments_root_id_idx" ON "comments"("root_id");

-- CreateIndex
CREATE INDEX "comment_likes_visitor_id_idx" ON "comment_likes"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_likes_comment_id_visitor_id_key" ON "comment_likes"("comment_id", "visitor_id");

-- CreateIndex
CREATE INDEX "comment_reports_comment_id_idx" ON "comment_reports"("comment_id");

-- CreateIndex
CREATE INDEX "comment_mentions_mentioned_user_idx" ON "comment_mentions"("mentioned_user");
