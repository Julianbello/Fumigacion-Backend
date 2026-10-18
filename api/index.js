const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

let cached = global.mongoose || { conn: null, promise: null };
async function conectarDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 }).then((m) => m);
  }
  try { cached.conn = await cached.promise; } catch (e) { cached.promise = null; throw e; }
  global.mongoose = cached;
  return cached.conn;
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model("User", UserSchema, "usuarios");

app.use(async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Error DB", details: err.message });
  }
});

app.get(/.*test$/, (req, res) => res.json({ msg: "RUTA REGISTRADA CORRECTAMENTE" }));

// Ruta de Registro
app.post(/.*register$/, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Faltan datos" });
    const existe = await User.findOne({ username });
    if (existe) return res.status(400).json({ error: "El usuario ya existe" });
    const nuevoUsuario = new User({ username, password });
    await nuevoUsuario.save();
    return res.status(201).json({ message: "Usuario creado exitosamente", user: username });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Ruta de Login a�adida
app.post(/.*login$/, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Faltan datos" });
    const usuario = await User.findOne({ username, password });
    if (!usuario) return res.status(401).json({ error: "Credenciales inv�lidas" });
    return res.status(200).json({ message: "Inicio de sesi�n exitoso", user: username });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = app;
