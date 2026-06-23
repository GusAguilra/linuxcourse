"use client";

import { VFS, CWD, OLDPWD, ENV, ALIASES, joinPath, normalizePath, listDir, formatEntry, expandVars, setCWD, setOLDPWD } from "./vfs";

type CmdFn = (args: string[], stdin?: string, history?: string[]) => string;

const DIR_COLOR = "\x1b[1;34m";
const EXE_COLOR = "\x1b[1;32m";
const RESET = "\x1b[0m";

function ls(args: string[], _stdin?: string): string { // eslint-disable-line @typescript-eslint/no-unused-vars
  const flags = args.filter((a) => a.startsWith("-"));
  const long = flags.includes("-l") || flags.includes("-la") || flags.includes("-al");
  const all = flags.includes("-a") || flags.includes("-la") || flags.includes("-al");
  const color = flags.includes("--color=auto");
  const targetRaw = args.find((a) => !a.startsWith("-")) || ".";
  const path = normalizePath(joinPath(CWD, targetRaw));

  const node = VFS[path];
  if (!node) return `ls: cannot access '${targetRaw}': No such file or directory`;
  if (node.type === "file") {
    return long ? formatEntry(targetRaw, node, true) : targetRaw;
  }

  const entries = listDir(path);
  let result = entries.map((name) => ({ name, node: (VFS[path].children || {})[name] }));
  if (!all) result = result.filter((e) => !e.name.startsWith("."));
  if (result.length === 0) return "";

  if (long) {
    return result.map((e) => formatEntry(e.name, e.node, true)).join("\r\n");
  }

  if (color) {
    return result
      .map((e) => {
        const n = e.node;
        if (!n) return e.name;
        if (n.type === "dir") return `${DIR_COLOR}${e.name}${RESET}`;
        if (n.mode?.includes("x")) return `${EXE_COLOR}${e.name}${RESET}`;
        return e.name;
      })
      .join("  ");
  }

  return result.map((e) => e.name).join("  ");
}

function cat(args: string[], stdin?: string): string {
  if (args.length === 0 && stdin !== undefined) return stdin;
  if (args.length === 0) return "cat: missing operand";
  const path = normalizePath(joinPath(CWD, args[0]));
  const node = VFS[path];
  if (!node) return `cat: ${args[0]}: No such file or directory`;
  if (node.type === "dir") return `cat: ${args[0]}: Is a directory`;
  return node.content || "";
}

function find(args: string[]): string {
  const nameIdx = args.indexOf("-name");
  const hasPattern = nameIdx !== -1 && nameIdx + 1 < args.length;
  const pathArg = args.find((a) => !a.startsWith("-") && a !== args[nameIdx + 1]) || ".";
  const path = normalizePath(joinPath(CWD, pathArg));
  const node = VFS[path];
  if (!node) return `find: '${pathArg}': No such file or directory`;
  const results: string[] = [];
  function walk(p: string) {
    const dir = VFS[p];
    if (!dir?.children) return;
    for (const [name, child] of Object.entries(dir.children)) {
      const fullPath = `${p}/${name}`;
      results.push(fullPath);
      if (child.type === "dir") walk(fullPath);
    }
  }
  if (hasPattern) {
    const raw = args[nameIdx + 1].replace(/['"]/g, "");
    const pattern = "^" + raw.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
    const regex = new RegExp(pattern);
    function walkPattern(p: string) {
      const dir = VFS[p];
      if (!dir?.children) return;
      for (const [name, child] of Object.entries(dir.children)) {
        const fullPath = `${p}/${name}`;
        if (regex.test(name)) results.push(fullPath);
        if (child.type === "dir") walkPattern(fullPath);
      }
    }
    walkPattern(path);
    return results.join("\r\n") || "";
  }
  walk(path);
  return results.join("\r\n");
}

function grep(args: string[], stdin?: string): string {
  const flags = args.filter((a) => a.startsWith("-"));
  const nonFlags = args.filter((a) => !a.startsWith("-"));
  const pattern = nonFlags[0];
  if (!pattern && stdin !== undefined) return "";
  if (!pattern) return "grep: missing pattern";
  const fileArg = nonFlags[1];

  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `grep: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "grep: missing file";
  }

  const lines = content.split("\n");
  const regex = new RegExp(pattern.replace(/['"]/g, ""), flags.includes("-i") ? "i" : "");
  const invert = flags.includes("-v");
  return lines
    .map((line, i) => (invert ? !regex.test(line) : regex.test(line)) ? `${fileArg ?? ""}:${i + 1}:${line}` : null)
    .filter(Boolean)
    .join("\r\n");
}

function wc(args: string[], stdin?: string): string {
  const onlyLines = args.includes("-l");
  const fileArg = args.find((a) => !a.startsWith("-"));

  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `wc: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "wc: missing operand";
  }

  const lines = content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
  if (onlyLines) return `${lines} ${fileArg ?? ""}`.trim();
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const label = fileArg ?? "";
  return `${lines} ${words} ${chars} ${label}`.trim();
}

function head(args: string[], stdin?: string): string {
  const nFlag = args.indexOf("-n");
  const n = nFlag !== -1 ? parseInt(args[nFlag + 1]) || 10 : 10;
  const fileArg = args.find((a) => !a.startsWith("-"));

  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `head: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "head: missing operand";
  }

  return content.split("\n").slice(0, n).join("\n");
}

function tail(args: string[], stdin?: string): string {
  const nFlag = args.indexOf("-n");
  const n = nFlag !== -1 ? parseInt(args[nFlag + 1]) || 10 : 10;
  const follow = args.includes("-f");
  const fileArg = args.find((a) => !a.startsWith("-"));

  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `tail: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "tail: missing operand";
  }

  const lines = content.split("\n");
  return lines.slice(-n).join("\n") + (follow ? "\r\n\n[Siguiendo... Ctrl+C para salir]" : "");
}

function sortCmd(args: string[], stdin?: string): string {
  const fileArg = args.find((a) => !a.startsWith("-"));
  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `sort: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "sort: missing operand";
  }
  return content.split("\n").filter(Boolean).sort().join("\n");
}

function uniqCmd(args: string[], stdin?: string): string {
  const fileArg = args.find((a) => !a.startsWith("-"));
  let content: string;
  if (fileArg) {
    const path = normalizePath(joinPath(CWD, fileArg));
    const node = VFS[path];
    if (!node || node.type !== "file") return `uniq: ${fileArg}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "uniq: missing operand";
  }
  return [...new Set(content.split("\n").filter(Boolean))].join("\n");
}

function which(args: string[]): string {
  if (args.length === 0) return "";
  const bins = ["/bin", "/usr/bin", "/usr/local/bin", "/sbin", "/usr/sbin"];
  for (const b of bins) {
    const dir = VFS[b];
    if (dir?.children?.[args[0]]) return `${b}/${args[0]}`;
  }
  if (COMMANDS[args[0]] || EXTERNAL_ALIASES[args[0]]) return `${args[0]}`;
  return `${args[0]} no encontrado`;
}

