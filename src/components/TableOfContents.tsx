"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ contentSelector = ".prose" }: { contentSelector?: string }) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const items: HeadingItem[] = [];
    content.querySelectorAll("h2, h3, h4").forEach((el) => {
      const text = el.textContent || "";
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      el.id = id;
      items.push({
        id,
        text,
        level: parseInt(el.tagName[1]),
      });
    });

    if (items.length < 2) return;

    /* eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from DOM */
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const h of items) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [contentSelector]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Índice de contenido"
      className="sticky top-24 w-56 shrink-0 hidden xl:block"
    >
      <div className="space-y-1 border-l border-zinc-800 pl-4">
        <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-wider text-zinc-600">
          En esta página
        </p>
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "block text-xs leading-relaxed transition-all duration-200",
              h.level === 2 ? "pl-0" : h.level === 3 ? "pl-3" : "pl-5",
              activeId === h.id
                ? "text-emerald-400 font-medium border-l-2 border-emerald-500 -ml-[calc(1rem+1px)] pl-[calc(1rem-1px)]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}