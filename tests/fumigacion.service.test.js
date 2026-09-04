jest.mock("../src/models/Producto", () => ({
  findById: jest.fn(),
}));

jest.mock("../src/models/Fumigacion", () => ({
  create: jest.fn(),
}));

const Producto = require("../src/models/Producto");
const Fumigacion = require("../src/models/Fumigacion");

const {
  registrarFumigacion,
} = require("../src/services/fumigacion.service");

describe("HU05 + HU09: registrarFumigacion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("descuenta el stock y registra la fumigación", async () => {
    const producto = {
      _id: "producto-1",
      nombre: "Fungicida X",
      stockLitros: 20,
      save: jest.fn().mockResolvedValue(true),
    };

    const fumigacion = {
      _id: "fumigacion-99",
      fecha: new Date(),
    };

    Producto.findById.mockResolvedValue(producto);
    Fumigacion.create.mockResolvedValue(fumigacion);

    const registro = await registrarFumigacion({
      productoId: "producto-1",
      litrosAplicados: 2,
      categoria: "polvoso",
      responsable: "operario",
    });

    expect(Producto.findById).toHaveBeenCalledWith("producto-1");

    expect(producto.stockLitros).toBe(18);
    expect(producto.save).toHaveBeenCalledTimes(1);

    expect(Fumigacion.create).toHaveBeenCalledWith({
      productoId: "producto-1",
      categoria: "polvoso",
      litrosAplicados: 2,
      responsable: "operario",
      stockRestante: 18,
    });

    expect(registro.stockRestante).toBe(18);
    expect(registro.productoNombre).toBe("Fungicida X");
    expect(registro.categoria).toBe("polvoso");
    expect(registro.litrosAplicados).toBe(2);
    expect(registro.responsable).toBe("operario");
    expect(registro.id).toBe("fumigacion-99");
  });

  test("rechaza la fumigación si el stock es insuficiente", async () => {
    const producto = {
      _id: "producto-1",
      nombre: "Fungicida X",
      stockLitros: 1,
      save: jest.fn(),
    };

    Producto.findById.mockResolvedValue(producto);

    await expect(
      registrarFumigacion({
        productoId: "producto-1",
        litrosAplicados: 99,
        categoria: "polvoso",
        responsable: "operario",
      })
    ).rejects.toThrow("Stock insuficiente");

    expect(producto.save).not.toHaveBeenCalled();
    expect(Fumigacion.create).not.toHaveBeenCalled();
  });
});
