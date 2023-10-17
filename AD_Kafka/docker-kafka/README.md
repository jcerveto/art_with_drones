```
docker-compose up

```

# Consumidor
```
python consumer_kafka.py <topic> <groupId>
```

# Produtor
```
python producer_kafka.py <topic>
```

Usa el mismo topic en el productor y consumidor para que se puedan comunicar.
Usar groupIds diferentes para que se puedan crear varios consumidores al mismo topic. 
