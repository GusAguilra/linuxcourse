## ¿Qué es una Red?

Una **red** es simplemente dos o más computadoras conectadas que pueden intercambiar información. Internet es la red más grande del mundo.

Cada computadora en una red tiene una **dirección IP** (como una dirección postal). La IP identifica de manera única a esa máquina en la red.

Una IP típica se ve así: `192.168.1.10`

Las IPs se dividen en rangos **públicos** (accesibles desde internet) y **privados** (solo dentro de tu red local). Las IPs privadas más comunes empiezan con `192.168.`, `10.` o `172.16.`.

Cuando veas una IP seguida de `/24` como `192.168.1.0/24`, eso es **notación CIDR**. El `/24` significa que los primeros 24 bits son la red y el resto son direcciones de dispositivos. En la práctica, `/24` = 256 direcciones disponibles.

## Configuración de Red en Linux

### Ver las interfaces de red

```bash
ip addr               # Muestra todas las interfaces y sus direcciones IP
ip link               # Muestra las interfaces (activas/inactivas)
ip link set eth0 down # Desactiva una interfaz de red
ip link set eth0 up   # Activa una interfaz de red
```

**`ip`** es el comando moderno que reemplaza a `ifconfig`, `netstat`, `route` y `arp`. Aunque aún verás los comandos antiguos en muchos tutoriales, `ip` es el estándar actual.

### Ver la tabla de ruteo (routing)

El **ruteo** (routing) decide por dónde enviar los paquetes para que lleguen a su destino.

```bash
ip route              # Muestra la tabla de ruteo
```

Un ejemplo típico:
```
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10
```

Esto dice: "Para ir a internet (default), pasa por 192.168.1.1 (el router)".

### Herramientas de diagnóstico

Cuando algo no funciona en la red, estos son tus mejores amigos:

**`ping` — ¿Hay conexión?**
```bash
ping -c 4 8.8.8.8               # Envía 4 paquetes ICMP a Google DNS y mide el tiempo de respuesta
ping -c 4 google.com            # También funciona con nombres de dominio
```

Ping usa el protocolo **ICMP** (Internet Control Message Protocol), un protocolo de diagnóstico que no necesita puertos TCP/UDP.

**`ip neigh` — ¿Qué dispositivos hay en mi red local?**
```bash
ip neigh                          # Muestra la tabla ARP (IPs vecinas y sus direcciones MAC)
```

Si ping funciona, hay conectividad. Si no, algo está mal.

**`traceroute` — ¿Dónde se pierde la conexión?**
```bash
traceroute 8.8.8.8             # Muestra cada salto que da un paquete hasta llegar al destino
```

**`ss` — ¿Qué puertos están escuchando?**
```bash
ss -tulpn                      # Muestra puertos TCP/UDP en escucha (versión moderna de netstat)
```

Si trabajas con sistemas antiguos, aún encontrarás `netstat`:

```bash
netstat -tulpn                 # Equivalente tradicional de ss
```

**`curl` y `wget` — Probar servicios web**
```bash
curl -I https://ejemplo.com    # Muestra las cabeceras HTTP de un sitio web
wget -O- https://ejemplo.com   # Descarga el contenido y lo muestra en pantalla
```

## DNS — Traducir Nombres a IPs

Los humanos recordamos nombres (google.com), las computadoras recuerdan IPs (142.250.64.78). El **DNS** (Domain Name System) es la agenda telefónica que traduce uno en otro.

```bash
host google.com                # Consulta DNS simple
nslookup google.com            # Consulta DNS más detallada
dig google.com                 # La herramienta más completa para DNS
dig -x 8.8.8.8                 # DNS inverso: ¿qué nombre tiene esta IP?
```

### Archivos importantes de DNS

```
/etc/hosts                     # Mapa local nombre → IP (tiene prioridad sobre DNS)
/etc/resolv.conf               # Qué servidores DNS usar (ej: 8.8.8.8)
```

## SSH — Conectar a Otra Máquina Remotamente

**SSH** (Secure Shell) te permite conectarte a otra computadora Linux por la red como si estuvieras sentado frente a ella.

### Conectar

```bash
ssh usuario@192.168.1.50               # Conecta por SSH
ssh -p 2222 usuario@192.168.1.50       # Puerto personalizado (el default es 22)
```

### Copiar archivos por SSH

```bash
scp documento.txt usuario@192.168.1.50:/home/usuario/   # Copia un archivo
rsync -avz ./carpeta/ usuario@192.168.1.50:/carpeta/    # Sincroniza carpetas
```

### Claves SSH (sin contraseña)

En lugar de escribir la contraseña cada vez, puedes usar **claves SSH**:

```bash
ssh-keygen -t ed25519           # Genera un par de claves (pública y privada)
ssh-copy-id usuario@host        # Copia tu clave pública al servidor
```

A partir de ahí, conectas sin contraseña.