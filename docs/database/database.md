# Base de datos.

## Introducción.
Base de datos para la persistencia de datos de la aplicación "art_with)drones".

## Estrucutra de la base de datos.

### Tabla: Registry

| nombre | tipo | constraints | descripción |
| - | - | - | - |
| pk_registry_id | INTEGER | primary key | Identificador único de la tabla. |
| alias | TEXT | not null | Nombre del usuario. |
| token | TEXT | not null | Token de autenticación. |


### Tabla: MapFiguraDron

| nombre | tipo | constraints | descripción |
| - | - | - | - |
| pk_fk_map_registry_id | INTEGER | foreign key references Registry(pk_registry_id) | Identificador único de la tabla. |
| uk_map_figura | INTEGER | unique | id en la figura del mapa. |
| row | INTEGER | not null | - |
| column | INTEGER | not null | - |
