# Opciones de ejecución.

## AD_Registry
### Se pueden dar de alta, actualizar y eliminar drones de la base de datos.
```bash
python src/runnerRegistry.py <function> <droneId> <alias> <token: optional> 
```
Donde @function puede ser:
- create
- update
- delete

Ejemplo:
Create:
```bash
python src/runnerRegistry.py create 104 drone-alias
```
Esta opción añade una fila al archivo `data/drones.csv` con los datos del drone.

Update:
```bash
python src/runnerRegistry.py update 200 drone-alias 50ed0f93-7
```

Delete:
```bash
python src/runnerRegistry.py delete 104 drone-alias 50ed0f93-7
```


## AD_Engine
Una vez un dron está registrado en AD_Registry, se puede lanzar el drone a AD_Engine para empezar la funcón. 
```bash
python src/runnerEngine.py <droneId> <token: optional> <--show_map o -s: optional> 
```
1. Si se añade el token, se lanza la petición con dicho token.
2. Si no se añade el token, se buscará en el archivo `data/drones.csv` el droneId y se lanzará la petición con el token asociado a dicho droneId.

Ejemplo:
```bash
python src/runnerEngine.py 104
```
```bash
python src/runnerEngine.py 104 --show_map
```
```bash
python src/runnerEngine.py 104 50ed0f93-7
```
```bash
python src/runnerEngine.py 104 50ed0f93-7 --show_map
```
```bash
python src/runnerEngine.py 104 50ed0f93-7 -s
```