const Producto = require("../models/Producto");
const Fumigacion = require("../models/Fumigacion");

async function registrarFumigacion({ productoId, litrosAplicados, categoria, responsable }) {
  const producto = await Producto.findById(productoId);
  if (!producto) throw new Error("Producto no encontrado");

  if (producto.stockLitros < litrosAplicados) {
    throw new Error("Stock insuficiente para completar la fumigación");
  }

  const nuevoStock = producto.stockLitros - Number(litrosAplicados);
  producto.stockLitros = nuevoStock;
  await producto.save();

  const nuevaFumigacion = await Fumigacion.create({
    productoId,
    categoria,
    litrosAplicados,
    responsable,
    stockRestante: nuevoStock
  });

  return {
    id: nuevaFumigacion._id,
    productoId,
    productoNombre: producto.nombre,
    categoria,
    litrosAplicados: Number(litrosAplicados),
    responsable,
    fecha: nuevaFumigacion.fecha,
    stockRestante: nuevoStock
  };
}

module.exports = { registrarFumigacion };
