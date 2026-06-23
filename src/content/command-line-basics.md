## La Shell: Tu Nuevo Mejor Amigo

Cuando abres una terminal, ves algo como:

```
user@linuxcourse:~$
```

Eso se llama el **prompt** (el símbolo del sistema). Te dice:
- `user`: tu nombre de usuario
- `linuxcourse`: el nombre de la computadora
- `~`: el directorio donde estás (`~` significa tu carpeta personal, /home/user)
- `$`: indica que eres un usuario normal (si fuera `#` serías root, el superadministrador)

Cuando necesitas hacer cambios importantes (instalar programas, modificar archivos del sistema), usas **`sudo`** antes del comando. Te pedirá tu contraseña y ejecutará ese comando como administrador. Por ahora, no te preocupes por esto — lo veremos más adelante.

A partir de ahora, todo lo que escribas después del prompt será un **comando** que la shell ejecutará.

## Navegación: ¿Dónde Estoy y Cómo Me Muevo?

Imagina que estás dentro de un árbol de carpetas gigante. Tres comandos te salvarán la vida:

### `pwd` — Print Working Directory (Mostrar dónde estoy)
Escribe `pwd` y presiona Enter. La terminal te dice exactamente en qué carpeta estás parado:

```bash
pwd
/home/user
```

### `ls` — List Directory Contents (Listar archivos)
`ls` te muestra qué hay en la carpeta actual:

```bash
ls
Documents  Downloads  projects  file.txt  script.sh  config.conf
```

Pruébalo con variantes:
- `ls -l`: lista en formato detallado (permisos, tamaño, fecha)
- `ls -a`: muestra archivos ocultos (los que empiezan con `.`)
- `ls -la`: combina ambos
- `ls -S`: ordena los archivos por tamaño, del más grande al más pequeño

### `cd` — Change Directory (Cambiar de carpeta)
`cd` te mueve entre carpetas:

```bash
cd Documents      # Entra a la carpeta Documents
cd ..             # Sube una carpeta (al padre)
cd ~              # Va a tu carpeta personal
cd -              # Vuelve a la carpeta anterior
cd /etc           # Va directamente a /etc (ruta absoluta)
```

Verás que el **prompt** (el texto `user@linuxcourse:~/Documents$`) se actualiza al entrar o salir de carpetas. Si estás en tu carpeta personal aparece `~`, si entras a `/etc` aparece `/etc`.

**Rutas absolutas vs relativas:**
- **Absoluta**: empieza desde / — `/home/user/Documents`
- **Relativa**: desde donde estás — `Documents` (si ya estás en /home/user)

El directorio actual se representa con un punto (`.`). Puedes usarlo en comandos: `ls .` lista la carpeta actual, `cp /etc/hostname .` copia un archivo al directorio donde estás.

## Operaciones con Archivos

### Crear — `touch`
Crea un archivo vacío:

```bash
touch notas.txt
touch script.sh proyecto.md
```

### Crear Carpeta — `mkdir`
```bash
mkdir proyectos          # Crea una carpeta
mkdir -p a/b/c           # Crea carpetas anidadas (como mkdir -p en Windows)
```

### Copiar — `cp`
```bash
cp notas.txt respaldo.txt          # Copia un archivo
cp -r proyectos respaldo_proyectos  # Copia una carpeta (-r = recursivo)
```

### Mover / Renombrar — `mv`
```bash
mv notas.txt /home/user/Documents/  # Mueve a otra carpeta
mv oldname.txt newname.txt          # Renombra
```

### Eliminar — `rm`
**Cuidado**: esto no va a la papelera de reciclaje. Se borra para siempre.

```bash
rm notas.txt                # Elimina un archivo
rm -rf carpeta              # Elimina una carpeta y todo su contenido (-rf = recursive force)
```

### Ver Contenido — `cat`
Muestra el contenido de un archivo en la terminal:

```bash
cat file.txt
cat /etc/hostname
```

### Ver Solo el Principio o el Final — `head` y `tail`
Cuando un archivo es muy largo, `head` muestra solo las primeras líneas y `tail` las últimas:

```bash
head -3 /etc/passwd       # Primeras 3 líneas
tail -10 /etc/passwd      # Últimas 10 líneas
```

### Contar Líneas, Palabras y Caracteres — `wc`
`wc` (word count) te dice cuántas líneas, palabras y caracteres tiene un archivo:

```bash
wc /etc/passwd           # Muestra líneas, palabras y caracteres
wc -l /etc/passwd        # Solo las líneas
wc -w /etc/passwd        # Solo las palabras
```

### Buscar Archivos — `find`
Cuando no recuerdas dónde está un archivo, `find` lo encuentra:

```bash
find /etc -name "*.conf"          # Busca archivos .conf en /etc
find ~ -name "notas.txt"          # Busca notas.txt en tu carpeta personal
```

## Ayuda Integrada — `man`

Cada comando en Linux tiene un **manual** (man page) que explica para qué sirve, qué opciones tiene y cómo usarlo. Es como tener una enciclopedia en la terminal:

```bash
man ls       # Manual del comando ls
man find     # Manual del comando find
```

Navega con las flechas y presiona `q` para salir. No necesitas memorizar todo — con saber que `man` existe ya tienes la respuesta a cualquier duda.

## Pipes (Tuberías) — `|`

El **pipe** (simbolizado con `|`) es una de las herramientas más poderosas de Linux. Toma la salida de un comando y la convierte en la entrada del siguiente.

Piénsalo como una tubería que conecta dos programas:

```bash
ls -la | grep ".txt"        # Lista todos los archivos, pero solo muestra los .txt
cat /etc/passwd | wc -l     # Cuenta cuántos usuarios hay en el sistema
```

### Redirecciones — `>`, `>>`

- `>` guarda la salida en un archivo (sobrescribe si ya existe)
- `>>` añade la salida al final del archivo

```bash
echo "Hola mundo" > saludo.txt      # Crea saludo.txt con "Hola mundo"
echo "Otra línea" >> saludo.txt      # Añade otra línea al final
```

## Trucos de Terminal

- **Tab ↹**: autocompleta comandos y rutas
- **↑ ↓**: navega por el historial de comandos
- **Ctrl + C**: cancela un comando que se colgó
- **Ctrl + L**: limpia la pantalla (como escribir `clear`)
- **Ctrl + A**: va al inicio de la línea
- **Ctrl + E**: va al final de la línea

## Resumen de Comandos

| Comando | Qué hace |
|---------|----------|
| `pwd` | Muestra dónde estás |
| `ls` | Lista archivos |
| `cd` | Cambia de carpeta |
| `mkdir` | Crea carpeta |
| `touch` | Crea archivo vacío |
| `cp` | Copia |
| `mv` | Mueve o renombra |
| `rm` | Elimina (¡cuidado!) |
| `cat` | Muestra contenido |
| `head` | Muestra las primeras líneas de un archivo |
| `tail` | Muestra las últimas líneas de un archivo |
| `wc` | Cuenta líneas, palabras y caracteres |
| `echo` | Imprime texto |
| `clear` | Limpia la terminal |
| `history` | Muestra comandos anteriores |
| `find` | Busca archivos y carpetas |
| `man` | Muestra el manual de ayuda de un comando |