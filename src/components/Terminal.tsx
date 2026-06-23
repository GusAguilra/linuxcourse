"use client";

import { useEffect, useRef, useCallback, memo, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { CWD } from "@/lib/terminal/vfs";
import { execute, tabComplete } from "@/lib/terminal/shell";
import { TerminalWindow } from "@/components/TerminalWindow";
import { getTheme, loadTheme, saveTheme, themes } from "@/lib/terminal/themes";

const WS_URL = process.env.NEXT_PUBLIC_TERMINAL_WS_URL || "ws://localhost:3001";
const WS_TOKEN = process.env.NEXT_PUBLIC_TERMINAL_WS_TOKEN || "";

type TerminalProps = {
  height?: string;
  onCommand?: (command: string) => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MIN_DELAY = 40;
const MAX_DELAY = 120;

async function typeText(term: XTerm, text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    term.writeln(lines[i]);
    if (i < lines.length - 1) {
      await sleep(MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));
    }
  }
}

function TerminalInner({ height = "300px", onCommand }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const onCommandRef = useRef(onCommand);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const wsRef = useRef<WebSocket | null>(null);
  const processingRef = useRef(false);
  const [themeName, setThemeName] = useState(loadTheme);
  const [wsConnected, setWsConnected] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const prompt = useCallback(() => {
    const display = CWD === "/home/user" ? "~" : CWD.replace("/home/user/", "~/");
    return `user@linuxcourse:${display}$ `;
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    onCommandRef.current = onCommand;

    const theme = getTheme(themeName);
    const term = new XTerm({
      theme: {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        cursorAccent: theme.cursorAccent,
        selectionBackground: theme.selectionBackground,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      },
      fontFamily: "var(--font-geist-mono), 'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);

    const resize = () => {
      try {
        fitAddon.fit();
        sendResize();
      } catch {}
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(terminalRef.current);

    let input = "";
    let cursorPos = 0;
    let wsEverConnected = false;

    function connectWs() {
      try {
        const wsUrl = WS_TOKEN ? `${WS_URL}?token=${WS_TOKEN}` : WS_URL;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
          wsEverConnected = true;
          term.clear();
        };
        ws.onmessage = (event) => {
          term.write(event.data);
        };
        ws.onclose = () => {
          wsRef.current = null;
          if (wsEverConnected) {
            term.writeln("\r\n\x1b[33m[Terminal real desconectada. Usando simulación.]\x1b[0m");
            term.write(prompt());
          }
        };
        ws.onerror = () => {
          wsRef.current = null;
        };
      } catch {}
    }

    term.writeln(
      "\x1b[38;5;243m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\r\n" +
      `\x1b[38;5;22m  terminal — ${themeName}\x1b[0m\r\n` +
      "\x1b[38;5;243m  type \x1b[38;5;22mhelp\x1b[38;5;243m for available commands\x1b[0m\r\n" +
      "\x1b[38;5;243m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
    );
    term.write(prompt());
    connectWs();

    function sendResize() {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const cols = term.cols;
        const rows = term.rows;
        wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    }

    term.onKey(({ key, domEvent }) => {
      const wsActive = wsRef.current?.readyState === WebSocket.OPEN;

      if (processingRef.current) return;

      if (wsActive && domEvent.ctrlKey && key === "c") {
        wsRef.current!.send("\x03");
        return;
      }

      if (wsActive && (domEvent.key === "ArrowUp" || domEvent.key === "ArrowDown")) {
        wsRef.current!.send(key);
        return;
      }

      if (domEvent.ctrlKey && key === "c") {
        term.write("^C\r\n");
        input = "";
        cursorPos = 0;
        term.write(prompt());
        return;
      }

      if (domEvent.key === "Tab") {
        const completed = tabComplete(input);
        if (completed && completed !== input) {
          term.write("\b \b".repeat(input.length));
          input = completed;
          cursorPos = input.length;
          term.write(input);
        }
        return;
      }

      if (domEvent.key === "ArrowUp") {
        const history = historyRef.current;
        if (history.length === 0) return;
        const newIdx = historyIdxRef.current < 0
          ? history.length - 1
          : Math.max(0, historyIdxRef.current - 1);
        historyIdxRef.current = newIdx;
        term.write("\b \b".repeat(input.length));
        input = history[newIdx];
        cursorPos = input.length;
        term.write(input);
        return;
      }

      if (domEvent.key === "ArrowDown") {
        const history = historyRef.current;
        if (historyIdxRef.current < 0) return;
        term.write("\b \b".repeat(input.length));
        const newIdx = historyIdxRef.current + 1;
        if (newIdx >= history.length) {
          historyIdxRef.current = -1;
          input = "";
        } else {
          historyIdxRef.current = newIdx;
          input = history[newIdx];
        }
        cursorPos = input.length;
        term.write(input);
        return;
      }

      if (domEvent.key === "ArrowLeft") {
        if (cursorPos > 0) {
          cursorPos--;
          term.write("\x1b[D");
        }
        return;
      }

      if (domEvent.key === "ArrowRight") {
        if (cursorPos < input.length) {
          cursorPos++;
          term.write("\x1b[C");
        }
        return;
      }

      if (domEvent.key === "Home" || (domEvent.ctrlKey && key === "a")) {
        const left = cursorPos;
        if (left > 0) {
          cursorPos = 0;
          term.write(`\x1b[${left}D`);
        }
        return;
      }

      if (domEvent.key === "End" || (domEvent.ctrlKey && key === "e")) {
        const right = input.length - cursorPos;
        if (right > 0) {
          cursorPos = input.length;
          term.write(`\x1b[${right}C`);
        }
        return;
      }

      if (domEvent.ctrlKey && key === "w") {
        if (cursorPos === 0) return;
        let wordStart = cursorPos - 1;
        while (wordStart > 0 && input[wordStart - 1] === " ") wordStart--;
        while (wordStart > 0 && input[wordStart - 1] !== " ") wordStart--;
        const removed = input.slice(wordStart, cursorPos);
        input = input.slice(0, wordStart) + input.slice(cursorPos);
        cursorPos = wordStart;
        term.write(`\x1b[${removed.length}D\x1b[K${input.slice(cursorPos)}`);
        const back = input.length - cursorPos;
        if (back > 0) term.write(`\x1b[${back}D`);
        return;
      }

      if (domEvent.ctrlKey && key === "u") {
        if (cursorPos > 0) {
          input = input.slice(cursorPos);
          cursorPos = 0;
          term.write(`\x1b[K${input}`);
          const back = input.length;
          if (back > 0) term.write(`\x1b[${back}D`);
        }
        return;
      }

      if (domEvent.ctrlKey && key === "k") {
        if (cursorPos < input.length) {
          input = input.slice(0, cursorPos);
          term.write("\x1b[K");
        }
        return;
      }

      if (domEvent.key === "Enter") {
        const cmd = input.trim();
        if (cmd) {
          historyRef.current.push(cmd);
          onCommandRef.current?.(cmd);
        }
        historyIdxRef.current = -1;

        if (wsActive) {
          wsRef.current!.send("\r");
          input = "";
          cursorPos = 0;
          return;
        }

        if (!cmd) {
          term.write("\r\n");
          term.write(prompt());
          return;
        }

        processingRef.current = true;
        term.write("\r\n");

        const results = execute(cmd, historyRef.current);

        (async () => {
          for (const result of results) {
            if (result.type === "clear") {
              term.clear();
            } else if (result.type === "error") {
              await typeText(term, `\x1b[31m${result.msg}\x1b[0m`);
            } else if (result.output) {
              await typeText(term, result.output);
            }
          }
          processingRef.current = false;
          input = "";
          cursorPos = 0;
          term.write(prompt());
        })();

        return;
      }

      if (domEvent.key === "Backspace") {
        if (wsActive) {
          wsRef.current!.send("\x7f");
          if (cursorPos > 0) {
            input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
            cursorPos--;
          }
          return;
        }
        if (cursorPos > 0) {
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          term.write(`\x1b[D\x1b[K${input.slice(cursorPos)}`);
          const back = input.length - cursorPos;
          if (back > 0) term.write(`\x1b[${back}D`);
        }
        return;
      }

      if (domEvent.key === "Delete") {
        if (cursorPos < input.length) {
          input = input.slice(0, cursorPos) + input.slice(cursorPos + 1);
          term.write(`\x1b[K${input.slice(cursorPos)}`);
          const back = input.length - cursorPos;
          if (back > 0) term.write(`\x1b[${back}D`);
        }
        return;
      }

      if (!domEvent.altKey && !domEvent.ctrlKey && key.length === 1) {
        if (wsActive) {
          wsRef.current!.send(key);
          input = input.slice(0, cursorPos) + key + input.slice(cursorPos);
          cursorPos++;
          return;
        }
        input = input.slice(0, cursorPos) + key + input.slice(cursorPos);
        cursorPos++;
        term.write(key + input.slice(cursorPos));
        const back = input.length - cursorPos;
        if (back > 0) term.write(`\x1b[${back}D`);
      }
    });

    xtermRef.current = term;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      ro.disconnect();
      term.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, themeName]);

  useEffect(() => {
    const check = setInterval(() => {
      setWsConnected(wsRef.current?.readyState === WebSocket.OPEN);
    }, 2000);
    return () => clearInterval(check);
  }, []);

  function handleThemeChange(name: string) {
    saveTheme(name);
    setThemeName(name);
  }

  return (
    <div className="relative">
      <TerminalWindow
        title="terminal"
        bodyClassName="p-0"
        controls={
          <div className="relative">
            <button
              onClick={() => setThemePickerOpen(!themePickerOpen)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.6rem] text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 transition-colors"
              aria-label="Cambiar tema de terminal"
            >
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: getTheme(themeName).green }} />
              {themeName}
            </button>
            {themePickerOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemePickerOpen(false)} aria-hidden="true" />
                <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                  {Object.values(themes).map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        handleThemeChange(t.name);
                        setThemePickerOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                        themeName === t.name
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: t.green,
                        }}
                      />
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        }
      >
        <div
          ref={terminalRef}
          style={{ height, overflow: "hidden" }}
          className="will-change-transform"
          role="application"
          aria-label="Terminal interactiva simulada"
        />
      </TerminalWindow>
      <div className="absolute bottom-1.5 right-2 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-emerald-500" : "bg-zinc-600"}`} />
        <span className="text-[9px] text-zinc-700 font-mono">
          {wsConnected ? "WS" : "LOCAL"}
        </span>
      </div>
    </div>
  );
}

export const Terminal = memo(TerminalInner);