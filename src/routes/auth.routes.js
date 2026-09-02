const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }
  try {
    const usuario = await Usuario.findOne({ username });
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: usuario._id, username: usuario.username, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.json({ token, role: usuario.role });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
});

module.exports = router;
