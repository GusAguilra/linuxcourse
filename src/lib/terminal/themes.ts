export type TerminalTheme = {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
};

export const themes: Record<string, TerminalTheme> = {
  classic: {
    name: "Classic Green",
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
  matrix: {
    name: "Matrix",
    background: "#000000",
    foreground: "#00ff41",
    cursor: "#00ff41",
    cursorAccent: "#000000",
    selectionBackground: "#00ff4133",
    black: "#000000",
    red: "#ff0040",
    green: "#00ff41",
    yellow: "#80ff00",
    blue: "#00bfff",
    magenta: "#ff00ff",
    cyan: "#00ffff",
    white: "#ccffcc",
    brightBlack: "#333333",
    brightRed: "#ff4070",
    brightGreen: "#40ff70",
    brightYellow: "#b0ff40",
    brightBlue: "#40bfff",
    brightMagenta: "#ff40ff",
    brightCyan: "#40ffff",
    brightWhite: "#ffffff",
  },
  dracula: {
    name: "Dracula",
    background: "#1e1f29",
    foreground: "#f8f8f2",
    cursor: "#f8f8f2",
    cursorAccent: "#1e1f29",
    selectionBackground: "#6272a466",
    black: "#21222c",
    red: "#ff5555",
    green: "#50fa7b",
    yellow: "#f1fa8c",
    blue: "#bd93f9",
    magenta: "#ff79c6",
    cyan: "#8be9fd",
    white: "#f8f8f2",
    brightBlack: "#6272a4",
    brightRed: "#ff6e6e",
    brightGreen: "#69ff94",
    brightYellow: "#ffffa5",
    brightBlue: "#d6acff",
    brightMagenta: "#ff92df",
    brightCyan: "#a4ffff",
    brightWhite: "#ffffff",
  },
  nord: {
    name: "Nord",
    background: "#2e3440",
    foreground: "#d8dee9",
    cursor: "#88c0d0",
    cursorAccent: "#2e3440",
    selectionBackground: "#88c0d033",
    black: "#3b4252",
    red: "#bf616a",
    green: "#a3be8c",
    yellow: "#ebcb8b",
    blue: "#81a1c1",
    magenta: "#b48ead",
    cyan: "#88c0d0",
    white: "#e5e9f0",
    brightBlack: "#4c566a",
    brightRed: "#bf616a",
    brightGreen: "#a3be8c",
    brightYellow: "#ebcb8b",
    brightBlue: "#81a1c1",
    brightMagenta: "#b48ead",
    brightCyan: "#8fbcbb",
    brightWhite: "#eceff4",
  },
  tokyo: {
    name: "Tokyo Night",
    background: "#1a1b26",
    foreground: "#a9b1d6",
    cursor: "#c0caf5",
    cursorAccent: "#1a1b26",
    selectionBackground: "#33467c66",
    black: "#15161e",
    red: "#f7768e",
    green: "#9ece6a",
    yellow: "#e0af68",
    blue: "#7aa2f7",
    magenta: "#bb9af7",
    cyan: "#7dcfff",
    white: "#a9b1d6",
    brightBlack: "#414868",
    brightRed: "#f7768e",
    brightGreen: "#9ece6a",
    brightYellow: "#e0af68",
    brightBlue: "#7aa2f7",
    brightMagenta: "#bb9af7",
    brightCyan: "#b4f9f8",
    brightWhite: "#c0caf5",
  },
  oneDark: {
    name: "One Dark",
    background: "#282c34",
    foreground: "#abb2bf",
    cursor: "#528bff",
    cursorAccent: "#282c34",
    selectionBackground: "#3e4451",
    black: "#282c34",
    red: "#e06c75",
    green: "#98c379",
    yellow: "#e5c07b",
    blue: "#61afef",
    magenta: "#c678dd",
    cyan: "#56b6c2",
    white: "#abb2bf",
    brightBlack: "#5c6370",
    brightRed: "#e06c75",
    brightGreen: "#98c379",
    brightYellow: "#e5c07b",
    brightBlue: "#61afef",
    brightMagenta: "#c678dd",
    brightCyan: "#56b6c2",
    brightWhite: "#ffffff",
  },
};

export function getTheme(name: string): TerminalTheme {
  return themes[name] || themes.classic;
}

const STORAGE_KEY = "linuxcourse-terminal-theme";

export function loadTheme(): string {
  if (typeof window === "undefined") return "classic";
  try {
    return localStorage.getItem(STORAGE_KEY) || "classic";
  } catch {
    return "classic";
  }
}

export function saveTheme(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {}
}