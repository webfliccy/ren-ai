import { Fragment, createElement, type ReactNode } from "react";
import { marked, type Token, type Tokens } from "marked";

// Markdown rendered straight to React elements — no HTML string, no
// dangerouslySetInnerHTML. Raw HTML in the source stays inert text, and
// unsafe link protocols are dropped, so the output needs no sanitizer.
// (Unlike lib/markdown.ts this pipeline has no KaTeX support.)

const SAFE_HREF = /^(https?:|mailto:|[/#])/i;

function renderTokens(tokens: Token[]): ReactNode {
  return tokens.map((token, i) => (
    <Fragment key={i}>{renderToken(token)}</Fragment>
  ));
}

function renderToken(token: Token): ReactNode {
  switch (token.type) {
    case "paragraph":
      return <p>{renderTokens(token.tokens ?? [])}</p>;
    case "heading":
      return createElement(
        `h${(token as Tokens.Heading).depth}`,
        null,
        renderTokens(token.tokens ?? []),
      );
    case "blockquote":
      return <blockquote>{renderTokens(token.tokens ?? [])}</blockquote>;
    case "list": {
      const list = token as Tokens.List;
      const items = list.items.map((item, i) => (
        <li key={i}>{renderTokens(item.tokens)}</li>
      ));
      return list.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "em":
      return <em>{renderTokens(token.tokens ?? [])}</em>;
    case "strong":
      return <strong>{renderTokens(token.tokens ?? [])}</strong>;
    case "del":
      return <del>{renderTokens(token.tokens ?? [])}</del>;
    case "link": {
      const link = token as Tokens.Link;
      const body = link.tokens?.length ? renderTokens(link.tokens) : link.text;
      return SAFE_HREF.test(link.href) ? <a href={link.href}>{body}</a> : body;
    }
    case "codespan":
      return <code>{(token as Tokens.Codespan).text}</code>;
    case "code":
      return (
        <pre>
          <code>{(token as Tokens.Code).text}</code>
        </pre>
      );
    case "br":
      return <br />;
    case "hr":
      return <hr />;
    case "space":
      return null;
    case "escape":
      return (token as Tokens.Escape).text;
    case "text": {
      const text = token as Tokens.Text;
      return text.tokens?.length ? renderTokens(text.tokens) : text.text;
    }
    // Raw HTML and anything unrecognised render as their literal source text;
    // React escapes it, so nothing is ever injected as markup.
    default:
      return token.raw;
  }
}

export function ProseMarkdown({ markdown }: { markdown: string }) {
  return <>{renderTokens(marked.lexer(markdown))}</>;
}
