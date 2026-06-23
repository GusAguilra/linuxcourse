"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const DEMO_COMMANDS = [
  { cmd: "whoami", output: "linuxero" },
  { cmd: "pwd", output: "/home/user" },
  { cmd: "ls -la", output: "drwxr-xr-x  .\ndrwxr-xr-x  ..\n-rw-r--r--  README.md\n-rw-r--r--  notas.txt\ndrwxr-xr-x  proyectos" },
  { cmd: "cat README.md", output: "# LinuxCourse\nAprende Linux interactivamente desde tu navegador." },
  { cmd: "uname -a", output: "Linux linuxcourse 6.2.0-arch #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" },
  { cmd: "echo $SHELL", output: "/bin/bash" },
];

export function LandingDemo() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#22c55e",
        cursorAccent: "#0d1117",
        selectionBackground: "#22c55e33",
        black: "#0d1117",
        red: "#f85149",
        green: "#22c55e",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#39d2c0",
        white: "#e6edf3",
        brightBlack: "#484f58",
        brightRed: "#f85149",
        brightGreen: "#22c55e",
        brightYellow: "#d29922",
        brightBlue: "#58a6ff",
        brightMagenta: "#bc8cff",
        brightCyan: "#39d2c0",
        brightWhite: "#f0f6fc",
      },
      fontFamily: "var(--font-geist-mono), 'JetBrains Mono', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      allowTransparency: true,
      disableStdin: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(terminalRef.current);

    term.writeln(
      "\x1b[38;5;243m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\r\n" +
      "\x1b[38;5;22m  bienvenido a linuxcourse\x1b[0m\r\n" +
      "\x1b[38;5;243m  escribiendo comandos de ejemplo...\x1b[0m\r\n" +
      "\x1b[38;5;243m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
    );

    let cmdIdx = 0;
    let charIdx = 0;

    function typeNext() {
      if (cmdIdx >= DEMO_COMMANDS.length) {
        cmdIdx = 0;
        setTimeout(typeNext, 3000);
        return;
      }

      const { cmd, output } = DEMO_COMMANDS[cmdIdx];
      charIdx = 0;

      term.write("\r\n\x1b[32muser@linuxcourse\x1b[0m:\x1b[34m~\x1b[0m$ ");

      function typeChar() {
        if (charIdx < cmd.length) {
          term.write(cmd[charIdx]);
          charIdx++;
          setTimeout(typeChar, 40 + Math.random() * 60);
        } else {
          term.write("\r\n");
          output.split("\n").forEach((line) => {
            term.writeln(`\x1b[38;5;245m${line}\x1b[0m`);
          });
          cmdIdx++;
          setTimeout(typeNext, 800);
        }
      }

      setTimeout(typeChar, 300);
    }

    const timeout = setTimeout(typeNext, 500);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div className="terminal-window overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="terminal-window-bar">
        <div className="terminal-window-controls" aria-hidden="true">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        <div className="terminal-window-title">demo — linuxcourse</div>
      </div>
      <div className="terminal-window-body p-0">
        <div
          ref={terminalRef}
          style={{ height: "280px", overflow: "hidden" }}
          role="img"
          aria-label="Terminal demostración con comandos de Linux digitándose automáticamente"
        />
      </div>
    </div>
  );
}