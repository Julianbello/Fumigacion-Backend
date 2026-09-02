const express = require("express");
const { verificarToken, requiereRol } = require("../middleware/auth.middleware");
const { registrarFumigacion } = require("../services/fumigacion.service");
const { getPool } = require("../config/db");

const router = express.Router();

router.post("/", verificarToken, requiereRol("ADMIN", "OPERARIO"), async (req, res) => {
  try {
    const { productoId, litrosAplicados, categoria } = req.body;
    if (!productoId || !litrosAplicados || !categoria) {
      return res.status(400).json({ error: "productoId, litrosAplicados y categoria son requeridos" });
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
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT f.Id AS id, f.ProductoId AS productoId, p.Nombre AS productoNombre,
             f.Categoria AS categoria, f.LitrosAplicados AS litrosAplicados,
             f.Responsable AS responsable, f.Fecha AS fecha, f.StockRestante AS stockRestante
      FROM Fumigaciones f
      JOIN Productos p ON p.Id = f.ProductoId
      ORDER BY f.Fecha ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/inventario", verificarToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id AS id, Nombre AS nombre, Categoria AS categoria,
             DosisMlPorLitro AS dosisMlPorLitro, StockLitros AS stockLitros
      FROM Productos
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
