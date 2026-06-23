## Usuarios y Grupos en Linux

Linux es **multiusuario** (multi-user): varias personas pueden usar la misma computadora al mismo tiempo, cada una con su propia cuenta, archivos y permisos.

Cada usuario tiene:
- Un **nombre de usuario** (username)
- Un **UID** (User ID) — número único que lo identifica
- Un **GID** (Group ID) — su grupo principal
- Un **directorio personal** (home) — típicamente /home/usuario
- Una **shell** — el programa que se ejecuta al iniciar sesión

## Archivos Clave del Sistema

Tres archivos contienen toda la información de usuarios y grupos:

- **/etc/passwd**: lista de usuarios (una línea por usuario)
- **/etc/shadow**: contraseñas cifradas (solo root puede leerlo)
- **/etc/group**: lista de grupos

### /etc/passwd
Cada línea se ve así:
```
alicia:x:1000:1000:Alicia García:/home/alicia:/bin/bash
```

Campos separados por `:`:
1. `alicia` → nombre de usuario
2. `x` → la contraseña está en /etc/shadow (por seguridad)
3. `1000` → UID
4. `1000` → GID del grupo principal
5. `Alicia García` → nombre completo (opcional)
6. `/home/alicia` → directorio personal
7. `/bin/bash` → shell por defecto

Los UIDs se asignan por rango:
- **0**: root (superadministrador)
- **1-999**: usuarios del sistema (servicios como www-data, sshd)
- **1000-60000**: usuarios humanos normales

### /etc/shadow
```
alicia:$y$j9T$...:18900:0:90:7:::
```

Contiene la contraseña cifrada y las políticas de caducidad. Si ves `!` o `*` al inicio, la cuenta está bloqueada.

## Crear y Gestionar Usuarios

### Crear un usuario

```bash
sudo useradd -m -s /bin/bash juan
```

- `-m`: crea el directorio personal (/home/juan)
- `-s /bin/bash`: le asigna bash como shell

Luego asígnale una contraseña:

```bash
sudo passwd juan               # Te pedirá escribir la contraseña (dos veces)
```

### Modificar un usuario

```bash
sudo usermod -aG sudo juan     # Añade juan al grupo 'sudo' (puede usar sudo)
sudo usermod -L juan           # Bloquea la cuenta (Lock)
sudo usermod -U juan           # Desbloquea la cuenta (Unlock)
sudo usermod -d /nuevo/home juan  # Cambia el directorio personal
```

### Eliminar un usuario

```bash
sudo userdel juan              # Elimina el usuario
sudo userdel -r juan           # Elimina el usuario Y su directorio personal
```

## Grupos

Los grupos sirven para agrupar usuarios con permisos comunes.

### Crear y eliminar grupos

```bash
sudo groupadd desarrolladores   # Crea el grupo
sudo groupdel desarrolladores   # Elimina el grupo
```

### Añadir y quitar usuarios de un grupo

```bash
sudo usermod -aG desarrolladores juan   # -a = append, -G = group
sudo gpasswd -d juan desarrolladores    # Quita a juan del grupo
groups juan                              # Muestra los grupos de juan
```

### Consultar identidad

Para saber quién eres y tus IDs:

```bash
whoami                        # Muestra tu nombre de usuario
id                            # Muestra tu UID, GID y grupos
id root                       # Muestra la información de otro usuario
```

## sudo — Hacer Cosas de Root Sin Ser Root

**sudo** (super user do) permite que usuarios normales ejecuten comandos como administrador. Es más seguro que estar siempre como root.

```bash
sudo apt install nginx          # Ejecuta como root
sudo -i                         # Abre una shell como root (¡cuidado!)
```

La configuración de sudo está en `/etc/sudoers`. Nunca lo edites a mano, usa:

```bash
sudo visudo                     # Edita sudoers de forma segura
```

Ejemplos de entradas en sudoers:

```
alicia  ALL=(ALL:ALL) ALL               # Alicia puede hacer TODO con sudo
%wheel  ALL=(ALL:ALL) ALL               # Todos los miembros del grupo wheel pueden usar sudo
alicia  ALL=(ALL) /usr/bin/apt          # Alicia solo puede ejecutar apt con sudo
alicia  ALL=(ALL) NOPASSWD: ALL         # Alicia usa sudo sin poner contraseña
```

## Políticas de Contraseñas con `chage`

```bash
chage -l juan                   # Muestra la política actual de la contraseña
chage -M 90 juan                # La contraseña expira en 90 días
chage -m 7 juan                 # Deben pasar 7 días entre cambios de contraseña
chage -W 7 juan                 # Avisa 7 días antes de que expire
chage -E 2025-12-31 juan        # La cuenta expira en esa fecha
```