import type { Tool } from "@/db/schema";
import { SanitizedSvg } from "@/components/SanitizedSvg";

export function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      {tool.category && (
        <div className="flex items-center justify-between bg-ink px-3.5 py-2 text-parchment">
          <span className="font-courier text-[8.5px] tracking-1 opacity-65">
            {tool.category}
          </span>
        </div>
      )}
      {tool.illustration && (
        <SanitizedSvg
          className="flex justify-center border-b border-ink bg-texture-graph p-6"
          svg={tool.illustration}
        />
      )}
      <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
        <h4 className="mb-2 font-cormorant text-[26px] leading-[1.05] font-semibold">
          {tool.name}
        </h4>
        {tool.descriptor && (
          <p className="mb-4 text-[13.5px] leading-[1.55] text-ink-light">
            {tool.descriptor}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.14em] text-accent uppercase">
          Open the tool{" "}
          <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </>
  );

  const cardClasses =
    "group hover-lift flex flex-col border-[1.5px] border-ink bg-paper shadow-paper";

  return tool.url ? (
    <a
      className={`${cardClasses} no-underline`}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  ) : (
    <div className={cardClasses}>{inner}</div>
  );
}
