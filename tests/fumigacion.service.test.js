const { registrarFumigacion } = require("../src/services/fumigacion.service");
const { productos } = require("../src/models/db");

describe("HU05 + HU09: registro y descuento de inventario", () => {
  test("descuenta correctamente el stock al registrar una fumigación", () => {
    const stockInicial = productos[0].stockLitros;
    const registro = registrarFumigacion({
      productoId: 1,
      litrosAplicados: 2,
      categoria: "polvoso",
      responsable: "operario"
    });

    expect(registro.stockRestante).toBe(stockInicial - 2);
    expect(productos[0].stockLitros).toBe(stockInicial - 2);
  });

  test("rechaza la fumigación si el stock es insuficiente", () => {
    expect(() =>
      registrarFumigacion({ productoId: 1, litrosAplicados: 9999, categoria: "polvoso", responsable: "operario" })
    ).toThrow("Stock insuficiente");
  });
});