const MAN_PAGES: Record<string, string> = {
  ls: "ls - list directory contents\n\nSYNOPSIS\n  ls [OPTIONS] [PATH...]\n\nDESCRIPTION\n  Displays the contents of the specified directory.\n  If no path is specified, shows the current directory.\n\nOPTIONS\n  -l, --format=long   detailed format\n  -a, --all           includes entries starting with .\n  -la, -al           combines -l and -a\n  --color=auto        colorizes the output\n\nEXAMPLES\n  ls -la\n  ls --color=auto /home/user\n  ls -l /etc",
  cd: "cd - change directory\n\nSYNOPSIS\n  cd [DIRECTORY]\n\nDESCRIPTION\n  Changes the current directory to DIRECTORY.\n  If not specified, changes to $HOME.\n  Use 'cd -' to return to the previous directory.\n\nEXAMPLES\n  cd /etc/nginx\n  cd ~/Documents\n  cd -",
  pwd: "pwd - show current directory\n\nSYNOPSIS\n  pwd\n\nDESCRIPTION\n  Prints the full path of the current working directory.",
  mkdir: "mkdir - create directories\n\nSYNOPSIS\n  mkdir DIRECTORY...\n\nDESCRIPTION\n  Creates one or more directories.\n\nEXAMPLES\n  mkdir new-folder\n  mkdir projects/my-app",
  touch: "touch - change file timestamps\n\nSYNOPSIS\n  touch FILE...\n\nDESCRIPTION\n  Creates empty files or updates their timestamp.\n\nEXAMPLES\n  touch index.html\n  touch file1.txt file2.txt",
  cp: "cp - copy files\n\nSYNOPSIS\n  cp SOURCE DESTINATION\n\nDESCRIPTION\n  Copies SOURCE to DESTINATION.\n\nEXAMPLES\n  cp file.txt backup.txt\n  cp /etc/hosts .",
  mv: "mv - move/rename files\n\nSYNOPSIS\n  mv SOURCE DESTINATION\n\nDESCRIPTION\n  Moves SOURCE to DESTINATION. Also used to rename.\n\nEXAMPLES\n  mv old.txt new.txt\n  mv file.txt /tmp/",
  rm: "rm - remove files or directories\n\nSYNOPSIS\n  rm [OPTIONS] FILE...\n\nDESCRIPTION\n  Removes files. For directories use -r.\n\nOPTIONS\n  -r   recursive (for directories)\n  -f   force (no prompt)\n  -rf  combines -r and -f\n\nEXAMPLES\n  rm file.txt\n  rm -rf /tmp/cache",
  cat: "cat - concatenate files and show their content\n\nSYNOPSIS\n  cat [FILE]\n\nDESCRIPTION\n  Shows the content of FILE. Without arguments,\n  reads from standard input.\n\nEXAMPLES\n  cat /etc/hosts\n  cat file.txt\n  echo \"hello\" | cat",
  echo: "echo - print text\n\nSYNOPSIS\n  echo [TEXT...]\n\nDESCRIPTION\n  Displays the text on standard output.\n  Supports variable expansion ($VAR).\n\nEXAMPLES\n  echo Hello World\n  echo $HOME\n  echo \"My path: $PATH\"",
  whoami: "whoami - show current username\n\nSYNOPSIS\n  whoami\n\nDESCRIPTION\n  Shows the current username.",
  uname: "uname - system information\n\nSYNOPSIS\n  uname [OPTIONS]\n\nOPTIONS\n  -a   all information\n  -r   kernel version\n\nDESCRIPTION\n  Displays operating system information.",
  clear: "clear - clear the terminal\n\nSYNOPSIS\n  clear\n\nDESCRIPTION\n  Clears the terminal screen.",
  history: "history - show command history\n\nSYNOPSIS\n  history [n]\n\nDESCRIPTION\n  Displays the command history. Also\n  navigated with up/down arrow keys.",
  grep: "grep - search patterns in files\n\nSYNOPSIS\n  grep [OPTIONS] PATTERN [FILE...]\n\nDESCRIPTION\n  Searches for PATTERN in FILE or in standard input.\n\nOPTIONS\n  -i   ignore case\n  -v   invert match\n\nEXAMPLES\n  grep root /etc/passwd\n  ls -la | grep \"\\.txt$\"\n  grep -i error /var/log/nginx/error.log",
  find: "find - search files in directory hierarchy\n\nSYNOPSIS\n  find [PATH] -name PATTERN\n\nDESCRIPTION\n  Finds files matching the pattern.\n\nEXAMPLES\n  find /etc -name \"*.conf\"\n  find . -name \"*.txt\"",
  head: "head - show the first lines of a file\n\nSYNOPSIS\n  head [-n N] [FILE...]\n\nDESCRIPTION\n  Shows the first 10 lines (or N with -n).\n\nEXAMPLES\n  head /etc/passwd\n  head -n 5 /etc/hosts",
  tail: "tail - show the last lines of a file\n\nSYNOPSIS\n  tail [-n N] [FILE...]\n\nDESCRIPTION\n  Shows the last 10 lines (or N with -n).\n\nEXAMPLES\n  tail /var/log/nginx/access.log\n  tail -n 100 /var/log/syslog",
  wc: "wc - count lines, words and characters\n\nSYNOPSIS\n  wc [OPTIONS] [FILE...]\n\nOPTIONS\n  -l   lines only\n\nEXAMPLES\n  wc /etc/hosts\n  cat file.txt | wc -l",
  sort: "sort - sort lines of files\n\nSYNOPSIS\n  sort [FILE...]\n\nDESCRIPTION\n  Sorts the lines alphabetically.\n\nEXAMPLES\n  sort /etc/hosts\n  cat words.txt | sort",
  uniq: "uniq - remove duplicate lines\n\nSYNOPSIS\n  uniq [FILE...]\n\nEXAMPLES\n  uniq sorted.txt\n  sort file.txt | uniq",
  which: "which - locate a command\n\nSYNOPSIS\n  which COMMAND\n\nDESCRIPTION\n  Shows the full path of the command.\n\nEXAMPLES\n  which ls\n  which bash",
  chmod: "chmod - change file permissions\n\nSYNOPSIS\n  chmod MODE FILE\n\nDESCRIPTION\n  Changes the permissions of FILE.\n  Mode can be octal (755) or symbolic (u+x).\n\nEXAMPLES\n  chmod 755 script.sh\n  chmod u+x file.sh\n  chmod g-w file.txt",
  chown: "chown - change file owner\n\nSYNOPSIS\n  chown USER[:GROUP] FILE\n\nEXAMPLES\n  chown user file.txt\n  chown user:admin file.txt",
  chgrp: "chgrp - change file group\n\nSYNOPSIS\n  chgrp GROUP FILE\n\nEXAMPLES\n  chgrp www-data /var/www/index.html",
  ps: "ps - show processes\n\nSYNOPSIS\n  ps [OPTIONS]\n\nOPTIONS\n  aux   detailed BSD format\n  -ef   detailed standard format\n\nEXAMPLES\n  ps\n  ps aux",
  kill: "kill - send signals to processes\n\nSYNOPSIS\n  kill [-l] [PID...]\n\nDESCRIPTION\n  Sends a signal to a process.\n\nEXAMPLES\n  kill 1234\n  kill -l",
  df: "df - show disk space\n\nSYNOPSIS\n  df [-h]\n\nOPTIONS\n  -h   human-readable format\n\nEXAMPLES\n  df\n  df -h",
  du: "du - estimate disk usage\n\nSYNOPSIS\n  du [-sh] [PATH...]\n\nEXAMPLES\n  du -sh ~\n  du /home/user/Documents",
  ip: "ip - show/configure network interfaces\n\nSYNOPSIS\n  ip [addr|link|route|neigh]\n\nEXAMPLES\n  ip addr\n  ip link\n  ip route",
  ping: "ping - test connectivity\n\nSYNOPSIS\n  ping [-c N] DESTINATION\n\nDESCRIPTION\n  Sends ICMP packets to DESTINATION.\n\nEXAMPLES\n  ping google.com\n  ping -c 4 8.8.8.8",
  ss: "ss - show sockets\n\nSYNOPSIS\n  ss [-tulpn]\n\nEXAMPLES\n  ss -tulpn",
  curl: "curl - transfer data with URL\n\nSYNOPSIS\n  curl [-I] URL\n\nEXAMPLES\n  curl https://example.com\n  curl -I https://google.com",
  wget: "wget - download files\n\nSYNOPSIS\n  wget URL\n\nEXAMPLES\n  wget https://example.com/file.zip",
  apt: "apt - Debian/Ubuntu package manager\n\nSYNOPSIS\n  apt [update|install|remove|search|show|list]\n\nEXAMPLES\n  apt update\n  apt install nginx\n  apt search server",
  dpkg: "dpkg - low-level Debian package manager\n\nSYNOPSIS\n  dpkg [-i|-r|-l|-L|-S] [PACKAGE...]\n\nEXAMPLES\n  dpkg -l\n  dpkg -i package.deb",
  dnf: "dnf - RHEL/Fedora package manager\n\nSYNOPSIS\n  dnf [install|remove|search|update|info] [PACKAGE]\n\nEXAMPLES\n  dnf install nginx\n  dnf update\n  dnf search server",
  rpm: "rpm - low-level RPM package manager\n\nSYNOPSIS\n  rpm [-qa|-ql|-qf|-qi|-ivh|-e] [PACKAGE...]\n\nEXAMPLES\n  rpm -qa\n  rpm -ivh package.rpm",
  systemctl: "systemctl - manage systemd services\n\nSYNOPSIS\n  systemctl [status|start|stop|restart|enable|disable] SERVICE\n\nEXAMPLES\n  systemctl status nginx\n  systemctl enable sshd\n  systemctl start nginx",
  journalctl: "journalctl - query systemd logs\n\nSYNOPSIS\n  journalctl [-u UNIT] [-n N] [-f]\n\nEXAMPLES\n  journalctl -u nginx -n 20\n  journalctl -f",
  sudo: "sudo - execute commands as superuser\n\nSYNOPSIS\n  sudo COMMAND [ARGUMENTS...]\n\nDESCRIPTION\n  Executes COMMAND with root privileges.\n\nEXAMPLES\n  sudo systemctl restart nginx\n  sudo apt update",
  useradd: "useradd - create user\n\nSYNOPSIS\n  useradd USER\n\nEXAMPLES\n  useradd juan",
  usermod: "usermod - modify user\n\nSYNOPSIS\n  usermod [OPTIONS] USER\n\nEXAMPLES\n  usermod -aG sudo juan",
  userdel: "userdel - delete user\n\nSYNOPSIS\n  userdel USER\n\nEXAMPLES\n  userdel juan",
  passwd: "passwd - change password\n\nSYNOPSIS\n  passwd [USER]\n\nDESCRIPTION\n  Changes the user password.\n\nEXAMPLES\n  passwd",
  groups: "groups - show user groups\n\nSYNOPSIS\n  groups [USER]\n\nEXAMPLES\n  groups\n  groups juan",
  id: "id - show user identity\n\nSYNOPSIS\n  id\n\nDESCRIPTION\n  Shows UID, GID and user groups.",
  who: "who - show who is logged in\n\nSYNOPSIS\n  who\n\nDESCRIPTION\n  Shows currently logged in users.",
  w: "w - show who is logged in and what they do\n\nSYNOPSIS\n  w",
  last: "last - show last logins\n\nSYNOPSIS\n  last\n\nEXAMPLES\n  last",
  lsblk: "lsblk - list block devices\n\nSYNOPSIS\n  lsblk\n\nEXAMPLES\n  lsblk",
  blkid: "blkid - show device UUIDs\n\nSYNOPSIS\n  blkid\n\nEXAMPLES\n  blkid",
  mount: "mount - mount filesystems\n\nSYNOPSIS\n  mount [DEVICE] [MOUNT_POINT]\n\nEXAMPLES\n  mount /dev/sdb1 /data",
  umount: "umount - unmount filesystems\n\nSYNOPSIS\n  umount [MOUNT_POINT|DEVICE]\n\nEXAMPLES\n  umount /data",
  findmnt: "findmnt - show mount tree\n\nSYNOPSIS\n  findmnt",
  mkfs: "mkfs - create filesystem\n\nSYNOPSIS\n  mkfs.DEVICE\n\nEXAMPLES\n  mkfs.ext4 /dev/sdb1",
  ifconfig: "ifconfig - configure network interface\n\nSYNOPSIS\n  ifconfig [INTERFACE]\n\nEXAMPLES\n  ifconfig\n  ifconfig eth0",
  route: "route - show routing table\n\nSYNOPSIS\n  route\n\nEXAMPLES\n  route",
  netstat: "netstat - show network connections\n\nSYNOPSIS\n  netstat [-tulpn]\n\nEXAMPLES\n  netstat -tulpn",
  traceroute: "traceroute - trace route to a host\n\nSYNOPSIS\n  traceroute DESTINATION\n\nEXAMPLES\n  traceroute google.com",
  host: "host - resolve DNS names\n\nSYNOPSIS\n  host NAME\n\nEXAMPLES\n  host google.com",
  nslookup: "nslookup - query DNS\n\nSYNOPSIS\n  nslookup NAME\n\nEXAMPLES\n  nslookup google.com",
  dig: "dig - detailed DNS tool\n\nSYNOPSIS\n  dig [NAME]\n\nEXAMPLES\n  dig google.com",
  "firewall-cmd": "firewall-cmd - RHEL/Fedora firewall\n\nSYNOPSIS\n  firewall-cmd --list-all\n  firewall-cmd --add-service=SERVICE\n\nEXAMPLES\n  firewall-cmd --list-all\n  firewall-cmd --add-service=http",
  ufw: "ufw - Debian/Ubuntu firewall\n\nSYNOPSIS\n  ufw [enable|disable|status|allow|deny]\n\nEXAMPLES\n  ufw enable\n  ufw allow 22/tcp\n  ufw status verbose",
  iptables: "iptables - Linux firewall\n\nSYNOPSIS\n  iptables [-L|-A|-D]\n\nEXAMPLES\n  iptables -L",
  getenforce: "getenforce - show SELinux mode\n\nSYNOPSIS\n  getenforce\n\nDESCRIPTION\n  Shows whether SELinux is in enforcing, permissive or disabled mode.",
  setenforce: "setenforce - change SELinux mode\n\nSYNOPSIS\n  setenforce [Enforcing|Permissive]",
  sestatus: "sestatus - SELinux status\n\nSYNOPSIS\n  sestatus\n\nEXAMPLES\n  sestatus",
  env: "env - show environment variables\n\nSYNOPSIS\n  env\n\nDESCRIPTION\n  Shows all environment variables.",
  export: "export - set environment variable\n\nSYNOPSIS\n  export NAME=VALUE\n\nEXAMPLES\n  export MY_VAR=hello\n  export PATH=\\$PATH:/my/path",
  set: "set - show shell variables\n\nSYNOPSIS\n  set\n\nDESCRIPTION\n  Shows all shell variables.",
  unset: "unset - unset variable\n\nSYNOPSIS\n  unset NAME\n\nEXAMPLES\n  unset MY_VAR",
  type: "type - show command type\n\nSYNOPSIS\n  type COMMAND\n\nEXAMPLES\n  type ls\n  type cd",
  alias: "alias - define/show aliases\n\nSYNOPSIS\n  alias [NAME=VALUE]\n\nEXAMPLES\n  alias\n  alias ll='ls -la'",
  unalias: "unalias - remove alias\n\nSYNOPSIS\n  unalias NAME\n\nEXAMPLES\n  unalias ll",
  tree: "tree - show directory tree\n\nSYNOPSIS\n  tree [PATH]\n\nEXAMPLES\n  tree\n  tree /etc",
  file: "file - determine file type\n\nSYNOPSIS\n  file FILE...\n\nEXAMPLES\n  file /bin/bash\n  file /etc",
  stat: "stat - show file status\n\nSYNOPSIS\n  stat FILE\n\nEXAMPLES\n  stat /etc/hosts\n  stat script.sh",
  less: "less - pager\n\nSYNOPSIS\n  less FILE\n\nEXAMPLES\n  less /etc/hosts",
  more: "more - pager\n\nSYNOPSIS\n  more FILE\n\nEXAMPLES\n  more /etc/hosts",
  whereis: "whereis - locate binaries, sources and manuals\n\nSYNOPSIS\n  whereis COMMAND\n\nEXAMPLES\n  whereis ls",
  killall: "killall - kill processes by name\n\nSYNOPSIS\n  killall NAME\n\nEXAMPLES\n  killall nginx",
  jobs: "jobs - list jobs\n\nSYNOPSIS\n  jobs",
  bg: "bg - resume job in background\n\nSYNOPSIS\n  bg [%N]",
  fg: "fg - resume job in foreground\n\nSYNOPSIS\n  fg [%N]",
  gpasswd: "gpasswd - administer groups\n\nSYNOPSIS\n  gpasswd [OPTIONS] GROUP",
  chage: "chage - change password expiration information\n\nSYNOPSIS\n  chage -l USER\n\nEXAMPLES\n  chage -l user",
  groupadd: "groupadd - create group\n\nSYNOPSIS\n  groupadd GROUP\n\nEXAMPLES\n  groupadd developers",
  groupdel: "groupdel - delete group\n\nSYNOPSIS\n  groupdel GROUP\n\nEXAMPLES\n  groupdel developers",
  mkswap: "mkswap - prepare swap device\n\nSYNOPSIS\n  mkswap DEVICE\n\nEXAMPLES\n  mkswap /dev/sda2",
  pvcreate: "pvcreate - create LVM physical volume\n\nSYNOPSIS\n  pvcreate DEVICE",
  vgcreate: "vgcreate - create LVM volume group\n\nSYNOPSIS\n  vgcreate NAME DEVICE...",
  lvcreate: "lvcreate - create LVM logical volume\n\nSYNOPSIS\n  lvcreate -L SIZE -n NAME GROUP",
  lvextend: "lvextend - extend LVM logical volume\n\nSYNOPSIS\n  lvextend -L +SIZE LV_PATH",
  resize2fs: "resize2fs - resize ext filesystem\n\nSYNOPSIS\n  resize2fs DEVICE",
  "aa-status": "aa-status - AppArmor status\n\nSYNOPSIS\n  aa-status",
  gpg: "gpg - GPG encryption\n\nSYNOPSIS\n  gpg [-c] FILE\n\nEXAMPLES\n  gpg -c file.txt",
  openssl: "openssl - OpenSSL tool\n\nSYNOPSIS\n  openssl enc -aes-256-cbc -salt -in FILE -out FILE.enc\n\nEXAMPLES\n  openssl enc -aes-256-cbc -salt -in data.txt -out data.txt.enc",
  help: "help - show shell help\n\nSYNOPSIS\n  help\n\nDESCRIPTION\n  Shows the list of available commands.\n  Use 'man COMMAND' for detailed help.",
};

