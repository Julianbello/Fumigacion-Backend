const { sql, getPool } = require("../config/db");

async function registrarFumigacion({ productoId, litrosAplicados, categoria, responsable }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const productoResult = await new sql.Request(transaction)
      .input("productoId", sql.Int, productoId)
      .query("SELECT Id, Nombre, StockLitros FROM Productos WHERE Id = @productoId");

    const producto = productoResult.recordset[0];
    if (!producto) throw new Error("Producto no encontrado");
    if (producto.StockLitros < litrosAplicados) {
      throw new Error("Stock insuficiente para completar la fumigación");
    }

    const nuevoStock = Number(producto.StockLitros) - Number(litrosAplicados);

    await new sql.Request(transaction)
      .input("productoId", sql.Int, productoId)
      .input("nuevoStock", sql.Decimal(10, 2), nuevoStock)
      .query("UPDATE Productos SET StockLitros = @nuevoStock WHERE Id = @productoId");

    const insertResult = await new sql.Request(transaction)
      .input("productoId", sql.Int, productoId)
      .input("categoria", sql.NVarChar, categoria)
      .input("litrosAplicados", sql.Decimal(10, 2), litrosAplicados)
      .input("responsable", sql.NVarChar, responsable)
      .input("stockRestante", sql.Decimal(10, 2), nuevoStock)
      .query(`
        INSERT INTO Fumigaciones (ProductoId, Categoria, LitrosAplicados, Responsable, Fecha, StockRestante)
        OUTPUT INSERTED.Id, INSERTED.Fecha
        VALUES (@productoId, @categoria, @litrosAplicados, @responsable, SYSUTCDATETIME(), @stockRestante)
      `);

    await transaction.commit();

    const inserted = insertResult.recordset[0];
    return {
      id: inserted.Id,
      productoId,
      productoNombre: producto.Nombre,
      categoria,
      litrosAplicados: Number(litrosAplicados),
      responsable,
      fecha: inserted.Fecha,
      stockRestante: nuevoStock
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = { registrarFumigacion };
