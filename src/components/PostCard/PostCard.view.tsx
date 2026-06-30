import Link from "next/link";

export type PostCardProps = {
  title: string;
  slug: string;
  excerpt?: string;
  formattedDate?: string;
  publishedIso?: string;
  readingTime: number;
  tags: string[];
};

export function PostCardView({
  title,
  slug,
  excerpt,
  formattedDate,
  publishedIso,
  readingTime,
  tags,
}: PostCardProps) {
  return (
    <article className="group border-b border-gray-100 py-8 last:border-0">
      <Link href={`/${slug}`} className="block space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
        {excerpt && (
          <p className="text-gray-500 leading-relaxed line-clamp-2">{excerpt}</p>
        )}
        <div className="flex items-center gap-4 pt-1">
          {formattedDate && (
            <time className="text-sm text-gray-400" dateTime={publishedIso}>
              {formattedDate}
            </time>
          )}
          {readingTime > 0 && (
            <span className="text-sm text-gray-400">{readingTime} min read</span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