function man(args: string[]): string {
  if (args.length === 0) return "What manual page do you want?";
  const name = args[0];
  const cmdName = EXTERNAL_ALIASES[name] ?? name;
  const page = MAN_PAGES[cmdName];
  if (!page) return `No manual entry for ${name}`;
  return page;
}

function tree(args: string[]): string {
  const target = args.find((a) => !a.startsWith("-")) || ".";
  const path = normalizePath(joinPath(CWD, target));
  const node = VFS[path];
  if (!node || node.type !== "dir") return `tree: ${target}: No es un directorio`;
  const lines: string[] = [];
  function walk(p: string, prefix: string) {
    const dir = VFS[p];
    if (!dir?.children) return;
    const names = Object.keys(dir.children).sort();
    for (let i = 0; i < names.length; i++) {
      const isLast = i === names.length - 1;
      const name = names[i];
      const child = dir.children[name];
      lines.push(`${prefix}${isLast ? "└── " : "├── "}${name}`);
      if (child.type === "dir") {
        walk(`${p}/${name}`, `${prefix}${isLast ? "    " : "│   "}`);
      }
    }
  }
  const baseName = path.split("/").pop() || path;
  lines.push(baseName);
  walk(path, "");
  return lines.join("\r\n");
}

function file(args: string[]): string {
  if (args.length === 0) return "file: missing operand";
  const results: string[] = [];
  for (const arg of args) {
    const path = normalizePath(joinPath(CWD, arg));
    const node = VFS[path];
    if (!node) {
      results.push(`${arg}: cannot open: No existe el archivo`);
      continue;
    }
    if (node.type === "dir") {
      results.push(`${arg}: directory`);
    } else if (node.mode?.startsWith("c")) {
      results.push(`${arg}: character special`);
    } else if (node.mode?.startsWith("b")) {
      results.push(`${arg}: block special`);
    } else if (node.content === "") {
      results.push(`${arg}: empty`);
    } else if (node.mode?.includes("x")) {
      results.push(`${arg}: ELF 64-bit LSB executable, x86-64`);
    } else if (arg.endsWith(".sh")) {
      results.push(`${arg}: Bourne-Again shell script, ASCII text executable`);
    } else if (arg.endsWith(".conf") || arg.endsWith(".txt") || arg.endsWith(".md")) {
      results.push(`${arg}: ASCII text`);
    } else if (arg.endsWith(".html")) {
      results.push(`${arg}: HTML document, ASCII text`);
    } else {
      results.push(`${arg}: data`);
    }
  }
  return results.join("\r\n");
}

