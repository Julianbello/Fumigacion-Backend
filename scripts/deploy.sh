#!/bin/bash
# scripts/deploy.sh <entorno>
# Placeholder de despliegue — reemplazalo por tu comando real
# (az webapp deploy, docker push, etc.) cuando tengas el servidor destino.

ENTORNO=$1
echo "== Desplegando fumigacion-backend en $ENTORNO =="
echo "(Aqui iria el comando real de despliegue para $ENTORNO)"
echo "Recuerda que las variables AZURE_SQL_* de este entorno deben apuntar"
echo "a la base de datos de $ENTORNO, NO a la de otros entornos."
