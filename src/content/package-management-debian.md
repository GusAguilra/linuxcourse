## ¿Qué es un Paquete?

En Windows, instalas programas descargando un .exe de internet. En Linux, los programas vienen en **paquetes** (packages) que se instalan desde **repositorios** (repositories) — como una tienda de aplicaciones oficial.

Ventajas:
- Un solo comando instala el programa y todas sus dependencias
- Las actualizaciones son centralizadas
- No tienes que buscar en Google "descargar X para Linux"

## APT — El Gestor Debian

**APT** (Advanced Package Tool) es el gestor de paquetes de las distribuciones basadas en Debian (Ubuntu, Mint, etc.).

### Antes de empezar: actualizar los repositorios

```bash
sudo apt update
```

Esto no actualiza tus programas. Solo descarga la lista de qué versiones están disponibles en los repositorios. Es como ir al supermercado a ver qué hay en los estantes.

### Instalar un programa

```bash
sudo apt install nginx         # Instala el servidor web nginx
sudo apt install vim git curl  # Instala varios paquetes a la vez
sudo apt install nginx -y      # -y responde "sí" automáticamente (útil para scripts)
```

### Buscar un programa

```bash
apt search "editor de texto"   # Busca paquetes por nombre o descripción
apt show vim                   # Muestra información detallada de un paquete
```

### Actualizar todos los programas

```bash
sudo apt upgrade               # Actualiza los paquetes instalados a su última versión
sudo apt full-upgrade          # Como upgrade, pero resuelve cambios de dependencias
```

### Eliminar un programa

```bash
sudo apt remove nginx          # Elimina nginx pero deja los archivos de configuración
sudo apt purge nginx           # Elimina nginx Y sus archivos de configuración
sudo apt autoremove            # Elimina paquetes que ya no necesita nadie
sudo apt clean                 # Limpia la caché local de paquetes .deb descargados
```

### Ver dependencias

```bash
apt depends nginx              # Muestra de qué depende un paquete
```

### Ver qué tienes instalado

```bash
apt list --installed           # Lista todo lo instalado
apt list --upgradable          # Lista lo que se puede actualizar
```

## dpkg — El Gestor de Bajo Nivel

**dpkg** es el programa que hace el trabajo pesado por debajo de apt. Cuando instalas un archivo .deb manualmente, usas dpkg.

```bash
sudo dpkg -i paquete.deb       # Instala un archivo .deb descargado manualmente
sudo dpkg -r paquete           # Elimina un paquete (remove)
sudo dpkg -P paquete           # Elimina un paquete (purge, con configuración)
dpkg -l                        # Lista todos los paquetes instalados
dpkg -L nginx                  # Lista todos los archivos que instaló nginx
dpkg -S /etc/nginx/nginx.conf  # ¿Qué paquete puso este archivo aquí?
```

## ¿Por Qué `sudo`?

Muchos comandos de instalación necesitan `sudo` (super user do). Es como hacer clic en "sí, quiero instalar esto" en Windows, pero desde la terminal.

```bash
sudo apt install nginx
# Te pedirá tu contraseña (mientras escribes no se ve nada, es normal)
```

## Repositorios

Los repositorios se definen en `/etc/apt/sources.list`. Cada línea apunta a un servidor que contiene paquetes. Si necesitas un programa que no está en los repositorios oficiales:

```bash
sudo add-apt-repository ppa:nombre-del-ppa
sudo apt update
sudo apt install programa
```

## Solución de Problemas

A veces algo se rompe. No entres en pánico:

```bash
sudo apt --fix-broken install    # Repara dependencias rotas
sudo dpkg --configure -a         # Repara instalaciones que se quedaron a medias
```