function stat(args: string[]): string {
  if (args.length === 0) return "stat: missing operand";
  const path = normalizePath(joinPath(CWD, args[0]));
  const node = VFS[path];
  if (!node) return `stat: cannot access '${args[0]}': No such file or directory`;
  const mode = node.mode || (node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--");
  const size = node.size || (node.type === "dir" ? 4096 : 0);
  const owner = node.owner || "user";
  const group = node.group || "user";
  return [
    `  Archivo: ${args[0]}`,
    `  Tamaño: ${size}\tBloques: ${Math.ceil(size / 512)}\tBloque E/S: 4096`,
    `Dispositivo: 8,1\tNodo-i: ${(path.length * 1000 + size) % 999999}\tEnlaces: 1`,
    `Acceso: (${mode})\tUid: ( 1000/ ${owner})\tGid: ( 1000/ ${group})`,
    `Acceso: 2026-06-12 10:00:00.000000000 +0000`,
    `Modificar: 2026-06-12 10:00:00.000000000 +0000`,
    `Cambio: 2026-06-12 10:00:00.000000000 +0000`,
  ].join("\r\n");
}

function typeCmd(args: string[]): string {
  if (args.length === 0) return "type: missing operand";
  const name = args[0];
  if (ALIASES[name]) return `${name} es un alias para '${ALIASES[name]}'`;
  if (EXTERNAL_ALIASES[name]) return `${name} está en /usr/bin/${name}`;
  if (COMMANDS[name]) {
    if (["cd", "pwd", "echo", "type", "alias", "unalias", "export", "unset", "set"].includes(name)) {
      return `${name} es un interno del shell`;
    }
    return `${name} está en /usr/bin/${name}`;
  }
  const bins = ["/bin", "/usr/bin", "/usr/local/bin", "/sbin", "/usr/sbin"];
  for (const b of bins) {
    if (VFS[b]?.children?.[name]) return `${name} está en ${b}/${name}`;
  }
  return `type: ${name}: no encontrado`;
}

function aliasCmd(args: string[]): string {
  if (args.length === 0) {
    return Object.entries(ALIASES)
      .map(([k, v]) => `alias ${k}='${v}'`)
      .join("\r\n");
  }
  for (const arg of args) {
    const eqIdx = arg.indexOf("=");
    if (eqIdx === -1) {
      const v = ALIASES[arg];
      if (!v) return `alias: ${arg}: no encontrado`;
      return `alias ${arg}='${v}'`;
    }
    const key = arg.slice(0, eqIdx);
    let val = arg.slice(eqIdx + 1);
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    ALIASES[key] = val;
  }
  return "";
}

function unaliasCmd(args: string[]): string {
  if (args.length === 0) return "unalias: missing operand";
  for (const arg of args) {
    delete ALIASES[arg];
  }
  return "";
}

function envCmd(): string {
  return Object.entries(ENV)
    .map(([k, v]) => `${k}=${v}`)
    .join("\r\n");
}

function exportCmd(args: string[]): string {
  if (args.length === 0) return envCmd();
  for (const arg of args) {
    const eqIdx = arg.indexOf("=");
    if (eqIdx === -1) {
      const v = ENV[arg];
      if (v !== undefined) return `${arg}=${v}`;
      return "";
    }
    const key = arg.slice(0, eqIdx);
    let val = arg.slice(eqIdx + 1);
    val = expandVars(val);
    ENV[key] = val;
  }
  return "";
}

function setCmd(): string {
  return Object.entries(ENV)
    .map(([k, v]) => `${k}=${v}`)
    .join("\r\n");
}

function unsetCmd(args: string[]): string {
  if (args.length === 0) return "unset: missing operand";
  for (const arg of args) {
    delete ENV[arg];
  }
  return "";
}

function less(args: string[], stdin?: string): string {
  let content: string;
  if (args.length > 0) {
    const path = normalizePath(joinPath(CWD, args[0]));
    const node = VFS[path];
    if (!node || node.type !== "file") return `less: ${args[0]}: No such file or directory`;
    content = node.content || "";
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return "less: missing operand";
  }
  const lines = content.split("\n");
  const display = lines.slice(0, Math.min(lines.length, 20)).join("\n");
  if (lines.length > 20) {
    return display + `\r\n:${lines.length > 20 ? `\r\n(mostrando 20 de ${lines.length} líneas)` : ""}`;
  }
  return display;
}

const COMMANDS: Record<string, CmdFn> = {
  help: (_args, _stdin, history) => {
    const groups: Record<string, string[]> = {
      "Files": ["ls", "cd", "pwd", "mkdir", "touch", "cp", "mv", "rm", "cat", "chmod", "chown", "chgrp", "find", "grep", "head", "tail", "wc", "sort", "uniq", "tree", "file", "stat"],
      "Processes": ["ps", "kill", "killall", "jobs", "bg", "fg", "nice", "renice"],
      "Network": ["ip", "ping", "ss", "curl", "wget", "ifconfig", "route", "netstat", "traceroute", "host", "nslookup", "dig"],
      "Packages": ["apt", "dpkg", "dnf", "rpm"],
      "System": ["systemctl", "journalctl", "df", "du", "lsblk", "blkid", "mount", "umount", "findmnt", "mkfs", "mkswap", "free", "uname", "whoami", "who", "w", "last", "id", "groups", "sudo", "useradd", "usermod", "userdel", "passwd", "groupadd", "groupdel", "getenforce", "setenforce", "sestatus", "aa-status", "gpg", "openssl", "pvcreate", "vgcreate", "lvcreate", "lvextend", "resize2fs"],
      "Shell": ["echo", "env", "export", "set", "unset", "alias", "unalias", "type", "which", "whereis", "history"],
    };
    const lines: string[] = [
      "╔══════════════════════════════════════════╗",
      "║      LinuxCourse - Terminal v2.0         ║",
      "╚══════════════════════════════════════════╝",
      "",
      "Available commands by category:",
      "",
    ];
    for (const [cat, cmds] of Object.entries(groups)) {
      lines.push(`\x1b[1m${cat}:\x1b[0m`);
      const cols: string[] = [];
      for (const c of cmds) {
        if (COMMANDS[c]) cols.push(c);
      }
      lines.push("  " + cols.join(", "));
      lines.push("");
    }
    lines.push("Tip: Use 'man COMMAND' for detailed help on any command.");

    if (history && history.length > 0) {
      const last5 = history.slice(-5);
      lines.push("", "\x1b[1mRecent commands:\x1b[0m");
      for (const h of last5) {
        lines.push(`  ${h}`);
      }
    }

    return lines.join("\r\n");
  },
  ls,
  pwd: () => CWD,
  cd: (args) => {
    const target = args[0] || "~";
    // already imported at top
    if (target === "-") {
      const tmp = CWD;
      const old = OLDPWD || "/home/user";
      if (!VFS[old] || VFS[old].type !== "dir") return "cd: No existe el directorio anterior";
      setOLDPWD(tmp);
      setCWD(old);
      return old;
    }
    const resolved = target === "~" ? "/home/user" : target;
    const path = normalizePath(joinPath(CWD, resolved));
    const node = VFS[path];
    if (!node || node.type !== "dir") return `cd: ${target}: No such file or directory`;
    setOLDPWD(CWD);
    setCWD(path);
    return "";
  },
  mkdir: (args) => {
    if (args.length === 0) return "mkdir: missing operand";
    for (const arg of args) {
      const path = normalizePath(joinPath(CWD, arg));
      if (VFS[path]) return `mkdir: cannot create directory '${arg}': File exists`;
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
      const name = path.split("/").pop() || "";
      const parent = VFS[parentPath];
      if (!parent || parent.type !== "dir") return `mkdir: cannot create directory '${arg}': No existe el directorio padre`;
      if (!parent.children) parent.children = {};
      parent.children[name] = { type: "dir", mode: "drwxr-xr-x", owner: "user", group: "user", children: {} };
      VFS[path] = parent.children[name];
    }
    return "";
  },
  touch: (args) => {
    if (args.length === 0) return "touch: missing operand";
    for (const arg of args) {
      const path = normalizePath(joinPath(CWD, arg));
      if (VFS[path]) continue;
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
      const name = path.split("/").pop() || "";
      const parent = VFS[parentPath];
      if (!parent || parent.type !== "dir") continue;
      if (!parent.children) parent.children = {};
      parent.children[name] = { type: "file", content: "", mode: "-rw-r--r--", owner: "user", group: "user", size: 0 };
      VFS[path] = parent.children[name];
    }
    return "";
  },
  cp: (args) => {
    if (args.length < 2) return "cp: missing operand";
    const src = normalizePath(joinPath(CWD, args[0]));
    const dst = normalizePath(joinPath(CWD, args[1]));
    const srcNode = VFS[src];
    if (!srcNode) return `cp: cannot stat '${args[0]}': No such file or directory`;
    if (srcNode.type === "dir") return `cp: omitting directory '${args[0]}'`;
    const dstParentPath = dst.substring(0, dst.lastIndexOf("/")) || "/";
    const dstName = dst.split("/").pop() || "";
    const dstParent = VFS[dstParentPath];
    if (!dstParent || dstParent.type !== "dir") return `cp: cannot create '${args[1]}': No such file or directory`;
    if (!dstParent.children) dstParent.children = {};
    dstParent.children[dstName] = { ...srcNode };
    VFS[dst] = dstParent.children[dstName];
    return "";
  },
  mv: (args) => {
    if (args.length < 2) return "mv: missing operand";
    const src = normalizePath(joinPath(CWD, args[0]));
    const dst = normalizePath(joinPath(CWD, args[1]));
    const srcNode = VFS[src];
    if (!srcNode) return `mv: cannot stat '${args[0]}': No such file or directory`;
    const srcParentPath = src.substring(0, src.lastIndexOf("/")) || "/";
    const srcName = src.split("/").pop() || "";
    const srcParent = VFS[srcParentPath];
    if (srcParent?.children) delete srcParent.children[srcName];
    delete VFS[src];
    const dstParentPath = dst.substring(0, dst.lastIndexOf("/")) || "/";
    const dstName = dst.split("/").pop() || "";
    const dstParent = VFS[dstParentPath];
    if (!dstParent || dstParent.type !== "dir") return `mv: cannot move to '${args[1]}': No such file or directory`;
    if (!dstParent.children) dstParent.children = {};
    dstParent.children[dstName] = srcNode;
    VFS[dst] = srcNode;
    return "";
  },
  rm: (args) => {
    if (args.length === 0) return "rm: missing operand";
    const force = args.includes("-rf") || args.includes("-fr") || args.includes("-f");
    const recursive = args.includes("-rf") || args.includes("-fr") || args.includes("-r");
    const targets = args.filter((a) => !a.startsWith("-"));
    for (const t of targets) {
      const path = normalizePath(joinPath(CWD, t));
      const node = VFS[path];
      if (!node && !force) return `rm: cannot remove '${t}': No such file or directory`;
      if (!node) continue;
      if (node.type === "dir" && !recursive) return `rm: cannot remove '${t}': Is a directory`;
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
      const name = path.split("/").pop() || "";
      const parent = VFS[parentPath];
      if (parent?.children) delete parent.children[name];
      delete VFS[path];
      if (node.type === "dir") {
        for (const key of Object.keys(VFS)) {
          if (key.startsWith(path + "/")) delete VFS[key];
        }
      }
    }
    return "";
  },
  cat,
  echo: (args) => {
    if (args.length === 0) return "";
    let line = args.join(" ");
    line = expandVars(line);
    return line;
  },
  whoami: () => "user",
  uname: (args) => {
    if (args.includes("-a")) return "Linux linuxcourse 6.8.0-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux";
    if (args.includes("-r")) return "6.8.0-arch1-1";
    return "Linux";
  },
  clear: () => "CLEAR",
  history: (_args, _stdin, history) => {
    if (!history || history.length === 0) return "  (el historial está vacío)";
    return history.map((c, i) => `  ${i + 1}  ${c}`).join("\r\n");
  },
  sudo: (args) => {
    if (args.length === 0) return "sudo: missing operand";
    const cmd = args[0];
    const rest = args.slice(1);
    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd](rest);
      if (result === "CLEAR") return "CLEAR";
      return result;
    }
    return `sudo: ${cmd}: command not found`;
  },
  grep,
  find,
  head,
  tail,
  wc,
  sort: sortCmd,
  uniq: uniqCmd,
  which,
  whereis: (args) => {
    if (args.length === 0) return "";
    return `${args[0]}: /usr/bin/${args[0]} /usr/share/man/man1/${args[0]}.1.gz`;
  },
  chmod: (args) => {
    if (args.length < 2) return "chmod: missing operand";
    const mode = args[0];
    const target = args[1];
    const path = normalizePath(joinPath(CWD, target));
    const node = VFS[path];
    if (!node) return `chmod: cannot access '${target}': No existe el archivo`;
    const cur = node.mode || "-rw-r--r--";
    const whoPart = cur.slice(1);
    if (/^[0-7]{3}$/.test(mode)) {
      const m: Record<string, string> = { "755": "rwxr-xr-x", "644": "rw-r--r--", "700": "rwx------", "600": "rw-------", "777": "rwxrwxrwx" };
      node.mode = `-${m[mode] || "rwxr-xr-x"}`;
    } else {
      const match = mode.match(/^([ugoa]+)([+\-=])([rwx]+)$/);
      if (!match) return `chmod: invalid mode '${mode}'`;
      const [, who, op, what] = match;
      const parts = [...whoPart];
      const apply = (w: string) => {
        for (const c of what) {
          const idx = w === "u" ? 0 : w === "g" ? 3 : 6;
          const pos = idx + "rwx".indexOf(c);
          if (pos >= idx && pos < idx + 3) {
            if (op === "+") parts[pos] = c;
            else if (op === "-") parts[pos] = "-";
            else if (op === "=") { parts[idx] = "r"; parts[idx + 1] = "w"; parts[idx + 2] = "x"; }
          }
        }
      };
      if (who === "a") { apply("u"); apply("g"); apply("o"); }
      else apply(who);
      node.mode = `-${parts.join("")}`;
    }
    return "";
  },
  chown: (args) => {
    if (args.length < 2) return "chown: missing operand";
    const target = args[args.length - 1];
    const path = normalizePath(joinPath(CWD, target));
    const node = VFS[path];
    if (!node) return `chown: cannot access '${target}': No existe el archivo`;
    node.owner = args[0].split(":")[0] || "root";
    if (args[0].includes(":")) node.group = args[0].split(":")[1];
    return "";
  },
  chgrp: (args) => {
    if (args.length < 2) return "chgrp: missing operand";
    const target = args[args.length - 1];
    const path = normalizePath(joinPath(CWD, target));
    const node = VFS[path];
    if (!node) return `chgrp: cannot access '${target}': No existe el archivo`;
    node.group = args[0];
    return "";
  },

  ps: (args) => {
    if (args.includes("aux") || args.includes("-ef")) {
      return [
        "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND",
        "root         1  0.0  0.2 102456  1234 ?        Ss   Jun11   0:03 /sbin/init",
        "root       123  0.0  0.1  56789   567 ?        Ss   Jun11   0:01 /lib/systemd/systemd-journald",
        "root       456  0.0  0.0      0     0 ?        I<   Jun11   0:00 [kworker/0:0H]",
        "root       789  0.0  0.3  78901  2345 ?        Ss   Jun11   0:02 /usr/sbin/sshd",
        "user      1000  0.0  0.2  45678  1234 ?        Ss   Jun11   0:00 /lib/systemd/systemd --user",
        "user      1001  0.0  0.1  23456   678 pts/0    Ss   10:00   0:00 -bash",
        "user      1002  0.0  0.0  12345   456 pts/0    R+   10:05   0:00 ps aux",
      ].join("\r\n");
    }
    return [
      "  PID TTY          TIME CMD",
      " 1001 pts/0    00:00:00 bash",
      " 1002 pts/0    00:00:00 ps",
    ].join("\r\n");
  },
  kill: (args) => {
    if (args.length === 0) return "kill: missing operand";
    if (args[0] === "-l") return Array.from({ length: 31 }, (_, i) => `${i + 1}`).join(" ");
    return "";
  },
  killall: () => "",
  jobs: () => "",
  bg: () => "",
  fg: () => "",
  nice: () => "",
  renice: () => "",

  free: () => {
    return "               total        used        free      shared  buff/cache   available\r\nMem:          16Gi        6.2Gi        5.2Gi      512Mi        4.6Gi       10Gi\r\nSwap:         8.0Gi        1.2Gi        6.8Gi";
  },

  apt: (args) => {
    const sub = args[0];
    if (sub === "update") return "Obj:1 http://archive.ubuntu.com/ubuntu noble InRelease\r\nObj:2 http://security.ubuntu.com/ubuntu noble-security InRelease\r\nDescargados 2450 kB en 3s (817 kB/s)\r\nLeyendo listas de paquetes... Hecho";
    if (sub === "upgrade" || sub === "full-upgrade") {
      const yes = args.includes("-y");
      return `Leyendo listas de paquetes... Hecho\r\nCreando árbol de dependencias... Hecho\r\nSe actualizarán 0 paquetes.${yes ? "\r\n0 actualizados, 0 nuevos, 0 eliminados, 0 no actualizados." : ""}`;
    }
    if (sub === "install") {
      const yes = args.includes("-y");
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Leyendo listas de paquetes... Hecho\r\nCreando árbol de dependencias... Hecho\r\nSe instalarán los siguientes paquetes NUEVOS:\r\n  ${pkg}\r\n0 actualizados, 1 nuevos, 0 eliminados, 0 no actualizados.${yes ? "" : "\r\n¿Desea continuar? [S/n] "}`;
    }
    if (sub === "remove") {
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Leyendo listas de paquetes... Hecho\r\nSe eliminará el paquete:\r\n  ${pkg}\r\n0 actualizados, 0 nuevos, 1 eliminados.`;
    }
    if (sub === "purge") {
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Leyendo listas de paquetes... Hecho\r\nSe eliminará el paquete y sus archivos de configuración:\r\n  ${pkg}`;
    }
    if (sub === "search") {
      const term = args.find((a) => !a.startsWith("-") && a !== sub) || "";
      return `Resultados de búsqueda para '${term}':\r\n  ${term}/stable 1.0.0 amd64  - Descripción del paquete ${term}`;
    }
    if (sub === "show") {
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Paquete: ${pkg}\r\nVersión: 1.0.0\r\nEstado: no instalado\r\nPrioridad: estándar\r\nSección: utils\r\nMantenimiento: ${pkg} Developers\r\nArquitectura: amd64\r\nDescripción: Paquete ${pkg} simulado para LinuxCourse`;
    }
    if (sub === "list") {
      if (args.includes("--installed")) return "Listando...\r\nlibc6/stable,now 2.35-0ubuntu3 amd64 [instalado]\r\nopenssl/stable,now 3.0.2 amd64 [instalado]\r\nbash/stable,now 5.1-6 amd64 [instalado]";
      if (args.includes("--upgradable")) return "Listando...\r\n(paquetes actualizables)";
      return "";
    }
    if (sub === "autoremove") return "Leyendo listas de paquetes... Hecho\r\n0 paquetes eliminados.";
    if (sub === "--fix-broken" || sub === "install" && args.includes("--fix-broken")) return "Corrigiendo dependencias... Hecho";
    return `apt: subcommand '${sub || ""}' not recognized`;
  },
  dpkg: (args) => {
    if (args.includes("-i")) return "(Leyendo base de datos... 12345 archivos instalados.)\r\nPreparando para desempaquetar...\r\nDesempaquetando...\r\nConfigurando...\r\nProcesado satisfactoriamente.";
    if (args.includes("-r") || args.includes("-P")) return "Eliminando...\r\nProcesado satisfactoriamente.";
    if (args.includes("-l")) return "| Estado=no/inst/conf-files/desempaq/medio-conf/#-rotos\r\n|/ Err?=(ninguno)/Reinst-required (Estado,Err mayúsc.=mal)\r\n||/ Nombre           Versión      Arquitectura Descripción\r\n+++-==============-============-============-=================================\r\nii  libc6:amd64     2.35-0ubuntu3 amd64        Biblioteca C de GNU\r\nii  openssl         3.0.2        amd64        OpenSSL toolkit\r\nii  bash            5.1-6        amd64        GNU Bourne Again SHell";
    if (args.includes("-L")) {
      const pkg = args[args.indexOf("-L") + 1];
      return `/${pkg}\r\n/usr/bin/${pkg}\r\n/etc/${pkg}/${pkg}.conf`;
    }
    if (args.includes("-S")) return "openssl: /usr/bin/openssl";
    if (args.includes("--configure")) return "Configurando paquetes pendientes... Hecho";
    return "";
  },

  dnf: (args) => {
    const sub = args[0];
    if (sub === "update") return "Última comprobación de expiración de metadatos: 0:05:23 hace.\r\nDependencias resueltas.\r\n0 paquetes para actualizar.";
    if (sub === "install") {
      const yes = args.includes("-y");
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Última comprobación...\r\nDependencias resueltas.\r\n\r\nPaquete             Arquitectura  Versión          Repositorio\r\n${pkg}              x86_64        1.0.0            baseos\r\n\r\n¿Desea continuar? [y/N]: ${yes ? "y" : ""}\r\nDescargando...\r\nEjecutando comprobación de transacción\r\nEjecutando prueba de transacción\r\nTransacción correcta.`;
    }
    if (sub === "remove") {
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Dependencias resueltas.\r\nPaquete a eliminar: ${pkg}\r\nTransacción correcta.`;
    }
    if (sub === "search") {
      const term = args.find((a) => !a.startsWith("-") && a !== sub) || "";
      return `Resultados de búsqueda: ${term}.x86_64 : Paquete ${term}`;
    }
    if (sub === "info") {
      const pkg = args.find((a) => !a.startsWith("-") && a !== sub) || "paquete";
      return `Nombre        : ${pkg}\r\nVersión       : 1.0.0\r\nArquitectura  : x86_64\r\nTamaño        : 1.0 M\r\nRepositorio   : baseos\r\nDescripción   : Paquete ${pkg}`;
    }
    if (sub === "list") {
      if (args.includes("installed")) return "Instalados\r\nbash.x86_64                    5.1.8-4.el9          @baseos\r\nopenssl.x86_64                 3.0.7-6.el9          @appstream";
      if (args.includes("available")) return "Disponibles\r\nhttpd.x86_64                    2.4.51-7.el9         appstream\r\nnginx.x86_64                    1.20.1-10.el9        appstream";
      return "";
    }
    if (sub === "groupinstall") return "Instalando grupo... Hecho.";
    if (sub === "autoremove") return "0 paquetes para eliminar.";
    if (sub === "history") return "ID     | Command line                    | Date and time    | Action\r\n    10 | install nginx                   | 2026-06-11 14:30 | Install\r\n     9 | update                          | 2026-06-10 09:00 | Update";
    return `dnf: subcommand '${sub || ""}' not recognized`;
  },
  rpm: (args) => {
    if (args.includes("-qa")) return "glibc-2.35-1.x86_64\r\nopenssl-3.0.2-1.x86_64\r\nbash-5.1.8-1.x86_64\r\nhttpd-2.4.51-1.x86_64\r\nnginx-1.20.1-1.x86_64";
    if (args.includes("-ql")) return "/etc/nginx/nginx.conf\r\n/usr/sbin/nginx\r\n/usr/share/nginx";
    if (args.includes("-qf")) return "nginx-1.20.1-1.x86_64";
    if (args.includes("-qi")) return "Name        : nginx\r\nVersion     : 1.20.1\r\nArchitecture: x86_64\r\nSize        : 1234567\r\nLicense     : BSD\r\nSummary     : High performance web server";
    if (args.includes("-V")) return "S.5....T.  c /etc/nginx/nginx.conf\r\n.......T.    /usr/sbin/nginx";
    if (args.includes("-ivh")) return "Preparando...                          ################################# [100%]\r\nActualizando / instalando...\r\n  1:nginx-1.20.1-1                    ################################# [100%]";
    if (args.includes("-e")) return "Eliminando...\r\nLimpiando...\r\nHecho.";
    return "";
  },

  systemctl: (args) => {
    const sub = args[0];
    if (sub === "daemon-reload") return "";
    if (sub === "list-units") return "  UNIT                      LOAD   ACTIVE SUB     DESCRIPTION\r\n  nginx.service             loaded active running nginx - high performance web server\r\n  sshd.service              loaded active running OpenSSH server daemon\r\n  systemd-journald.service  loaded active running Journal Service";
    if (sub === "status") {
      const svc = args[1] || "servicio";
      return `● ${svc}.service - ${svc === "nginx" ? "nginx - high performance web server" : svc === "sshd" ? "OpenSSH server daemon" : `Servicio ${svc}`}\r\n     Loaded: loaded (/usr/lib/systemd/system/${svc}.service; enabled; vendor preset: enabled)\r\n     Active: active (running) since Thu 2026-06-11 10:00:00 UTC; 1 day 1h ago\r\n   Main PID: ${svc === "nginx" ? "1234" : svc === "sshd" ? "789" : "5678"} (${svc})\r\n      Tasks: ${svc === "nginx" ? "2" : "1"} (limit: 2345)\r\n     Memory: ${svc === "nginx" ? "5.2M" : "2.1M"}\r\n        CPU: ${svc === "nginx" ? "10ms" : "5ms"}\r\n     CGroup: /system.slice/${svc}.service\r\n             └─${svc === "nginx" ? "1234" : svc === "sshd" ? "789" : "5678"} /usr/sbin/${svc}`;
    }
    if (sub === "start" || sub === "stop" || sub === "restart" || sub === "reload") return "";
    if (sub === "enable") return `Created symlink /etc/systemd/system/multi-user.target.wants/${args[1]}.service → /usr/lib/systemd/system/${args[1]}.service.`;
    if (sub === "disable") return `Removed symlink /etc/systemd/system/multi-user.target.wants/${args[1]}.service.`;
    if (sub === "is-active") return "active";
    if (sub === "is-enabled") return "enabled";
    if (sub === "list-timers") return "NEXT                         LEFT     LAST                         PASSED    UNIT\r\nFri 2026-06-13 00:00:00 UTC  12h     Thu 2026-06-12 12:00:00 UTC  12h  systemd-tmpfiles-clean.timer";
    if (sub === "get-default") return "graphical.target";
    if (sub === "set-default" || sub === "isolate") return "";
    return `systemctl: subcommand '${sub || ""}' not recognized`;
  },
  journalctl: (args) => {
    const unitFlag = args.indexOf("-u");
    const nFlag = args.indexOf("-n");
    const n = nFlag !== -1 ? parseInt(args[nFlag + 1]) || 10 : 10;
    const follow = args.includes("-f");
    let svc = "system";
    if (unitFlag !== -1 && unitFlag + 1 < args.length) svc = args[unitFlag + 1];
    const lines: string[] = [];
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 1);
    for (let i = 0; i < n; i++) {
      const t = new Date(baseTime.getTime() + i * 60000);
      const msg = svc === "nginx"
        ? ["nginx started", "Connection from 192.168.1.10", "worker process 1234 started", "reload signal received", "open socket 0.0.0.0:80"][i % 5]
        : svc === "sshd"
          ? ["Accepted publickey for user from 192.168.1.10", "Connection closed by 192.168.1.10", "Server listening on 0.0.0.0 port 22"][i % 3]
          : [`${svc} service started`, `${svc} entering running state`, `Configuration loaded`][i % 3];
      lines.push(`${t.toISOString().replace("T", " ").slice(0, 19)} ${svc}[1234]: ${msg}`);
    }
    return lines.join("\r\n") + (follow ? "\r\n\n[Siguiendo... Ctrl+C para salir]" : "");
  },

  useradd: (args) => {
    const name = args.filter((a) => !a.startsWith("-")).pop() || "";
    if (!name) return "useradd: missing username";
    return "";
  },
  usermod: () => "",
  userdel: (args) => {
    const name = args.find((a) => !a.startsWith("-")) || "";
    if (!name) return "userdel: missing username";
    return "";
  },
  groupadd: (args) => {
    const name = args.find((a) => !a.startsWith("-")) || "";
    return name ? "" : "groupadd: missing group name";
  },
  groupdel: (args) => {
    const name = args.find((a) => !a.startsWith("-")) || "";
    return name ? "" : "groupdel: missing group name";
  },
  gpasswd: () => "",
  passwd: () => "New password:\r\nRetype new password:\r\npasswd: password updated successfully.",
  chage: (args) => {
    if (args.includes("-l")) {
      const _user = args[args.indexOf("-l") + 1] || "user"; // eslint-disable-line @typescript-eslint/no-unused-vars
      return `Último cambio de contraseña: Jun 11, 2026\r\nLa contraseña expira: nunca\r\nCuenta bloqueada: no`;
    }
    return "";
  },
  groups: (args) => {
    const user = args[0] || "user";
    return `${user} : user ${user.includes("juan") ? "juan" : ""} wheel sudo docker`.trim();
  },
  id: () => "uid=1000(user) gid=1000(user) grupos=1000(user),10(wheel),27(sudo)",
  who: () => "user     pts/0        2026-06-12 10:00 (192.168.1.10)",
  w: () => " 10:05:03 up 1 day,  1:05,  1 user,  load average: 0.00, 0.01, 0.00\r\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\r\nuser     pts/0    192.168.1.10     10:00    0.00s  0.02s  0.00s w",
  last: () => "user     pts/0        192.168.1.10    Thu Jun 11 10:00   still logged in\r\nuser     pts/0        192.168.1.10    Wed Jun 10 09:00 - 17:00  (8:00)\r\nreboot   system boot  6.8.0-arch1-1   Wed Jun 10 08:55   still running",

  df: (args) => {
    const h = args.includes("-h");
    if (h) return "Filesystem      Size  Used  Avail  Use%  Mounted on\r\n/dev/sda1         98G   23G    75G   24% /\r\n/dev/sdb1        500G  200G   300G   40% /datos\r\ntmpfs            8.0G   12M   7.9G    1% /tmp";
    return "Filesystem      1K-blocks     Used  Available  Use%  Mounted on\r\n/dev/sda1         102400000  24117248   78086144   24% /\r\n/dev/sdb1         524288000 209715200  314572800   40% /datos";
  },
  du: (args) => {
    const path = args.find((a) => !a.startsWith("-")) || ".";
    if (args.includes("-sh") || (args.includes("-s") && args.includes("-h"))) return `23M\t${path}`;
    return `12K\t${path}/Documents\r\n4.0K\t${path}/Downloads\r\n8.0K\t${path}/projects`;
  },
  lsblk: () => "NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\r\nsda      8:0    0   100G  0 disk\r\n├─sda1   8:1    0    50G  0 part /\r\n├─sda2   8:2    0     8G  0 part [SWAP]\r\n└─sda3   8:3    0    42G  0 part /home\r\nsdb      8:16   0   500G  0 disk\r\n└─sdb1   8:17   0   500G  0 part /datos",
  blkid: () => "/dev/sda1: UUID=\"abc-123\" BLOCK_SIZE=\"4096\" TYPE=\"ext4\"\r\n/dev/sda2: UUID=\"def-456\" TYPE=\"swap\"\r\n/dev/sda3: UUID=\"ghi-789\" BLOCK_SIZE=\"4096\" TYPE=\"ext4\"\r\n/dev/sdb1: UUID=\"jkl-012\" BLOCK_SIZE=\"4096\" TYPE=\"ext4\"",
  mount: () => "",
  umount: () => "",
  findmnt: () => "TARGET    SOURCE     FSTYPE OPTIONS\r\n/         /dev/sda1  ext4   rw,relatime\r\n├─/sys    sysfs      sysfs  rw,nosuid\r\n├─/proc   proc       proc   rw\r\n├─/dev    udev       devtmpfs rw\r\n├─/datos  /dev/sdb1  ext4   rw,relatime\r\n└─/tmp    tmpfs      tmpfs  rw",
  mkfs: (args) => {
    if (args.length === 0) return "mkfs: missing operand";
    const dev = args[args.length - 1];
    return `Creando sistema de archivos en ${dev}...\r\nSuperbloques de respaldo almacenados...\r\nEscribiendo tabla de nodos-i: hecho\r\nCreando diario (journal): hecho\r\nEscribiendo superbloques y contabilidad del sistema de archivos: hecho`;
  },
  mkswap: (args) => {
    if (args.length === 0) return "mkswap: missing operand";
    return `Creando espacio de intercambio en versión 1, tamaño = 8 GiB\r\nEtiqueta: none\r\nUUID: def-456`;
  },
  pvcreate: () => '  Physical volume "/dev/sda1" successfully created.',
  vgcreate: () => '  Volume group "vg_datos" successfully created',
  lvcreate: (args) => {
    if (args.includes("-L") && args.includes("-n")) {
      const _size = args[args.indexOf("-L") + 1]; // eslint-disable-line @typescript-eslint/no-unused-vars
      const name = args[args.indexOf("-n") + 1];
      return `  Logical volume "${name}" created.`;
    }
    return "  Logical volume created.";
  },
  lvextend: () => '  Size of logical volume vg_datos/lv_datos changed from 10.00 GiB to 15.00 GiB.',
  resize2fs: () => "resize2fs 1.47.0 (5-Feb-2023)\r\nFilesystem at /dev/vg_datos/lv_datos is mounted on /datos; on-line resizing required\r\nold_desc_blocks = 1, new_desc_blocks = 1\r\nThe filesystem on /dev/vg_datos/lv_datos is now 3932160 (4k) blocks long.",

  ip: (args) => {
    if (args.includes("addr")) {
      return "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\r\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\r\n    inet 127.0.0.1/8 scope host lo\r\n       valid_lft forever preferred_lft forever\r\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\r\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff\r\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0\r\n       valid_lft 86342sec preferred_lft 86342sec";
    }
    if (args.includes("link")) return "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT\r\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT";
    if (args.includes("route")) return "default via 192.168.1.1 dev eth0 proto static\r\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10";
    if (args.includes("neigh")) return "192.168.1.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE\r\n192.168.1.20 dev eth0 lladdr 00:aa:bb:cc:dd:ee STALE";
    return `ip: subcommand '${args[0] || ""}' not recognized`;
  },
  ifconfig: () => "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\r\n        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255\r\n        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000\r\n        RX packets 12345  bytes 12345678 (11.7 MiB)\r\n        TX packets 6789  bytes 987654 (964.5 KiB)",
  route: () => "Kernel IP routing table\r\nDestination     Gateway         Genmask         Flags   MSS Window  irtt Iface\r\n0.0.0.0         192.168.1.1     0.0.0.0         UG        0 0          0 eth0\r\n192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 eth0",
  netstat: (args) => {
    if (args.includes("-tulpn") || args.includes("-tuln")) {
      return "Active Internet connections (only servers)\r\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\r\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      789/sshd\r\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1234/nginx\r\ntcp        0      0 127.0.0.1:53            0.0.0.0:*               LISTEN      456/systemd-resolve\r\ntcp6       0      0 :::22                   :::*                    LISTEN      789/sshd";
    }
    return "Active Internet connections (servers and established)";
  },
  ping: (args) => {
    const cFlag = args.indexOf("-c");
    const count = cFlag !== -1 ? parseInt(args[cFlag + 1]) || 4 : 4;
    const target = args.find((a) => !a.startsWith("-") && !/^\d+$/.test(a)) || "8.8.8.8";
    const out: string[] = [];
    for (let i = 0; i < Math.min(count, 4); i++) {
      out.push(`64 bytes from ${target}: icmp_seq=${i + 1} ttl=117 time=${(Math.random() * 30 + 5).toFixed(1)} ms`);
    }
    if (count > 4) out.push(`... (${count} paquetes enviados)`);
    out.push(`\r\n--- ${target} ping statistics ---`);
    out.push(`${count} packets transmitted, ${count} received, 0% packet loss, time ${count * 12}ms`);
    return out.join("\r\n");
  },
  traceroute: (args) => {
    const target = args.find((a) => !a.startsWith("-")) || "8.8.8.8";
    return `traceroute to ${target}, 30 hops max, 60 byte packets\r\n 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.098 ms\r\n 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.654 ms  5.621 ms\r\n 3  72.14.204.1 (72.14.204.1)  12.345 ms  12.321 ms  12.298 ms\r\n 4  ${target} (${target})  12.456 ms  12.432 ms  12.401 ms`;
  },
  ss: (args) => {
    if (args.includes("-tulpn") || args.includes("-tuln")) {
      return "State    Recv-Q   Send-Q     Local Address:Port       Peer Address:Port   Process\r\nLISTEN   0        128              0.0.0.0:22              0.0.0.0:*       users:((\"sshd\",pid=789,fd=3))\r\nLISTEN   0        511              0.0.0.0:80              0.0.0.0:*       users:((\"nginx\",pid=1234,fd=6))\r\nLISTEN   0        4096             127.0.0.1:53            0.0.0.0:*       users:((\"systemd-resolve\",pid=456,fd=12))";
    }
    return "State    Recv-Q   Send-Q     Local Address:Port       Peer Address:Port";
  },
  curl: (args) => {
    if (args.includes("-I")) return "HTTP/2 200\r\nserver: nginx/1.20.1\r\ncontent-type: text/html\r\ncontent-length: 1234\r\nlast-modified: Thu, 11 Jun 2026 10:00:00 GMT";
    const url = args.find((a) => !a.startsWith("-") && a.includes("://")) || "https://ejemplo.com";
    return `<html>\r\n<head><title>${url}</title></head>\r\n<body>\r\n<h1>Página de ejemplo</h1>\r\n<p>Contenido simulado de ${url}</p>\r\n</body>\r\n</html>`;
  },
  wget: (args) => {
    const url = args.find((a) => !a.startsWith("-") && a.includes("://")) || "https://ejemplo.com";
    const name = url.split("/").pop() || "index.html";
    return `--2026-06-12 10:05:03--  ${url}\r\nResolviendo ${url.split("://")[1]?.split("/")[0] || "ejemplo.com"}... 93.184.216.34\r\nConectando con ${url.split("://")[1]?.split("/")[0] || "ejemplo.com"}|93.184.216.34|:443... conectado.\r\nPetición HTTP enviada, esperando respuesta... 200 OK\r\nLongitud: 1234 [text/html]\r\nGuardando en: '${name}'\r\n\r\n${name}  100%[===================>]   1.20K  --.-KB/s    en 0s\r\n\r\n2026-06-12 10:05:03 (100 MB/s) - '${name}' guardado [1234/1234]`;
  },
  host: (args) => {
    const domain = args[0] || "google.com";
    return `${domain} has address 142.250.64.78\r\n${domain} has IPv6 address 2607:f8b0:4000:800::200e\r\n${domain} mail is handled by 10 smtp.google.com`;
  },
  nslookup: (args) => {
    const domain = args[0] || "google.com";
    return `Server:     127.0.0.53\r\nAddress:    127.0.0.53#53\r\n\r\nNon-authoritative answer:\r\nName:    ${domain}\r\nAddress: 142.250.64.78`;
  },
  dig: (args) => {
    const domain = args.find((a) => !a.startsWith("-") && a !== "-x") || "google.com";
    const x = args.includes("-x");
    if (x) return `;${domain}\r\n;; ANSWER SECTION:\r\n${domain}.in-addr.arpa. 86400 IN PTR google.com.`;
    return `; <<>> DiG 9.18.0 <<>> ${domain}\r\n;; global options: +cmd\r\n;; Got answer:\r\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\r\n;; ANSWER SECTION:\r\n${domain}.     300     IN      A       142.250.64.78\r\n\r\n;; Query time: 12 msec\r\n;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)\r\n;; WHEN: Fri Jun 12 10:05:03 UTC 2026\r\n;; MSG SIZE  rcvd: 55`;
  },

  "firewall-cmd": (args) => {
    if (args.includes("--list-all")) {
      return "public (active)\r\n  target: default\r\n  icmp-block-inversion: no\r\n  interfaces: eth0\r\n  sources: \r\n  services: ssh dhcpv6-client http\r\n  ports: 8080/tcp\r\n  protocols: \r\n  masquerade: no\r\n  forward-ports: \r\n  source-ports: \r\n  icmp-blocks: \r\n  rich rules: ";
    }
    if (args.includes("--add-service") || args.includes("--add-port") || args.includes("--remove-service")) return "success";
    if (args.includes("--runtime-to-permanent")) return "success";
    if (args.includes("--zone")) return "success";
    return "";
  },
  ufw: (args) => {
    if (args.includes("enable")) return "Firewall is active and enabled on system startup";
    if (args.includes("status")) {
      if (args.includes("verbose")) return "Status: active\r\nLogging: on (low)\r\nDefault: deny (incoming), allow (outgoing), disabled (routed)\r\nNew profiles: skip\r\n\r\nTo                         Action      From\r\n--                         ------      ----\r\n22/tcp (SSH)               ALLOW       Anywhere\r\n80/tcp (HTTP)              ALLOW       Anywhere\r\n443/tcp (HTTPS)            ALLOW       Anywhere\r\n23                         DENY        Anywhere";
      return "Status: active";
    }
    if (args.includes("allow")) return "Rule added";
    if (args.includes("deny")) return "Rule added";
    if (args.includes("delete")) return "Rule deleted";
    return "";
  },
  iptables: () => "Chain INPUT (policy ACCEPT 0 packets, 0 bytes)\r\n pkts bytes target     prot opt in     out     source               destination\r\n  100  8400 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22\r\n    0     0 DROP       all  --  *      *       0.0.0.0/0            0.0.0.0/0",
  getenforce: () => "Enforcing",
  setenforce: () => "",
  sestatus: () => "SELinux status:                 enabled\r\nSELinuxfs mount:                /sys/fs/selinux\r\nSELinux root directory:         /etc/selinux\r\nLoaded policy name:             targeted\r\nCurrent mode:                   enforcing\r\nMode from config file:          enforcing\r\nPolicy MLS status:              enabled\r\nPolicy deny_unknown status:     allowed",
  "aa-status": () => "apparmor module is loaded.\r\n24 profiles are loaded.\r\n24 profiles are in enforce mode.\r\n   /usr/bin/man\r\n   /usr/sbin/ntpd\r\n0 profiles are in complain mode.",
  gpg: (args) => {
    if (args.includes("-c")) return "Password: \r\nRepeat password: \r\nfile.txt.gpg encrypted successfully.";
    return "gpg: uso: gpg -c archivo (cifrar) / gpg archivo.gpg (descifrar)";
  },
  openssl: (args) => {
    if (args.includes("enc")) return "Cifrado correctamente.";
    return "openssl: uso: openssl enc -aes-256-cbc -salt -in archivo -out archivo.enc";
  },

  man,
  tree,
  file,
  stat,
  type: typeCmd,
  alias: aliasCmd,
  unalias: unaliasCmd,
  env: envCmd,
  export: exportCmd,
  set: setCmd,
  unset: unsetCmd,
  less,
  more: less,
};

export const EXTERNAL_ALIASES: Record<string, string> = {};

export { COMMANDS };
