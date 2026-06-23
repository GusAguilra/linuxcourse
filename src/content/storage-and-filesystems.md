## Discos, Particiones y Sistemas de Archivos

Tu computadora tiene discos (SSD, HDD, NVMe). Para usarlos, hay que:
1. **Particionar**: dividir el disco en secciones (como separar un pastel en porciones)
2. **Formatear**: crear un sistema de archivos en cada partición (como ponerle un estante a un armario)
3. **Montar**: conectar la partición a una carpeta para poder acceder a ella

## Ver los Discos

```bash
lsblk                       # Muestra todos los discos y particiones (como un árbol)
sudo fdisk -l               # Lista detallada con tablas de particiones
blkid                       # Muestra UUID y tipo de sistema de archivos
```

### ¿Qué es un UUID?

Cada partición tiene un **UUID** (Universally Unique Identifier) — un identificador único universal. Es como su número de serie. Se usa en `/etc/fstab` para montar discos de forma confiable.

## Espacio en Disco

```bash
df -h                       # Muestra cuánto espacio libre/ocupado tienes en cada disco
du -sh /home/usuario        # Muestra cuánto ocupa una carpeta específica
```

- `df` = disk free (espacio libre en los discos)
- `du` = disk usage (cuánto ocupa una carpeta)
- `-h` = human-readable (muestra en KB, MB, GB en vez de bytes)

Para ver la memoria RAM y swap:

```bash
free -h                     # Muestra memoria RAM total, usada y libre
```

## Crear Particiones y Sistemas de Archivos

```bash
sudo fdisk /dev/sda          # Particionado MBR (antiguo, pero común)
sudo gdisk /dev/sda          # Particionado GPT (moderno)
sudo parted /dev/sda         # Herramienta avanzada
```

Estos comandos son interactivos — te van guiando. No los ejecutes sin saber lo que haces o podrías borrar tu disco.

Una vez que tienes una partición (ej: /dev/sda1), le pones un sistema de archivos:

```bash
sudo mkfs.ext4 /dev/sda1     # Formatea como ext4 (el más común en Linux)
sudo mkfs.xfs /dev/sda1      # Formatea como XFS (bueno para archivos grandes)
sudo mkswap /dev/sda2        # Formatea como swap (memoria virtual)
```

## Montar y Desmontar

Montar = conectar una partición a una carpeta para poder acceder a su contenido.

```bash
sudo mount /dev/sda1 /mnt/datos     # Monta la partición en la carpeta /mnt/datos
sudo umount /mnt/datos              # Desmonta (importante: umount, NO unmount)
mount -a                            # Monta todo lo que está en /etc/fstab
findmnt                             # Muestra el árbol de montaje actual
```

## /etc/fstab — Montaje Automático

Cada vez que enciendes la computadora, Linux lee `/etc/fstab` para saber qué particiones montar y dónde.

```
UUID=abc123-...  /datos  ext4  defaults  0  2
```

Campos:
1. **Dispositivo** (UUID o ruta como /dev/sda1)
2. **Punto de montaje** (dónde montarlo)
3. **Tipo** (ext4, xfs, swap, etc.)
4. **Opciones** (defaults, noatime, ro, etc.)
5. **Dump** (0 = no hacer backup, 1 = sí)
6. **Pass** (0 = no verificar al arrancar, 1 = raíz, 2 = otros)

## Sistemas de Archivos Comunes

| Tipo | Tamaño máximo | Ideal para |
|------|--------------|-----------|
| **ext4** | 1 EB (disco) / 16 TB (archivo) | Uso general — el estándar en Linux |
| **XFS** | 8 EB | Archivos muy grandes, bases de datos |
| **btrfs** | 16 EB | Snapshots, compresión, flexibilidad |
| **swap** | — | Memoria virtual (como el archivo de paginación de Windows) |

## LVM — Logical Volume Manager

LVM es una capa de abstracción que te permite redimensionar particiones sin perder datos. Es como tener discos virtuales flexibles.

Conceptos:
- **PV** (Physical Volume): el disco físico o partición
- **VG** (Volume Group): grupo de discos físicos que se comportan como uno solo
- **LV** (Logical Volume): el "disco virtual" que creas dentro del VG

```bash
sudo pvcreate /dev/sda1              # Prepara el disco físico para LVM
sudo vgcreate vg_datos /dev/sda1     # Crea el grupo de volúmenes
sudo lvcreate -L 10G -n lv_datos vg_datos  # Crea un volumen lógico de 10GB
```

La magia: puedes agrandar un LV sin perder datos:

```bash
sudo lvextend -L +5G /dev/vg_datos/lv_datos   # Añade 5GB
sudo resize2fs /dev/vg_datos/lv_datos          # Redimensiona el sistema de archivos
```