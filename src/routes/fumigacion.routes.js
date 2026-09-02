const express = require("express");
const { verificarToken, requiereRol } = require("../middleware/auth.middleware");
const { registrarFumigacion } = require("../services/fumigacion.service");
const Fumigacion = require("../models/Fumigacion");
const Producto = require("../models/Producto");
const router = express.Router();

router.post("/", verificarToken, requiereRol("ADMIN", "OPERARIO"), async (req, res) => {
  try {
    const { productoId, litrosAplicados, categoria } = req.body;
    if (!productoId || !litrosAplicados || !categoria) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }
    const registro = await registrarFumigacion({
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

router.get("/", verificarToken, async (req, res) => {
  try {
    const fumigaciones = await Fumigacion.find().populate("productoId", "nombre").sort({ fecha: 1 });
    res.json(fumigaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/inventario", verificarToken, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
