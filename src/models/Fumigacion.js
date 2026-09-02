const mongoose = require("mongoose");
const fumigacionSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
  categoria: { type: String, required: true },
  litrosAplicados: { type: Number, required: true },
  responsable: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  stockRestante: { type: Number, required: true }
});
module.exports = mongoose.model("Fumigacion", fumigacionSchema);
