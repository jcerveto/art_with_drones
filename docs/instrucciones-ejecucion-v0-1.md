# art_with_drones


## Levantar Kafka
Desde AD_Kafka/ Ejecutar 
```
docker-compose up
```

o para ejecutar con el debug en localhost:9000 (ver en el navegador)
```
docker-compose -f ¿compose-kafdrop.yaml (nombre del compose)?
```

# Ejecutar Engine
npm run dev 8080

# Conectar un dron a Engine:
en pruebas/
ejecutar
```
node tcp_client_auth_drone.js 0.0.0.0 8080
````

Se ha añadido el dron a engine. Ver la informacion en el propio tcp_client_auth_drone.js. Ver token e id_registry.

Ahora no se imprimira ningun dron por engine. Tienes que activar el keep alive. En un futuro habra que quitar el keep live, pero de momento esta asi.

# Ver dron y mapa. 
En pruebas/drone-kafka Ejecutar
```
python src/keepAliveProductor <idDrone> # Usa 10, es el que esta por defecto en tcp_client_auth_drone.js. 
```
Ya se vera el mapa en cliente y servidor (por el keepAlive productor y el map consumer) 


# Si quieres mover el drone ejecuta.
```
python src/pruba.oy.py
```
Esto mueve cada 20s una posicion en el mapa. Hay un bug, imprime mapas vacios, no le hagas caso a eso. 
