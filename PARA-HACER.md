# Leer las figuras desde el json (crear clase FigureEntity). 
## Cada clase tiene que guardar la posicion (SquareEntity) y el id del dron (DroneRntity o simplemente un int).
## Crear atributo List<FigureEntity> en ServerEntity donde se guarden TODAS las figuras del fichero.


# crear productor target_position y después ponerlo en AD_Engine. 
# crear consumidor target_position. Luego crear su THREAD en el dron. 

# Iniciar current_position, target_position y keep_alive desde el ServerImplementation.start. Que no se cree un topic por dron-

# Que no se publiquen mapas vacios


# Que ad_drone hable con ad_registry.
# Registry funcional con sqlite.
# Que Weather sea multihilo

# Documentación de los tipos de mensajes que se envían. 
