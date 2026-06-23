## ¿Qué es Linux?

Imagina que tu computadora es un edificio. El **hardware** (CPU, memoria, disco duro) son los ladrillos y tuberías. El **sistema operativo** es el administrador del edificio: decide quién entra, qué recursos se usan, y mantiene todo funcionando.

Linux es un sistema operativo. Pero a diferencia de Windows o macOS, Linux no es una sola empresa — es un proyecto de **código abierto** (open source), lo que significa que cualquiera puede ver su código, modificarlo y compartirlo.

Linux está en todas partes:
- Tu celular Android funciona con Linux
- La mayoría de los servidores web (Google, Facebook, Amazon) usan Linux
- Las supercomputadoras más rápidas del mundo usan Linux
- Tu televisor, router, y hasta tu carro probablemente usan Linux

A menudo escucharás las siglas **GNU** (GNU's Not Unix). GNU es un proyecto iniciado por Richard Stallman en 1983 para crear un sistema operativo completamente libre. Las herramientas GNU (como bash, gcc, ls, grep, etc.) son parte fundamental de cualquier sistema Linux. Técnicamente, lo que llamamos "Linux" debería llamarse **GNU/Linux**, porque usa el kernel Linux con herramientas del proyecto GNU.

## El Kernel (Núcleo)

El **kernel** es el corazón de Linux. Es un programa que se encarga de:
- **Gestionar la CPU**: decide qué programa se ejecuta en cada momento
- **Gestionar la memoria**: asigna y libera espacio RAM
- **Gestionar dispositivos**: habla con tu teclado, mouse, disco duro, etc.

Piénsalo como el conductor de una orquesta: los músicos son los programas, y el kernel asegura que todos toquen en armonía sin pisarse.

Fue creado por **Linus Torvalds** en 1991 cuando era estudiante en Finlandia. Hoy, miles de desarrolladores en todo el mundo contribuyen a mejorarlo.

## La Shell (Intérprete de Comandos)

La **shell** es el programa que te permite darle órdenes a Linux escribiendo comandos. Es como el asistente que recibe tus instrucciones y las ejecuta.

Cuando abres una terminal, estás usando una shell. Las más comunes son:
- **bash** (Bourne Again SHell) — la más popular, viene por defecto en casi todas las distribuciones
- **zsh** — moderna, con mejoras como autocompletado inteligente
- **sh** — la shell original, más básica

No le temas a la terminal. Al principio parece misteriosa, pero es la herramienta más poderosa que aprenderás. En este curso, escribirás comandos en una terminal simulada y verás los resultados al instante.

## Primeros Comandos

Vamos a conocer algunos comandos básicos que usarás todo el tiempo:

| Comando    | ¿Qué hace?                                                |
|------------|-----------------------------------------------------------|
| `pwd`    | Muestra el directorio actual (Print Working Directory)    |
| `ls`     | Lista los archivos y carpetas en el directorio actual     |
| `echo`   | Muestra un mensaje en pantalla                            |
| `whoami` | Muestra tu nombre de usuario                              |
| `clear`  | Limpia la pantalla de la terminal                         |
| `history`| Muestra los últimos comandos ejecutados                   |
| `man`    | Muestra el manual de ayuda de cualquier comando           |
| `uname`  | Muestra información del sistema                           |
| `cd`     | Cambia al directorio especificado (Change Directory)      |

Pruébalos en la terminal. Por ejemplo, escribe `pwd` y presiona Enter para ver dónde estás. Escribe `echo Hola Linux` para ver tu primer mensaje. Con `man pwd` puedes leer el manual de cualquier comando (presiona `q` para salir).

## El Sistema de Archivos (Filesystem)

En Linux, **todo es un archivo**. Los documentos son archivos, las carpetas son archivos especiales, los dispositivos (como tu disco duro) son archivos, y hasta los programas en ejecución son archivos. Esto suena raro al principio, pero hace que todo sea consistente.

El sistema de archivos es un árbol que cuelga de **/** (la raíz, "root"). Algunas carpetas importantes:

| Ruta    | ¿Qué hay ahí?                                                       |
|---------|----------------------------------------------------------------------|
| /       | La raíz — el punto de partida de todo                                |
| /home   | Las carpetas personales de los usuarios (como "Mis Documentos")      |
| /etc    | Archivos de configuración del sistema                                |
| /tmp    | Archivos temporales (se borran al reiniciar)                         |
| /bin    | Programas esenciales que cualquier usuario puede ejecutar (ls, cp, mv, etc.) |
| /var    | Datos que cambian constantemente (logs, bases de datos)              |

Los archivos en Linux se almacenan en sistemas de archivos. El más común es **ext4** (Fourth Extended Filesystem), usado por defecto en la mayoría de distribuciones. Otros como **xfs** o **btrfs** se usan en escenarios más avanzados.

No necesitas memorizar esto ahora. Con la práctica, se vuelve natural.

## ¿Qué es una Distribución (distro)?

Linux es solo el kernel. Para tener un sistema completo, se necesita agregar programas, una shell, un gestor de ventanas, etc. Una **distribución** o **distro** es un empaquetado que incluye Linux + todo lo necesario para funcionar.

Las distribuciones se agrupan en dos grandes familias:

### Familia Debian (usa comandos `apt`)
- **Ubuntu**: La más popular para escritorio, amigable para principiantes
- **Debian**: Más estable, base de Ubuntu
- **Linux Mint**: Similar a Windows, muy fácil de usar

### Familia RHEL (usa comandos `dnf`)
- **Red Hat Enterprise Linux (RHEL)**: Usada en empresas, requiere suscripción
- **Fedora**: Moderna, con lo último en software
- **Rocky Linux**: Compatible con RHEL pero gratuita

A lo largo del curso aprenderás ambas familias. No te preocupes por elegir una ahora.

## ¿Qué vas a aprender en este curso?

1. A moverte por el sistema de archivos como un experto
2. A crear, copiar y eliminar archivos desde la terminal
3. A entender permisos, usuarios y procesos
4. A instalar programas con apt y dnf
5. A escribir scripts que automaticen tu trabajo
6. A configurar redes, servicios y seguridad

Al finalizar, tendrás una base sólida para administrar sistemas Linux en entornos reales.