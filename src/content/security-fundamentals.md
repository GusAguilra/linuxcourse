## Seguridad en Linux

Linux es considerado uno de los sistemas operativos más seguros, pero no por arte de magia. Su seguridad se basa en varias capas que trabajan juntas.

## 1. Firewall — El Portero

El **firewall** es como un portero que decide qué tráfico de red entra y sale de tu computadora. Puedes decirle: "Deja pasar conexiones SSH pero bloquea todo lo demás".

### firewalld (RHEL/Fedora)

```bash
sudo systemctl enable --now firewalld          # Activa el firewall
sudo firewall-cmd --list-all                    # Muestra las reglas actuales
sudo firewall-cmd --add-service=http            # Permite tráfico HTTP (puerto 80)
sudo firewall-cmd --add-port=8080/tcp           # Permite un puerto específico
sudo firewall-cmd --runtime-to-permanent        # Hace los cambios permanentes
sudo firewall-cmd --zone=public --remove-service=ssh  # Bloquea SSH (¡con cuidado!)
```

### ufw (Debian/Ubuntu)

**ufw** (Uncomplicated Firewall) es la versión simplificada para Ubuntu/Debian:

```bash
sudo ufw enable                                  # Activa el firewall
sudo ufw allow ssh                               # Permite SSH (puerto 22)
sudo ufw allow 80/tcp                            # Permite HTTP
sudo ufw allow 443/tcp                           # Permite HTTPS
sudo ufw deny 23                                 # Bloquea Telnet
sudo ufw status verbose                          # Muestra las reglas
sudo ufw delete allow 80/tcp                     # Elimina una regla
```

### iptables/nftables (bajo nivel)

Por debajo del firewall hay **iptables** (antiguo) o **nftables** (moderno):

```bash
sudo iptables -L -n -v                           # Lista todas las reglas
```

No necesitas aprender iptables a menos que quieras ser experto en redes.

## 2. SELinux — El Guardián de Permisos (RHEL/Fedora)

**SELinux** (Security-Enhanced Linux) es un sistema de control de acceso obligatorio creado por la NSA. Funciona a nivel de kernel y puede bloquear incluso al usuario root si algo viola las políticas.

Imagina que tienes un servidor web. Incluso si un hacker logra controlarlo, SELinux evita que el proceso web acceda a archivos que no debería (como /etc/shadow o /home/usuario).

```bash
getenforce                       # Muestra el modo: Enforcing, Permissive, o Disabled
sudo setenforce 1                # Enforcing (1) — bloquea lo que no está permitido
sudo setenforce 0                # Permissive (0) — solo registra, no bloquea
sestatus                         # Estado detallado de SELinux
```

**Modos:**
- **Enforcing**: bloquea activamente lo que no está permitido (seguro)
- **Permissive**: solo registra las violaciones (para depurar)
- **Disabled**: completamente desactivado (no recomendado)

Si un programa no funciona y sospechas que es SELinux:

```bash
sudo setenforce 0                # Prueba en modo permisivo
# Si el problema desaparece, SELinux está bloqueando algo
sudo setenforce 1                # Vuelve a enforcing
```

## 3. AppArmor — Alternativa a SELinux (Debian/Ubuntu)

**AppArmor** es el equivalente a SELinux pero más simple. En lugar de etiquetar archivos, asigna perfiles a programas.

```bash
sudo aa-status                   # Muestra los perfiles cargados
sudo aa-enforce /ruta/programa   # Activa perfil en modo enforcing
sudo aa-complain /ruta/programa  # Modo queja (solo registra)
```

## 4. Cifrado de Archivos

Si alguien roba tu disco duro, puede leer todos tus archivos a menos que estén cifrados.

### GPG — Cifrado simple

```bash
gpg -c documento.txt             # Cifra con contraseña (crea documento.txt.gpg)
gpg documento.txt.gpg            # Descifra (te pide la contraseña)
```

### OpenSSL — Cifrado avanzado

```bash
openssl enc -aes-256-cbc -salt -in archivo -out archivo.enc   # Cifra
openssl enc -d -aes-256-cbc -in archivo.enc -out archivo      # Descifra
```

## Buenos Hábitos de Seguridad

1. **No uses root para todo** — usa sudo solo cuando sea necesario
2. **No expongas SSH en el puerto 22** en servidores públicos (cámbialo a otro puerto)
3. **Usa claves SSH** en lugar de contraseñas
4. **Mantén el sistema actualizado**: `sudo apt update && sudo apt upgrade` (o `sudo dnf update`)
5. **Principio de mínimo privilegio**: da solo los permisos necesarios
6. **Revisa los logs**: `journalctl -xe` (errores recientes)