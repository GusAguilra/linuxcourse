"use client";

import { VFS, CWD, ENV, ALIASES, setExitCode, expandVars, joinPath, normalizePath } from "./vfs";
import { COMMANDS, EXTERNAL_ALIASES } from "./commands";

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const allCommandNames = Object.keys(COMMANDS).concat(Object.keys(EXTERNAL_ALIASES));

export function suggestCommand(badName: string): string | null {
  const lower = badName.toLowerCase();
  let best: string | null = null;
  let bestDist = Infinity;
  for (const name of allCommandNames) {
    const d = levenshtein(lower, name);
    if (d < bestDist && d <= 3) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

export function tabComplete(line: string): string | null {
  if (!line) return null;

  const parts = line.split(/\s+/);
  const last = parts[parts.length - 1];
  if (!last) return null;

  if (parts.length === 1) {
    const matches = allCommandNames.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      const rest = line.slice(0, -last.length) + matches[0];
      return rest + " ";
    }
    if (matches.length > 1) return null;
  }

  const expanded = last.startsWith("~") ? last.replace("~", ENV.HOME) : last;
  const isAbsolute = expanded.startsWith("/");
  const dirPart = isAbsolute
    ? expanded.includes("/") ? expanded.substring(0, expanded.lastIndexOf("/")) : "/"
    : CWD;
  const prefix = isAbsolute
    ? expanded.includes("/") ? expanded.substring(expanded.lastIndexOf("/") + 1) : expanded
    : expanded.includes("/")
      ? expanded.substring(expanded.lastIndexOf("/") + 1)
      : expanded;

  const searchDir = isAbsolute
    ? normalizePath(dirPart)
    : expanded.includes("/")
      ? normalizePath(joinPath(CWD, expanded.substring(0, expanded.lastIndexOf("/"))))
      : CWD;

  const dir = VFS[searchDir];
  if (!dir?.children) return null;

  const matches = Object.keys(dir.children).filter((n) => n.startsWith(prefix));
  if (matches.length === 1) {
    const rest = expanded.slice(0, -prefix.length) + matches[0];
    const append = dir.children[matches[0]]?.type === "dir" ? "/" : " ";
    return line.slice(0, -last.length) + rest + append;
  }

  return null;
}

export type ParseResult =
  | { type: "ok"; output: string }
  | { type: "clear" }
  | { type: "error"; msg: string };

function getFileContent(path: string): string | null {
  const node = VFS[normalizePath(path)];
  if (node?.type === "file") return node.content ?? "";
  return null;
}

function writeFile(path: string, content: string, append: boolean) {
  const p = normalizePath(path);
  const parentPath = p.substring(0, p.lastIndexOf("/")) || "/";
  const name = p.split("/").pop() || "";
  const parent = VFS[parentPath];
  if (!parent || parent.type !== "dir") return;
  if (!parent.children) parent.children = {};
  if (append && VFS[p]) {
    VFS[p].content = (VFS[p].content ?? "") + content;
    VFS[p].size = (VFS[p].content ?? "").length;
  } else {
    parent.children[name] = {
      type: "file",
      content,
      mode: "-rw-r--r--",
      owner: "user",
      group: "user",
      size: content.length,
    };
    VFS[p] = parent.children[name];
  }
}

function execOne(
  name: string,
  args: string[],
  stdin?: string,
  history?: string[],
): { output: string; isClear: boolean } {
  if (!name) return { output: "", isClear: false };

  const resolved = EXTERNAL_ALIASES[name] ?? name;

  if (!COMMANDS[resolved]) {
    const sug = suggestCommand(resolved);
    const hint = sug ? `\r\n\x1b[1m\x1b[33mDid you mean:\x1b[0m  \x1b[1m${sug}\x1b[0m` : "";
    return { output: `bash: ${resolved}: command not found${hint}`, isClear: false };
  }

  const result = COMMANDS[resolved](args, stdin, history ?? []);
  if (result === "CLEAR") return { output: "", isClear: true };
  return { output: result || "", isClear: false };
}

function expandLine(line: string): string {
  let out = expandVars(line);
  const parts = out.split(/\s+/);
  if (parts.length > 0 && ALIASES[parts[0]]) {
    const rest = parts.slice(1).join(" ");
    out = ALIASES[parts[0]] + (rest ? " " + rest : "");
  }
  return out;
}

function splitLogical(expanded: string): string[] {
  const segments: string[] = [];
  let current = "";
  let inQuote: string | null = null;
  for (let i = 0; i < expanded.length; i++) {
    const ch = expanded[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      current += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === ";" && !inQuote) {
      if (current.trim()) segments.push(current.trim());
      current = "";
      continue;
    }
    if (ch === "&" && i + 1 < expanded.length && expanded[i + 1] === "&" && !inQuote) {
      if (current.trim()) segments.push(current.trim());
      current = "";
      i++;
      continue;
    }
    current += ch;
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

export function execute(line: string, history: string[]): ParseResult[] {
  const results: ParseResult[] = [];
  const expanded = expandLine(line);
  const segments = splitLogical(expanded);

  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    const tokens = tokenize(trimmed);
    const pipeSegments = splitByPipes(tokens);

    let stdin: string | undefined;
    let lastOutput = "";

    for (let i = 0; i < pipeSegments.length; i++) {
      const { args, redirectOut, redirectAppend, redirectIn } = pipeSegments[i];

      if (redirectIn) {
        const content = getFileContent(redirectIn);
        if (content === null) {
          results.push({ type: "error", msg: `bash: ${redirectIn}: No such file or directory` });
          setExitCode(1);
          break;
        }
        stdin = content;
      }

      const name = args[0]?.toLowerCase() ?? "";
      const cmdArgs = args.slice(1);

      const { output, isClear } = execOne(name, cmdArgs, stdin, history);

      if (isClear) {
        results.push({ type: "clear" });
        return results;
      }

      lastOutput = output;

      if (i < pipeSegments.length - 1) {
        stdin = output;
      } else {
        if (redirectOut) {
          writeFile(redirectOut, output, false);
          lastOutput = "";
        } else if (redirectAppend) {
          writeFile(redirectAppend, output, true);
          lastOutput = "";
        }
      }

      setExitCode(output ? 0 : 0);
    }

    if (lastOutput) {
      results.push({ type: "ok", output: lastOutput });
    }
  }

  if (results.length === 0) {
    results.push({ type: "ok", output: "" });
  }

  return results;
}

type ParsedSeg = {
  args: string[];
  redirectOut: string | null;
  redirectAppend: string | null;
  redirectIn: string | null;
};

function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote: string | null = null;
  let escape = false;

  for (const ch of line) {
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function splitByPipes(tokens: string[]): ParsedSeg[] {
  const segments: ParsedSeg[] = [];
  let current: ParsedSeg = { args: [], redirectOut: null, redirectAppend: null, redirectIn: null };

  for (const tok of tokens) {
    if (tok === "|") {
      segments.push(current);
      current = { args: [], redirectOut: null, redirectAppend: null, redirectIn: null };
    } else if (tok === ">>") {
      current.redirectAppend = ""; // temp, filled next token
    } else if (tok === ">") {
      current.redirectOut = "";
    } else if (tok === "<") {
      current.redirectIn = "";
    } else if (current.redirectAppend === "") {
      current.redirectAppend = tok;
    } else if (current.redirectOut === "") {
      current.redirectOut = tok;
    } else if (current.redirectIn === "") {
      current.redirectIn = tok;
    } else {
      current.args.push(tok);
    }
  }
  segments.push(current);
  return segments;
}
