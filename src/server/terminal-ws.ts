import { WebSocketServer, WebSocket } from "ws";
import * as pty from "node-pty";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as url from "url";

const PORT = parseInt(process.env.TERMINAL_WS_PORT || "3001", 10);
const WS_TOKEN = process.env.TERMINAL_WS_TOKEN || "";
const HOME = path.join(os.tmpdir(), "linuxcourse-home");

function ensureHome(): void {
  if (!fs.existsSync(HOME)) {
    fs.mkdirSync(HOME, { recursive: true });
    fs.writeFileSync(path.join(HOME, "file.txt"), "Hello, this is a sample file.\nIt contains some text.\n");
    fs.writeFileSync(path.join(HOME, "script.sh"), "#!/bin/bash\necho 'Hello, World!'\n");
    fs.writeFileSync(path.join(HOME, "config.conf"), "# Configuration file\nPORT=8080\nHOST=localhost\nDEBUG=true\n");
    fs.writeFileSync(path.join(HOME, ".bashrc"), "# ~/.bashrc\nalias ll='ls -la'\nexport PS1='\\u@\\h:\\w\\$ '\n");
    fs.writeFileSync(path.join(HOME, ".profile"), "# ~/.profile\nif [ -n \"$BASH_VERSION\" ]; then\n  if [ -f \"$HOME/.bashrc\" ]; then\n    . \"$HOME/.bashrc\"\n  fi\nfi\n");
    fs.mkdirSync(path.join(HOME, "Documents"), { recursive: true });
    fs.mkdirSync(path.join(HOME, "Downloads"), { recursive: true });
    fs.mkdirSync(path.join(HOME, "projects"), { recursive: true });
    try { fs.chmodSync(path.join(HOME, "script.sh"), "755"); } catch {}
  }
}

function start(): void {
  ensureHome();

  const wss = new WebSocketServer({ port: PORT });
  console.log(`[terminal-ws] WebSocket server listening on ws://localhost:${PORT}`);

  wss.on("connection", (ws: WebSocket, req) => {
    const parsed = url.parse(req.url || "", true);
    const token = parsed.query.token as string;

    if (WS_TOKEN && token !== WS_TOKEN) {
      console.warn("[terminal-ws] Unauthorized connection attempt — closing");
      ws.close(4001, "Unauthorized");
      return;
    }

    const shell = pty.spawn("bash", [], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: HOME,
      env: {
        ...process.env,
        HOME,
        USER: "user",
        TERM: "xterm-256color",
        PS1: "\\[\\e[32m\\]\\u@\\h:\\w\\$ \\[\\e[0m\\]",
      },
    });

    shell.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    ws.on("message", (data: Buffer) => {
      const msg = data.toString();
      if (msg.startsWith("{")) {
        try {
          const json = JSON.parse(msg);
          if (json.type === "resize" && json.cols && json.rows) {
            shell.resize(json.cols, json.rows);
          }
        } catch {}
      } else {
        shell.write(msg);
      }
    });

    ws.on("close", () => {
      shell.kill();
    });
  });

  wss.on("error", (err: Error) => {
    console.error("[terminal-ws] Server error:", err.message);
  });
}

start();
