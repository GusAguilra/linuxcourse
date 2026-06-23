## La Familia RHEL

Mientras Debian/Ubuntu usan `apt`, la familia RHEL (Red Hat, Fedora, Rocky, Alma) usa `dnf` (Dandified YUM). El concepto es el mismo: un gestor de paquetes que instala programas desde repositorios.

## DNF — El Gestor Moderno

**dnf** es el sucesor de **yum** (Yellowdog Updater Modified). Si ves tutoriales viejos que usan `yum`, funciona igual.

### Buscar un programa

```bash
dnf search nginx               # Busca paquetes que contengan "nginx"
dnf info nginx                 # Muestra info detallada del paquete
```

### Instalar un programa

```bash
sudo dnf install nginx         # Instala nginx
sudo dnf install vim git curl  # Varios a la vez
```

### Actualizar

```bash
sudo dnf update                # Actualiza todos los paquetes (dnf update también actualiza el índice)
sudo dnf upgrade               # Similar, pero con más opciones
sudo dnf check-update          # Solo revisa si hay actualizaciones disponibles (no instala nada)
```

### Eliminar

```bash
sudo dnf remove nginx          # Elimina nginx
sudo dnf autoremove            # Limpia dependencias huérfanas
```

### Ver qué tienes

```bash
dnf list installed             # Paquetes instalados
dnf list available             # Paquetes disponibles (no instalados)
dnf history                    # Historial de instalaciones/eliminaciones
```

### Grupos de Paquetes

En RHEL puedes instalar grupos completos de programas relacionados:

```bash
dnf groupinstall "Development Tools"     # Compiladores, make, git, etc.
dnf groupinstall "Web Server"            # Apache, PHP, etc.
```

## RPM — El Gestor de Bajo Nivel

**rpm** (RPM Package Manager) es el equivalente a dpkg en Debian. Trabaja con archivos .rpm.

```bash
sudo rpm -ivh paquete.rpm      # Instala un .rpm (i=install, v=verbose, h=progress)
sudo rpm -e paquete            # Elimina un paquete (e=erase)
rpm -qa                        # Consulta todos los paquetes instalados (q=query, a=all)
rpm -ql nginx                  # Lista archivos que instaló nginx (q=query, l=list)
rpm -qf /etc/nginx/nginx.conf  # ¿Qué paquete puso este archivo? (q=query, f=file)
rpm -qi nginx                  # Información del paquete (q=query, i=info)
rpm -V nginx                   # Verifica si los archivos del paquete han sido modificados
```

## EPEL — El Repositorio Extra

RHEL y Rocky Linux son muy estables, pero tienen menos paquetes que Ubuntu. **EPEL** (Extra Packages for Enterprise Linux) es un repositorio comunitario con paquetes adicionales.

```bash
sudo dnf install epel-release  # Instala el repositorio EPEL
```

Después de instalarlo, tendrás acceso a miles de paquetes extra.

## Comparativa: Debian vs RHEL

| Operación | Debian/Ubuntu | RHEL/Fedora |
|-----------|--------------|-------------|
| Actualizar índice | `apt update` | `dnf update` (lo hace todo) |
| Instalar | `apt install` | `dnf install` |
| Eliminar | `apt remove` | `dnf remove` |
| Buscar | `apt search` | `dnf search` |
| Bajo nivel | `dpkg` | `rpm` |
| Archivo | .deb | .rpm |
| Configuración | /etc/apt/ | /etc/yum.repos.d/ |