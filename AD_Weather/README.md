# Instrucciones de ejecución

## Requisitos
* docker

# Construcción de la imagen
```bash
docker build -t <nombre_imagen> .
```

# Ejecución de la imagen
```bash
docker run -p hostPort:containerPort <nombre_imagen>
```

# Ejecución de la imagen en modo interactivo
```bash
docker run -it -p hostPort:containerPort <nombre_imagen>
```

# docker-compose
```bash
docker-compose up
```
```bash
docker-compose down
```

