## ¿Qué es un Proceso?

Un **proceso** es simplemente un programa que está en ejecución. Cuando abres Firefox, se crea un proceso. Cuando ejecutas `ls`, se crea un proceso que dura una fracción de segundo.

Cada proceso tiene un número único llamado **PID** (Process ID — Identificador de Proceso). Es como su cédula de identidad.

El primer proceso que arranca al encender Linux es el **PID 1**, tradicionalmente `init` y hoy en día `systemd`. Todos los demás procesos descienden de él.

Puedes ver cuánto tiempo lleva encendido tu sistema con:

```bash
uptime                # Muestra tiempo encendido, usuarios y carga
```

### ¿Qué procesos tienes ahora?

Abre la terminal y escribe:

```bash
ps
```

Verás algo como:
```
  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 5678 pts/0    00:00:00 ps
```

Eso solo muestra los procesos de tu terminal. Para ver todo lo que se ejecuta en el sistema:

```bash
ps aux                # 'a'=todos, 'u'=formato usuario, 'x'=sin terminal
```

O en tiempo real (como el Administrador de Tareas de Windows):

```bash
top                   # Presiona 'q' para salir
```

Puedes filtrar `ps` de varias formas:

```bash
ps -p 1               # Muestra solo el proceso con PID 1
ps -u root            # Muestra los procesos de un usuario específico
ps auxf               # Muestra el árbol de procesos (padres e hijos)
ps aux --sort=-%cpu   # Ordena por uso de CPU (el que más consume primero)
```

## Estados de un Proceso

Los procesos pueden estar en varios estados. Los más comunes:

| Estado | Significado | ¿Qué pasa? |
|--------|-------------|-----------|
| **R** | Running | Se está ejecutando ahora mismo |
| **S** | Sleeping | Está esperando algo (un archivo, una tecla, etc.) |
| **D** | Uninterruptible Sleep | Esperando E/S (disco, red) — no se puede interrumpir |
| **Z** | Zombie | Ya terminó pero el padre no recogió su código de salida |
| **T** | Stopped | Está pausado (Ctrl+Z) |

## Señales: Cómo Hablarle a un Proceso

Los procesos no son ciegos a lo que pasa a su alrededor. Les puedes enviar **señales** (signals) para decirles qué hacer.

| Señal | Número | ¿Qué hace? | Ejemplo de uso |
|-------|--------|-----------|----------------|
| SIGTERM | 15 | Pide al proceso que termine **amablemente** | `kill 1234` (el default) |
| SIGKILL | 9 | **Fuerza** la terminación del proceso | `kill -9 1234` (cuando no responde) |
| SIGHUP | 1 | Recarga la configuración | `kill -1 1234` (nginx, apache) |
| SIGINT | 2 | Interrumpe (como Ctrl+C) | `kill -2 1234` |

```bash
kill 1234               # Envía SIGTERM (pidamos amablemente)
kill -9 1234            # Envía SIGKILL (a la fuerza)
kill -15 1234           # Envía SIGTERM explícitamente
kill -1 1234            # Envía SIGHUP (recargar config)
killall firefox         # Mata todos los procesos con ese nombre
pkill -u alicia         # Mata todos los procesos de un usuario
```

## Trabajar en Segundo Plano (Background)

A veces un programa tarda mucho. No quieres quedarte atrapado esperando. Linux te permite ejecutarlo **en segundo plano** (background).

```bash
comando &               # Ejecuta en segundo plano (el & al final)
# Ejemplo real:
sleep 30 &              # 'sleep 30' tardará 30s, pero tú sigues escribiendo
```

Si ya empezó un programa en primer plano y quieres liberar la terminal:

1. Presiona **Ctrl+Z** — lo suspende (lo detiene temporalmente)
2. Escribe `bg` — lo reanuda en segundo plano
3. Escribe `jobs` para ver los trabajos en segundo plano
4. Escribe `fg %1` para traerlo de vuelta al primer plano

```bash
jobs                  # Lista trabajos
bg %1                 # Reanuda el trabajo 1 en segundo plano
fg %1                 # Trae el trabajo 1 al primer plano
```

## Prioridades: nice y renice

El kernel decide qué procesos se ejecutan primero basado en su prioridad. La prioridad se controla con **nice value** (valor de "amabilidad").

- Rango: **-20** (máxima prioridad) a **+19** (mínima)
- Por defecto: **0**
- Entre más negativo, más tiempo de CPU recibe
- Solo root puede poner valores negativos

```bash
nice -n 10 ./script-lento.sh      # Ejecuta con prioridad baja
renice -n -5 -p 1234               # Aumenta prioridad de un proceso existente
```