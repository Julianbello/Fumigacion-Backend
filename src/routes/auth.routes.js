const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const router = express.Router();

const USERNAME_VALIDO = /^[a-zA-Z0-9._-]{3,30}$/;

// Exige usuario y contraseña como texto no vacío (evita también inyección con objetos).
function exigirCredenciales(req, res, next) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }
  req.credenciales = { username, password };
  next();
}

router.post("/login", exigirCredenciales, async (req, res) => {
  const { username, password } = req.credenciales;
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

// Registro público: siempre crea usuarios con rol OPERARIO (el rol nunca viene del cliente).
router.post("/register", exigirCredenciales, async (req, res) => {
  const { username, password } = req.credenciales;
  if (!USERNAME_VALIDO.test(username)) {
    return res.status(400).json({
      error: "El usuario debe tener entre 3 y 30 caracteres (letras, números, punto, guion o guion bajo)"
    });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "La contraseña debe tener entre 8 y 72 caracteres" });
  }
  try {
    const existe = await Usuario.findOne({ username });
    if (existe) return res.status(409).json({ error: "El usuario ya existe" });

    const passwordHash = await bcrypt.hash(password, 10);
    await Usuario.create({ username, passwordHash, role: "OPERARIO" });
    res.status(201).json({ mensaje: "Usuario creado correctamente" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "El usuario ya existe" });
    res.status(500).json({ error: "Error de servidor" });
  }
});

module.exports = router;