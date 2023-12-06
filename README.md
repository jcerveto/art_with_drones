#SISTEMAS DISTRIBUIDOS

##Práctica no guiada: Sockets, Streaming de Eventos, Colas y modularidad.

#Art With Drones

    Joan Cerveto Serrano
    5 de noviembre de 2023

Tercer año de Ingeniería Informáitca. 

	Universitat d'Alacant

	Escuela Politécnica Superior



[1. Introducción](#introducción)
[2. Tecnologías](#tecnologías)
- [Introducción](#introducción)
- [Tecnologías.](#tecnologías)
  - [Despliegue de aplicación.](#despliegue-de-aplicación)
  - [Lenguajes de programación.](#lenguajes-de-programación)
  - [Persistencia.](#persistencia)
  - [Automatización.](#automatización)
  - [Control de versiones.](#control-de-versiones)



## Introducción

El objetivo de la práctica a desarrollar es un sistema distribuido que implemente una simulación de una solución para la creación de figuras mediante dispositivos autónomos (drones) manejados en tiempo real.

Se podrán lanzar drones que formen figuras específicas. Cada dron se podrá desplegar en máquinas diferentes dentro de una misma red local.

El uso de *docker*, *Apache Kafka* y *sockets* ha sido crucial para el desarrollo de esta práctica.

Se requiere, como mínimo, la implementación de los siguientes módulos:

- *AD\_Registry*.
- *AD\_Engine*.
- *AD\_Weather*.
- *AD\_Drone*.

Además de estos cuatro módulos, en la presente práctica se ha desarrollado dos servicios más:

- *AD\_Database* para desplegar y manejar adecuadamente la base de datos.
- *AD\_Frontend* para visualizar de una manera más amigable el movimiento de los drones.

En el proyecto adjuntado con la memoria, además de estos módulos se ha adjuntado una carpeta *docs/* para almacenar toda información relevante del proyecto. También otras *enunciado/* y *pruebas/*.  

La práctica ha sido desarrollada con el control de versión Git y GitHub. En el proyecto se podrá consultar el historial de *commits*.

Querría aclarar que, como *TypeScript* se transpila a *JavaScript*, a lo largo de esta memoria se puede utilizar indistintamente las palabras *TypeScript* como *JavaScript* para referirnos al mismo código. Incluso también *Node*.

A la hora de levantar cada *docker-compose* se ha utilizado el parámetro *--build* para forzar a que se reconstruya la imagen, por si hubiera cambios en el código.


## Tecnologías.

Durante el desarrollo de esta práctica se han utilizado diferentes tecnologías para conseguir el mejor desempeño posible.

### Despliegue de aplicación.

Para facilitar el despliegue de los diferentes servicios en varias máquinas para tener un sistema realmente distribuido se ha hecho uso de *docker*. Se ha utilizado tanto imágenes y contenedores creados por separados como *docker-compose* para automatizar estos procesos. Se han expuesto los puertos y se han montado diferentes volúmenes para conseguir una persistencia adecuada en todas las aplicaciones.

La práctica tendrá el siguiente esquema de puertos:

| Servicio      | Puerto | Observación                   |
|---------------|--------|-------------------------------|
| AD\_Engine    | 8888   | Servidor *HTTP*               |
| AD\_Engine    | 8080   | Servidor de *Sockets*         |
| AD\_Drone     | Sin puerto | Actúa como cliente.       |
| AD\_Database  | Sin puerto | Se usa una BBDD *sqlite*. Funciona con archivos, no puertos. |
| AD\_Registry  | 6000   | Servidor de *Sockets*         |
| AD\_Weather   | 5000   | Servidor de *Sockets*         |
| AD\_Frontend  | 3000   | Servidor de *HTTP*            |
| Zookeeper     | 2181   | -                             |
| Kafka         | 29092  | -                             |

Los mensajes enviados entre servicios, tendrán el siguiente formato:

### Lenguajes de programación.

A lo largo de esta práctica de ha utilizado *TypeScript*, *Python* y *JavaScript*. Además de algunos scripts en *Bash*.

Más del 45\% está escrito en TypeScript. Únicamente se ha utilizado este lenguaje para el desarrollo de *AD\_Engine*. Para elegir qué tecnología utilizar para este servicio, lo primero que me planteé fue buscar una que tuviera una gran facilidad en la gestión de hilos concurrentes. El entorno de ejecución de *Node* permite esto sin ningún tipo de dudas. Una vez decidido que quería ejecutar el servidor en código de *JavaScript* tendría que decidir entre hacerlo con código nativo de *JavaScript* o si quería transpilar mi código de *TypeScript* a  *JavaScript*. Como quería tener una aplicación bien modularizada y escalable, elegí hacerlo con *TypeScript*.

El 33\% del código de está escrito en *Python*. Elegí este lenguaje por la cantidad de documentación que tiene a lo largo de todo Internet. También, sin duda, por la facilidad de escritura y ejecución del mismo.

Para hacer el servicio *AD\_Frontend* se ha utilizado el *framework* *React.js*. Además de *HTML* y *CSS*.

El resto del código del proyecto es *JavaScript* o *Shell*. Se han utilizado para tareas menores, de pruebas o de automatización de ejecución de procesos.

Para *Node* se ha utilizado la imagen: **node:18-alpine**. Para *python* se ha utilizado la imagen: **3.9-alpine**.

\newpage

### Persistencia.

En cuanto a la persistencia, se ha utilizado una base de datos *sqlite* para conectar los drones registrados entre *AD\_Registry* y *AD\_Engine*.

Dentro de los cuatro servicios también se han utilizado archivos para mantener una lógica de persistencia entre estos.

En *AD\_Drone* se ha utilizado un archivo csv para almacenar los @id, @alias y @token de los drones registrados en *AD\_Registry*.

En *AD\_Weather* se ha guardado un archivo csv para que el servidor pueda leer la temperatura de las ciudades.

En *AD\_Engine* se ha creado una tabla para almacenar la información relacionada con la figura actual presentada, junto a los drones que están actualmente creándola.

La base de datos se compone de dos tablas. Donde una de ellas tiene una clave ajena apuntando a la otra. La estructura de las tablas es la siguiente:

| Nombre                   | Tipo     | Constraints                | Descripción                      |
|--------------------------|----------|----------------------------|----------------------------------|
| pk\_registry\_id         | INTEGER  | Primary key                | Identificador único de la tabla. |
| alias                    | TEXT     | Not null                   | Nombre del usuario.              |
| token                    | TEXT     | Not null                   | Token de autenticación.          |

| Nombre                   | Tipo     | Constraints                | Descripción                      |
|--------------------------|----------|----------------------------|----------------------------------|
| pk\_fk\_map\_registry\_id | INTEGER | Foreign key references Registry | Identificador único de la tabla. |
| uk\_map\_figura           | INTEGER  | Unique                     | ID en la figura del mapa.        |
| row                      | INTEGER  | Not null                   | Fila objetivo del dron.          |
| column                   | INTEGER  | Not null                   | Columna objetivo del dron.       |

Todos los archivos utilizados, tienen disponibles con variables de entorno sus rutas dentro de volúmenes montados en *docker* o como rutas como archivos locales físicos, la manera habitual.

\newpage

### Automatización.

El uso *docker-compose* ha supuesto una mejora enorme en la automatización. Sin embargo, no se entendería utilizar *docker-compose* sin variables de entorno. Las variables de entorno son ficheros *text.env*. De estos ficheros hay que extraer su contenido usando las librerías correspondientes de cada lenguaje de programación. En python *dotenv-python* o en Node *dotenv*.

Un ejemplo de la obtención de estos datos es la siguiente:
En un archivo *.env*:

```bash
# SECURITY
ENCODING=utf-8
MAX_CONTENT_LENGTH=1024

# KAFKA
KAFKA_HOST=192.168.0.235
KAFKA_PORT=29092
```

En un archivo *python*:
```python
import dotenv
import os
		
dotenv.load_dotenv()

def getBrokerHost() -> str:
return os.getenv('KAFKA_HOST')

def getBrokerPort() -> str:
return os.getenv('KAFKA_PORT')
```

Además, para levantar varios drones se han creado archivos Bash para porder crear muchos drones concurrentemente.

A continuación se muestra un script.

```bash
#!/bin/bash


# PARAMETROS:
NUM_INSTANCES=$1
FIRST_ID=$2
LAST_ID=$(($FIRST_ID + $NUM_INSTANCES - 1))


# Construir la imagen de docker
docker-compose build ad_drone

echo "Ejecutando $NUM_INSTANCES instancias de engine desde ID=$FIRST_ID hasta ID-$LAST_ID..."

# Bucle para crear y ejecutar las instancias en paralelo
for i in $(seq $FIRST_ID $LAST_ID); do
echo "id: $i"
CONTAINER_NAME="ad_drone__registry_id_$i"
docker-compose run --name $CONTAINER_NAME --rm ad_drone python app/src/runnerRegistry.py create $i drone-$i  &

if [ $? -ne 0 ]; then
echo "Error en la ejecucion de la instancia $i. Parando el script..."
exit 1
fi
done

echo "Esperando a que terminen las instancias..."

exit 0  
```

Se ejecuta tal que:
```bash
./run-engine-instances.sh <NUM_INSTANCES> <FIRST_DRONE_ID>
```

Con la siguiente instrucción se ejecutarán 20 instancias. Desde el dron con id 400 al 419:
```
./run-engine-instances.sh 20 400
```

Este script solo es válido en ordenadores Unix, pero no Windows.

### Control de versiones.
Para mantener, desarrollar y publicar el código fuente de este proyecto, se ha utilizado el sistema de control de versiones \textit{Git} junto con \textit{Github}. El repositorio está publicado, aunque de manera privada, en el siguiente [repositorio](https://github.com/jcerveto/art\_with\_drones).
