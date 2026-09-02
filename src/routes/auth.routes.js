const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, getPool } = require("../config/db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT Id, Username, PasswordHash, Role FROM Usuarios WHERE Username = @username");

    const usuario = result.recordset[0];
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

    const passwordValida = await bcrypt.compare(password, usuario.PasswordHash);
    if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: usuario.Id, username: usuario.Username, role: usuario.Role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token, role: usuario.Role });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
});

module.exports = router;
