"use client";

export type VfsNode = {
  type: "file" | "dir";
  content?: string;
  mode?: string;
  owner?: string;
  group?: string;
  size?: number;
  children?: Record<string, VfsNode>;
};

export const ENV: Record<string, string> = {
  PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
  HOME: "/home/user",
  USER: "user",
  SHELL: "/bin/bash",
  TERM: "xterm-256color",
  LANG: "es_ES.UTF-8",
  EDITOR: "vim",
};

export const ALIASES: Record<string, string> = {
  ll: "ls -la",
  la: "ls -a",
};

export let EXIT_CODE = 0;

export function setExitCode(code: number) {
  EXIT_CODE = code;
}

export function expandVars(s: string): string {
  if (!s.includes("$")) return s;
  return s.replace(
    /\$(\w+|\$|\?)/g,
    (match, varName) => {
      if (varName === "?") return String(EXIT_CODE);
      if (varName === "$") return "1234";
      return ENV[varName] ?? "";
    }
  );
}

const VFS: Record<string, VfsNode> = {
  "/": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/home": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/boot": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/boot/vmlinuz-6.8.0-arch1-1": { type: "file", content: "", mode: "-rw-r--r--", owner: "root", group: "root", size: 12345678 },
  "/opt": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/srv": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/run": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/lost+found": { type: "dir", mode: "drwx------", owner: "root", group: "root", children: {} },
  "/home/user": { type: "dir", mode: "drwxr-xr-x", owner: "user", group: "user", children: {} },
  "/home/user/Documents": { type: "dir", mode: "drwxr-xr-x", owner: "user", group: "user", children: {} },
  "/home/user/Downloads": { type: "dir", mode: "drwxr-xr-x", owner: "user", group: "user", children: {} },
  "/home/user/projects": { type: "dir", mode: "drwxr-xr-x", owner: "user", group: "user", children: {} },
  "/home/user/file.txt": { type: "file", content: "Hello, this is a sample file.\nIt contains some text.\n", mode: "-rw-r--r--", owner: "user", group: "user", size: 52 },
  "/home/user/script.sh": { type: "file", content: "#!/bin/bash\necho 'Hello, World!'\n", mode: "-rwxr-xr-x", owner: "user", group: "user", size: 36 },
  "/home/user/config.conf": { type: "file", content: "# Configuration file\nPORT=8080\nHOST=localhost\nDEBUG=true\n", mode: "-rw-r--r--", owner: "user", group: "user", size: 56 },
  "/home/user/.bashrc": { type: "file", content: "# ~/.bashrc\nalias ll='ls -la'\nexport PS1='\\u@\\h:\\w$ '\n", mode: "-rw-r--r--", owner: "user", group: "user", size: 72 },
  "/home/user/.profile": { type: "file", content: "# ~/.profile\nif [ -n \"$BASH_VERSION\" ]; then\n  if [ -f \"$HOME/.bashrc\" ]; then\n    . \"$HOME/.bashrc\"\n  fi\nfi\n", mode: "-rw-r--r--", owner: "user", group: "user", size: 110 },
  "/etc": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/etc/passwd": { type: "file", content: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\nirc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin\ngnats:x:41:41:Gnats Bug-Reporting System:/var/lib/gnats:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin\nsystemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin\nmessagebus:x:103:106::/nonexistent:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\n_apt:x:105:65534::/nonexistent:/usr/sbin/nologin\ntss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false\nuuidd:x:107:112::/run/uuidd:/usr/sbin/nologin\ntcpdump:x:108:113::/nonexistent:/usr/sbin/nologin\nsshd:x:109:65534::/run/sshd:/usr/sbin/nologin\npollinate:x:110:1::/var/cache/pollinate:/bin/false\nusbmux:x:111:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin\nuser:x:1000:1000:Usuario:/home/user:/bin/bash\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 1401 },
  "/etc/shadow": { type: "file", content: "root:$y$j9T$...:18900:0:90:7:::\ndaemon:*:18900:0:90:7:::\nuser:$y$j9T$...:18900:0:90:7:::\n", mode: "-rw-------", owner: "root", group: "root", size: 105 },
  "/etc/group": { type: "file", content: "root:x:0:\ndaemon:x:1:\nuser:x:1000:\nwheel:x:10:user\nsudo:x:27:user\ndocker:x:999:user\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 78 },
  "/etc/hostname": { type: "file", content: "linuxcourse\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 12 },
  "/etc/hosts": { type: "file", content: "127.0.0.1\tlocalhost\n127.0.1.1\tlinuxcourse\n::1\t\tlocalhost ip6-localhost ip6-loopback\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 96 },
  "/etc/resolv.conf": { type: "file", content: "nameserver 8.8.8.8\nnameserver 8.8.4.4\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 44 },
  "/etc/fstab": { type: "file", content: "UUID=abc-123 / ext4 defaults 0 1\nUUID=def-456 /home ext4 defaults 0 2\nUUID=ghi-789 swap swap defaults 0 0\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 100 },
  "/etc/nginx": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/etc/nginx/nginx.conf": { type: "file", content: "user www-data;\nworker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  server {\n    listen 80;\n    root /var/www/html;\n  }\n}\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 176 },
  "/etc/apt": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/etc/apt/sources.list": { type: "file", content: "deb http://archive.ubuntu.com/ubuntu noble main restricted\ndeb http://archive.ubuntu.com/ubuntu noble-updates main restricted\ndeb http://security.ubuntu.com/ubuntu noble-security main restricted\n", mode: "-rw-r--r--", owner: "root", group: "root", size: 197 },
  "/bin": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/bin/ls": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 142312 },
  "/bin/cat": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 36200 },
  "/bin/echo": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 18256 },
  "/bin/bash": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 1342216 },
  "/bin/cp": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 157960 },
  "/bin/mv": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 167144 },
  "/bin/rm": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 72568 },
  "/bin/mkdir": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 69560 },
  "/bin/touch": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 56248 },
  "/bin/pwd": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 34680 },
  "/bin/grep": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 283296 },
  "/bin/find": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 332200 },
  "/bin/gunzip": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 32728 },
  "/bin/tar": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 449928 },
  "/sbin": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/sbin/init": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 24576 },
  "/sbin/fdisk": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 210944 },
  "/sbin/mkfs.ext4": { type: "file", content: "", mode: "-rwxr-xr-x", owner: "root", group: "root", size: 102400 },
  "/usr": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/usr/bin": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/usr/lib": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/usr/local": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/usr/share": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/usr/share/man": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/var": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/var/log": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/var/www": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/var/www/html": { type: "dir", mode: "drwxr-xr-x", owner: "www-data", group: "www-data", children: {} },
  "/var/www/html/index.html": { type: "file", content: "<html><body><h1>Bienvenido a LinuxCourse</h1></body></html>\n", mode: "-rw-r--r--", owner: "www-data", group: "www-data", size: 62 },
  "/var/log/nginx": { type: "dir", mode: "drwxr-xr-x", owner: "www-data", group: "www-data", children: {} },
  "/var/log/nginx/access.log": { type: "file", content: "192.168.1.10 - - [12/Jun/2026:10:00:00 +0000] \"GET / HTTP/1.1\" 200 1234\n192.168.1.20 - - [12/Jun/2026:10:00:05 +0000] \"GET /index.html HTTP/1.1\" 200 5678\n", mode: "-rw-r--r--", owner: "www-data", group: "www-data", size: 160 },
  "/var/log/nginx/error.log": { type: "file", content: "2026/06/12 10:00:01 [notice] 1234#1234: worker process 5678 started\n2026/06/12 10:00:02 [error] 5678#5678: *1 open() \"/var/www/html/notfound.html\" failed (2: No such file)\n", mode: "-rw-r--r--", owner: "www-data", group: "www-data", size: 192 },
  "/tmp": { type: "dir", mode: "drwxrwxrwt", owner: "root", group: "root", children: {} },
  "/root": { type: "dir", mode: "drwx------", owner: "root", group: "root", children: {} },
  "/dev": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/dev/null": { type: "file", content: "", mode: "crw-rw-rw-", owner: "root", group: "root", size: 0 },
  "/dev/zero": { type: "file", content: "", mode: "crw-rw-rw-", owner: "root", group: "root", size: 0 },
  "/dev/random": { type: "file", content: "", mode: "crw-rw-rw-", owner: "root", group: "root", size: 0 },
  "/dev/sda": { type: "file", content: "", mode: "brw-rw----", owner: "root", group: "disk", size: 0 },
  "/dev/sda1": { type: "file", content: "", mode: "brw-rw----", owner: "root", group: "disk", size: 0 },
  "/dev/sda2": { type: "file", content: "", mode: "brw-rw----", owner: "root", group: "disk", size: 0 },
  "/dev/sda3": { type: "file", content: "", mode: "brw-rw----", owner: "root", group: "disk", size: 0 },
  "/dev/pts": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/dev/pts/0": { type: "file", content: "", mode: "crw--w----", owner: "user", group: "tty", size: 0 },
  "/proc": { type: "dir", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
  "/proc/cpuinfo": { type: "file", content: "processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-10750H CPU @ 2.60GHz\ncpu cores\t: 6\n", mode: "-r--r--r--", owner: "root", group: "root", size: 4096 },
  "/proc/meminfo": { type: "file", content: "MemTotal:       16382892 kB\nMemFree:         4234567 kB\nMemAvailable:   10234567 kB\n", mode: "-r--r--r--", owner: "root", group: "root", size: 4096 },
  "/proc/version": { type: "file", content: "Linux version 6.8.0-arch1-1 (linux@archlinux) (gcc 14.1.1) #1 SMP PREEMPT_DYNAMIC\n", mode: "-r--r--r--", owner: "root", group: "root", size: 256 },
  "/proc/uptime": { type: "file", content: "90012.34 123456.78\n", mode: "-r--r--r--", owner: "root", group: "root", size: 128 },
  "/proc/1": { type: "dir", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
  "/proc/1/cmdline": { type: "file", content: "/sbin/init\x00", mode: "-r--r--r--", owner: "root", group: "root", size: 0 },
  "/proc/self": { type: "dir", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
  "/sys": { type: "dir", mode: "dr-xr-xr-x", owner: "root", group: "root", children: {} },
  "/mnt": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
  "/media": { type: "dir", mode: "drwxr-xr-x", owner: "root", group: "root", children: {} },
};

for (const key of Object.keys(VFS)) {
  if (key === "/") continue;
  const parentPath = key.substring(0, key.lastIndexOf("/")) || "/";
  const name = key.split("/").pop() || "";
  const parent = VFS[parentPath];
  if (parent?.type === "dir") {
    parent.children![name] = VFS[key];
  }
}

export function listDir(path: string): string[] {
  const node = VFS[path];
  if (!node || node.type !== "dir") return [];
  return Object.keys(node.children || {});
}

export function joinPath(base: string, rel: string): string {
  if (rel.startsWith("/")) return normalizePath(rel);
  if (rel === "..") {
    const parts = base.replace(/\/$/, "").split("/");
    parts.pop();
    return parts.join("/") || "/";
  }
  if (rel === ".") return base;
  return normalizePath(`${base}/${rel}`);
}

export function normalizePath(p: string): string {
  p = p.replace(/\/+/g, "/");
  if (p === "") return "/";
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

export function formatEntry(name: string, node: VfsNode, long: boolean): string {
  if (!long) return name;
  const mode = node.mode || (node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--");
  const owner = node.owner || "user";
  const group = node.group || "user";
  const size = node.size || (node.type === "dir" ? 4096 : 0);
  const date = "Jun 12 10:00";
  return `${mode} ${owner.padEnd(8)} ${group.padEnd(8)} ${String(size).padStart(5)} ${date} ${name}`;
}

export let CWD = "/home/user";
export let OLDPWD = "/home/user";
export { VFS };

export function setCWD(v: string) { CWD = v; }
export function setOLDPWD(v: string) { OLDPWD = v; }

// setCWD / setOLDPWD defined above
