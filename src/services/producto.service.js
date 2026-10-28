const Producto = require("../models/Producto");
const TipoProducto = require("../models/TipoProducto");

function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function textoValido(valor, min, max) {
  return typeof valor === "string" && valor.trim().length >= min && valor.trim().length <= max;
}

// Devuelve los tipos guardados más las categorías que ya usan los productos existentes.
async function listarTipos() {
  const [tipos, categorias] = await Promise.all([
    TipoProducto.find(),
    Producto.distinct("categoria")
  ]);
  const todos = new Set([
    ...tipos.map((t) => t.nombre),
    ...categorias.map((c) => String(c).trim().toLowerCase())
  ]);
  return [...todos].sort();
}

async function crearTipo(nombre) {
  if (!textoValido(nombre, 2, 40)) {
    throw errorHttp(400, "El nombre del tipo debe tener entre 2 y 40 caracteres");
  }
  const normalizado = nombre.trim().toLowerCase();
  const existentes = await listarTipos();
  if (existentes.includes(normalizado)) {
    throw errorHttp(409, "Ese tipo de producto ya existe");
  }
  await TipoProducto.create({ nombre: normalizado });
  return { nombre: normalizado };
}

async function crearProducto({ nombre, categoria, dosisMlPorLitro, stockLitros }) {
  if (!textoValido(nombre, 2, 80)) {
    throw errorHttp(400, "El nombre del producto debe tener entre 2 y 80 caracteres");
  }
  if (!textoValido(categoria, 2, 40)) {
    throw errorHttp(400, "Debes elegir un tipo de producto");
  }
  const dosis = Number(dosisMlPorLitro);
  const stock = Number(stockLitros);
  if (!Number.isFinite(dosis) || dosis <= 0 || dosis > 1000) {
    throw errorHttp(400, "La dosis debe ser un número mayor que 0 (máximo 1000 ml/L)");
  }
  if (!Number.isFinite(stock) || stock < 0 || stock > 1000000) {
    throw errorHttp(400, "El stock debe ser un número igual o mayor que 0");
  }

  const tipo = categoria.trim().toLowerCase();
  const tiposDisponibles = await listarTipos();
  if (!tiposDisponibles.includes(tipo)) {
    throw errorHttp(400, "El tipo de producto no existe. Créalo primero");
  }

  const nombreLimpio = nombre.trim();
  const repetido = await Producto.findOne({ nombre: nombreLimpio });
  if (repetido) {
    throw errorHttp(409, "Ya existe un producto con ese nombre");
  }

  return Producto.create({
    nombre: nombreLimpio,
    categoria: tipo,
    dosisMlPorLitro: dosis,
    stockLitros: stock
  });
}

module.exports = { listarTipos, crearTipo, crearProducto };