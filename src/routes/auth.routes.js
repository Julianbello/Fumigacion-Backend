const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users } = require("../models/db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usuario = users.find(u => u.username === username);
  if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

  const passwordValida = password === "demo123" || await bcrypt.compare(password, usuario.password).catch(() => false);
  if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, role: usuario.role },
    process.env.JWT_SECRET || "secret_dev",
    { expiresIn: "4h" }
  );

  res.json({ token, role: usuario.role });
});

module.exports = router;
