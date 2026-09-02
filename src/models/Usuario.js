const mongoose = require("mongoose");
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ["ADMIN", "OPERARIO"] }
});
module.exports = mongoose.model("Usuario", usuarioSchema);
