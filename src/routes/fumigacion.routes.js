const express = require("express");
const { verificarToken, requiereRol } = require("../middleware/auth.middleware");
const { registrarFumigacion } = require("../services/fumigacion.service");
const { fumigaciones, productos } = require("../models/db");

const router = express.Router();

router.post("/", verificarToken, requiereRol("ADMIN", "OPERARIO"), (req, res) => {
  try {
    const { productoId, litrosAplicados, categoria } = req.body;
    const registro = registrarFumigacion({
      productoId,
      litrosAplicados,
      categoria,
      responsable: req.usuario.username
    });
    res.status(201).json(registro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", verificarToken, (req, res) => res.json(fumigaciones));
router.get("/inventario", verificarToken, (req, res) => res.json(productos));

module.exports = router;
