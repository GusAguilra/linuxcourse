import type { ReactNode } from "react";

type TerminalWindowProps = {
  title?: string;
  prompt?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  controls?: ReactNode;
};

export function TerminalWindow({
  title,
  prompt,
  children,
  className = "",
  bodyClassName = "",
  controls,
}: TerminalWindowProps) {
  return (
    <section className={`terminal-window ${className}`}>
      <div className="terminal-window-bar">
        <div className="terminal-window-controls" aria-hidden="true">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        {title && <div className="terminal-window-title">{title}</div>}
        {controls && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {controls}
          </div>
        )}
      </div>
      <div className={`terminal-window-body ${bodyClassName}`}>
        {prompt && <div className="terminal-window-prompt">{prompt}</div>}
        {children}
      </div>
    </section>
  );
}