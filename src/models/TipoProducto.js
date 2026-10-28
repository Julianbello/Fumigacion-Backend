const mongoose = require("mongoose");

const tipoProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true, lowercase: true }
});

module.exports = mongoose.model("TipoProducto", tipoProductoSchema);