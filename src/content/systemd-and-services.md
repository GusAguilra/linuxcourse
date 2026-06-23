## ¿Qué es Systemd?

**Systemd** es el sistema de inicio (init system) de la mayoría de distribuciones Linux modernas. Es el primer programa que se ejecuta cuando enciendes la computadora, y se encarga de:
1. Arrancar todos los servicios necesarios
2. Mantenerlos funcionando
3. Reiniciarlos si fallan
4. Apagarlos ordenadamente al cerrar el sistema

Antes de systemd existía **SysV init** (con sus famosos "runlevels"). Systemd lo reemplazó por ser más rápido y paralelizar el arranque.

## Gestionar Servicios con `systemctl`

Un **servicio** es un programa que se ejecuta en segundo plano sin que lo veas. Ejemplos: servidor web (nginx), base de datos (MySQL), SSH, etc.

### Ver el estado de un servicio

```bash
systemctl status nginx           # ¿Está funcionando? ¿Qué ha hecho?
systemctl is-active nginx        # Solo dice "active" o "inactive"
systemctl is-enabled nginx       # ¿Arranca automáticamente al encender?
systemctl cat nginx              # Muestra el unit file completo del servicio
```

### Listar unidades

```bash
systemctl list-units --type=service              # Lista todos los servicios activos
systemctl list-units --failed                    # Muestra las unidades que fallaron al iniciar

```bash
sudo systemctl start nginx       # Inicia el servicio ahora
sudo systemctl stop nginx        # Lo detiene
sudo systemctl restart nginx     # Lo reinicia
sudo systemctl reload nginx      # Recarga configuración SIN reiniciar (ideal para cambios de config)
```

### Habilitar y deshabilitar al arranque

```bash
sudo systemctl enable nginx      # Se inicia automáticamente al encender la PC
sudo systemctl disable nginx     # No arranca automáticamente
sudo systemctl enable --now nginx  # Habilita E inicia ahora (combo)
```

## Archivos de Unidad (Unit Files)

Cada servicio tiene un **unit file** (archivo de unidad) que le dice a systemd cómo manejarlo.

Se encuentran en:
- `/usr/lib/systemd/system/` → instalados por paquetes (no tocar)
- `/etc/systemd/system/` → personalizados por el administrador

Ejemplo de un unit file (`/etc/systemd/system/mi-servicio.service`):

```ini
[Unit]
Description=Mi servicio personalizado
After=network.target          # Arranca después de que la red esté lista

[Service]
Type=simple
ExecStart=/usr/local/bin/mi-app
Restart=on-failure            # Reinicia si falla
User=miapp                    # Ejecuta como este usuario

[Install]
WantedBy=multi-user.target    # Se activa en modo multiusuario
```

## Logs con `journalctl`

Systemd tiene su propio sistema de logs (diario de registros). Todo lo que hacen los servicios queda registrado.

```bash
journalctl -u nginx               # Muestra los logs de nginx
journalctl -u nginx -n 20         # Últimas 20 líneas
journalctl -f                     # Sigue los logs en tiempo real (como tail -f)
journalctl --since "1 hour ago"   # Desde hace 1 hora
journalctl -p err                 # Solo errores
journalctl --no-pager             # Sin paginación (muestra todo de una vez)
```

## Temporizadores (Timers)

Systemd puede ejecutar tareas programadas, reemplazando a `cron`. Los temporizadores son más flexibles y tienen mejor logging.

```bash
systemctl list-timers             # Lista todos los temporizadores activos
```

## Targets (Antiguos Runlevels)

Los **targets** son estados del sistema. Cada target representa una configuración de servicios que deben estar activos.

| Target | Runlevel | ¿Qué hace? |
|--------|----------|-----------|
| `poweroff.target` | 0 | Apaga el sistema |
| `rescue.target` | 1 | Modo monousuario (solo root, para reparar) |
| `multi-user.target` | 3 | Normal, sin interfaz gráfica (servidores) |
| `graphical.target` | 5 | Normal, con interfaz gráfica |
| `reboot.target` | 6 | Reinicia |

```bash
systemctl get-default              # ¿En qué target arranca el sistema?
sudo systemctl set-default multi-user.target  # Cambia a modo servidor (sin GUI)
sudo systemctl isolate multi-user.target     # Cambia ahora mismo a ese target
```