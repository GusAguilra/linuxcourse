## ¿Por Qué Existen los Permisos?

Linux es un sistema **multiusuario** (diseñado para que varias personas lo usen al mismo tiempo). Necesitas una forma de decir:
- "Este archivo es mío, nadie más lo toque"
- "Este otro lo pueden leer todos, pero solo yo puedo escribirlo"
- "Este script pueden ejecutarlo todos"

Los permisos resuelven esto.

## Leyendo los Permisos

Ejecuta `ls -l` y verás algo como:

```
-rw-r--r--  1 user  group  1024 Jun 12 10:00 notas.txt
drwxr-xr-x  2 user  group  4096 Jun 12 10:00 Documentos
```

El primer carácter indica el **tipo**:
- `-`: archivo normal
- `d`: directorio (carpeta)
- `l`*: enlace simbólico (acceso directo)

Los siguientes 9 caracteres son los permisos, en 3 grupos de 3:

```
 rwx  rwx  rwx
 │    │    └── Otros (cualquiera)
 │    └────── Grupo (usuarios del mismo grupo)
 └────────── Propietario (el dueño)
```

Cada letra significa:
- `r` (read): permiso de **lectura** — puedes ver el contenido
- `w` (write): permiso de **escritura** — puedes modificar
- `x` (execute): permiso de **ejecución** — puedes correrlo como programa

> **Importante**: en los **directorios**, el permiso `x` significa algo distinto: te permite **entrar** (con `cd`) y **acceder** a los archivos dentro. Sin `x` en un directorio, no puedes navegar hacia adentro aunque tengas `r`.

Si en lugar de una letra ves un `-`*, ese permiso no está concedido.

Ejemplo: `rwxr-xr-x`
- Propietario: rwx (puede leer, escribir y ejecutar)
- Grupo: r-x (puede leer y ejecutar, pero NO escribir)
- Otros: r-x (puede leer y ejecutar, pero NO escribir)

## Cambiando Permisos con `chmod`

Hay dos formas: **numérica** y **simbólica**.

### Modo Numérico (el más usado)

Los permisos se representan con números:

```
r = 4
w = 2
x = 1
```

Se suman los valores. Ejemplos:

```bash
chmod 755 script.sh    # rwxr-xr-x  (4+2+1)(4+0+1)(4+0+1) = 755
chmod 644 notas.txt    # rw-r--r--  (4+2+0)(4+0+0)(4+0+0) = 644
chmod 700 privado.sh   # rwx------  (4+2+1)(0+0+0)(0+0+0) = 700
```

**Casos comunes:**
- **644** → archivos normales (lectura para todos, escritura solo dueño)
- **755** → scripts y ejecutables (todo el mundo puede ejecutar)
- **700** → archivos privados (solo el dueño tiene acceso)
- **600** → archivos secretos (solo el dueño puede leer/escribir)
- **777** → acceso total para todos (muy permisivo, evítalo en producción)
- **444** → solo lectura para todos (nadie puede modificar)

### Modo Simbólico

Usa letras para referirse a quién afecta:
- `u` (user) = propietario
- `g` (group) = grupo
- `o` (others) = otros
- `a` (all) = todos

```bash
chmod u+x script.sh     # Añade (+) ejecución (x) para el propietario (u)
chmod g-w archivo       # Quita (-) escritura (w) para el grupo (g)
chmod o=r archivo       # Asigna (=) solo lectura para otros (o)
chmod a+x script.sh     # Añade ejecución para todos
```

Para cambiar permisos **recursivamente** (todo el árbol de carpetas), usa `-R`:

```bash
chmod -R 755 /carpeta    # Aplica 755 a /carpeta y todo su contenido
chmod -R a+r ~/publico   # Todos los archivos dentro de ~/publico serán legibles
```

## Cambiando el Dueño (`chown`) y el Grupo (`chgrp`)

Para cambiar quién es el dueño de un archivo (solo root puede hacerlo):

```bash
sudo chown alicia:developers proyecto.txt   # Dueño=alicia, Grupo=developers
sudo chown alicia proyecto.txt              # Solo cambia el dueño
sudo chgrp developers proyecto.txt          # Solo cambia el grupo
sudo chown -R alicia:developers /carpeta    # -R = recursivo (todo el árbol)
```

## El Problema de umask

Cada vez que creas un archivo, Linux le asigna permisos por defecto. El **umask** (máscara de usuario) define qué permisos NO se asignan. Es como un filtro.

```bash
umask        # Muestra el valor actual (típicamente 0022)
```

La fórmula:
- **Archivos**: 666 - umask → 666 - 022 = 644 (rw-r--r--)
- **Directorios**: 777 - umask → 777 - 022 = 755 (rwxr-xr-x)

## Los 3 Permisos Especiales

Son avanzados, pero es bueno saber que existen:

| Permiso | ¿Qué hace? |
|---------|-----------|
| **SUID** (4xxx) | Al ejecutar un archivo, corre como si fuera el dueño (no tú). Ej: `passwd` necesita escribir en /etc/shadow aunque tú no puedas) |
| **SGID** (2xxx) | En un directorio, los archivos nuevos heredan el grupo del directorio |
| **Sticky Bit** (1xxx) | En /tmp, solo el dueño puede borrar sus archivos, aunque todos puedan escribir |

```bash
chmod u+s archivo       # Activa SUID (aparece como 's' en lugar de 'x' del dueño)
chmod g+s directorio    # Activa SGID
chmod +t /tmp           # Activa sticky bit (aparece como 't' al final)
```