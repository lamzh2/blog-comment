import { CommentSection } from '@/components/comment/CommentSection';

const DEMO_ARTICLE_ID = 'demo-blog-post-1';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Blog post content (simulated) */}
      <article className="max-w-2xl mx-auto pt-16 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Building a Comment System with Next.js
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-8">
          <span>May 6, 2026</span>
          <span>·</span>
          <span>6 min read</span>
        </div>
        <div className="prose prose-neutral max-w-none mb-12">
          <p>
            Comments are the heartbeat of any blog. They turn static content into a conversation.
            In this post, we&apos;ll walk through building a full-featured comment system with
            nested replies, Markdown support, and author moderation — all powered by Next.js
            and Prisma.
          </p>
          <p>
            The system supports anonymous commenting, @mentions, like toggling, and report
            functionality. Authors get a management panel for moderation.
          </p>
        </div>
      </article>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-4">
        <hr className="border-neutral-200" />
      </div>

      {/* Comment Section */}
      <CommentSection articleId={DEMO_ARTICLE_ID} />
    </main>
  );
}
