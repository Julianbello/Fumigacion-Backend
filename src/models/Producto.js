const mongoose = require("mongoose");
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  dosisMlPorLitro: { type: Number, required: true },
  stockLitros: { type: Number, required: true }
});
module.exports = mongoose.model("Producto", productoSchema);
