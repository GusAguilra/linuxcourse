## ¿Qué es un Script?

Un **script** es un archivo de texto que contiene una secuencia de comandos de la terminal. En lugar de escribir los comandos uno por uno, los pones todos en un archivo y los ejecutas de una vez.

Ejemplo: en lugar de hacer:
```bash
mkdir backup
cd backup
cp -r /home/usuario/documentos .
tar -czf backup.tar.gz documentos
```

Creas un archivo `hacer-backup.sh` con esos comandos, y cada vez que necesites hacer un backup, ejecutas `./hacer-backup.sh`.

## Tu Primer Script

Crea un archivo llamado `hola.sh`:

```bash
#!/bin/bash
# Mi primer script
echo "¡Hola, mundo!"
echo "Hoy es $(date)"
echo "Mi usuario es $(whoami)"
```

La primera línea `#!/bin/bash` se llama **shebang**. Le dice al sistema que este script debe ejecutarse con bash.

Para ejecutarlo:
```bash
chmod +x hola.sh       # Dale permiso de ejecución
./hola.sh              # Ejecuta el script
```

## Variables

Las variables almacenan datos para usarlos después:

```bash
#!/bin/bash
nombre="Alicia"
edad=25
echo "Hola, $nombre. Tienes $edad años."
echo "El script se llama: $0"
```

### Variables especiales

| Variable | ¿Qué contiene? |
|----------|---------------|
| $0 | El nombre del script |
| $1, $2, ... | Los argumentos que le pasaste al script |
| $# | Cuántos argumentos le pasaste |
| $@ | Todos los argumentos juntos |
| $? | Código de salida del último comando (0 = bien) |
| $$ | PID del script actual |

```bash
#!/bin/bash
echo "Hola, $1"                # ./saludar.sh Alicia → "Hola, Alicia"
echo "Pasaste $# argumentos"   # → "Pasaste 1 argumento"
```

### Sustitución de comandos

Puedes ejecutar un comando y usar su salida como valor con `$()`:

```bash
fecha=$(date +%Y-%m-%d)       # Ejecuta date y guarda el resultado
echo "Hoy es $fecha"
```

La sintaxis antigua con **backticks** (`...`) aún funciona pero `$()` es más legible y se puede anidar.

### Aritmética en Bash

Para hacer operaciones matemáticas, envuelve la expresión en `$(( ))`:

```bash
suma=$((3 + 5))
echo $suma                     # → 8

contador=$((contador + 1))     # Incrementa el contador en 1
echo "$((10 / 2))"             # → 5
```

### Códigos de salida (`exit`)

Todo comando termina con un número (0 = éxito, cualquier otro = error):

```bash
ls /existente                  # → código 0
ls /no-existe                  # → código 2
echo $?                        # Muestra el código del último comando
```

En scripts puedes terminar con tu propio código con `exit`:

```bash
if [ ! -f "importante.txt" ]; then
    echo "Error: archivo no encontrado"
    exit 1                     # Sale con código de error
fi
exit 0                         # Éxito
```

### Manipular rutas

```bash
basename /home/usuario/doc.txt     # → doc.txt
dirname /home/usuario/doc.txt      # → /home/usuario
```

## Condicionales (if)

Los scripts toman decisiones con `if`:

```bash
#!/bin/bash
if [ -f "/etc/passwd" ]; then
    echo "El archivo /etc/passwd existe"
else
    echo "Algo anda muy mal"
fi
```

### Pruebas comunes

```
[ -f archivo ]     → ¿existe el archivo?
[ -d directorio ]  → ¿existe el directorio?
[ -x archivo ]     → ¿es ejecutable?
[ "$a" = "$b" ]    → ¿son iguales las cadenas?
[ $num -gt 10 ]    → ¿es el número mayor que 10?
[ -z "$var" ]      → ¿está vacía la variable?
```

Operadores numéricos: `-eq` (igual), `-ne` (no igual), `-lt` (menor), `-gt` (mayor)

## Bucles (for, while)

### for — repetir para cada elemento

```bash
#!/bin/bash
for i in 1 2 3 4 5; do
    echo "Número $i"
done

# También puedes usar rangos:
for i in {1..5}; do
    echo "Número $i"
done

# O archivos:
for archivo in *.txt; do
    echo "Procesando $archivo"
done
```

### while — repetir mientras se cumpla una condición

```bash
#!/bin/bash
contador=1
while [ $contador -le 5 ]; do
    echo "Vuelta $contador"
    contador=$((contador + 1))
done
```

## Funciones

Agrupa código que se repite:

```bash
#!/bin/bash
saludar() {
    local nombre="$1"
    echo "¡Hola, $nombre!"
}

saludar "Alicia"
saludar "Bob"
```

La palabra `local` hace que la variable solo exista dentro de la función.

## Script Completo: Backup Automático

```bash
#!/bin/bash
# Script: backup.sh
# Uso: ./backup.sh /ruta/a/respaldar

fecha=$(date +%Y%m%d_%H%M%S)
origen="$1"
destino="$HOME/backups/backup_$fecha.tar.gz"

if [ -z "$origen" ]; then
    echo "Uso: $0 <ruta_a_respaldar>"
    exit 1
fi

if [ ! -d "$origen" ]; then
    echo "Error: '$origen' no es un directorio válido"
    exit 1
fi

mkdir -p "$HOME/backups"
tar -czf "$destino" "$origen"
echo "Backup creado: $destino"
exit 0
```