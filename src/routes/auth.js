const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan usuario o contraseña" });
    }
    const existe = await User.findOne({ username });
    if (existe) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    const nuevoUsuario = new User({ username, password });
    await nuevoUsuario.save();
    return res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    return res.json({ token: "token_demo_123", username: user.username });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
