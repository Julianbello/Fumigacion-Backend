const { productos, fumigaciones } = require("../models/db");

function registrarFumigacion({ productoId, litrosAplicados, responsable, categoria }) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) throw new Error("Producto no encontrado");

  const cantidadUsada = litrosAplicados;

  if (producto.stockLitros < cantidadUsada) {
    throw new Error("Stock insuficiente para completar la fumigación");
  }

  producto.stockLitros = +(producto.stockLitros - cantidadUsada).toFixed(2);

  const registro = {
    id: fumigaciones.length + 1,
    productoId,
    productoNombre: producto.nombre,
    categoria,
    litrosAplicados: cantidadUsada,
    responsable,
    fecha: new Date().toISOString(),
    stockRestante: producto.stockLitros
  };

  fumigaciones.push(registro);
  return registro;
}

module.exports = { registrarFumigacion };
