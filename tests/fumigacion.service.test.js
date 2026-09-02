jest.mock("mssql", () => {
  const mRequest = { input: jest.fn().mockReturnThis(), query: jest.fn() };
  const mTransaction = { begin: jest.fn(), commit: jest.fn(), rollback: jest.fn() };
  return {
    ConnectionPool: jest.fn().mockImplementation(() => ({ connect: jest.fn().mockResolvedValue({}) })),
    Transaction: jest.fn().mockImplementation(() => mTransaction),
    Request: jest.fn().mockImplementation(() => mRequest),
    NVarChar: "NVarChar",
    Int: "Int",
    Decimal: jest.fn()
  };
});

jest.mock("../src/config/db", () => ({
  sql: require("mssql"),
  getPool: jest.fn().mockResolvedValue({})
}));

const sql = require("mssql");
const { registrarFumigacion } = require("../src/services/fumigacion.service");

describe("HU05 + HU09: registrarFumigacion con Azure SQL (mockeado)", () => {
  test("descuenta el stock y registra la fumigación en una transacción", async () => {
    const requestInstance = new sql.Request();
    requestInstance.query
      .mockResolvedValueOnce({ recordset: [{ Id: 1, Nombre: "Fungicida X", StockLitros: 20 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ recordset: [{ Id: 99, Fecha: new Date() }] });

    sql.Request.mockImplementation(() => requestInstance);

    const registro = await registrarFumigacion({
      productoId: 1, litrosAplicados: 2, categoria: "polvoso", responsable: "operario"
    });

    expect(registro.stockRestante).toBe(18);
    expect(registro.productoNombre).toBe("Fungicida X");
  });

  test("hace rollback si el stock es insuficiente", async () => {
    const requestInstance = new sql.Request();
    requestInstance.query
      .mockResolvedValueOnce({ recordset: [{ Id: 1, Nombre: "Fungicida X", StockLitros: 1 }] });

    sql.Request.mockImplementation(() => requestInstance);

    await expect(
      registrarFumigacion({ productoId: 1, litrosAplicados: 99, categoria: "polvoso", responsable: "operario" })
    ).rejects.toThrow("Stock insuficiente");
  });
});
