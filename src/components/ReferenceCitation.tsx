import { ChicagoWebRef } from "@/lib/references";

/**
 * Renders a single Chicago-style (web) citation as the inner content of a
 * list item. Shared between the post detail page and the field-note detail
 * page so the formatting stays consistent.
 */
export function ReferenceCitation({ reference }: { reference: ChicagoWebRef }) {
  const author =
    reference.authorLast || reference.authorFirst
      ? `${reference.authorLast}${reference.authorFirst ? `, ${reference.authorFirst}` : ""}.`
      : null;

  return (
    <>
      {author && <>{author} </>}
      {reference.pageTitle && <>&ldquo;{reference.pageTitle}.&rdquo; </>}
      {reference.siteName && <><em>{reference.siteName}</em>. </>}
      {reference.date && <>{reference.date}. </>}
      {reference.url && (
        <>
          <a href={reference.url} target="_blank" rel="noopener noreferrer">
            {reference.url}
          </a>
          .
        </>
      )}
    </>
  );
}
