jest.mock("../src/models/Producto", () => ({
  findById: jest.fn(),
}));

jest.mock("../src/models/Fumigacion", () => ({
  create: jest.fn(),
}));

const Producto = require("../src/models/Producto");
const Fumigacion = require("../src/models/Fumigacion");
const { registrarFumigacion } = require("../src/services/fumigacion.service");

const datos = {
  productoId: "producto-1",
  litrosAplicados: 5,
  categoria: "liquido",
  responsable: "operario",
};

describe("registrarFumigacion: casos adicionales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("lanza error si el producto no existe", async () => {
    Producto.findById.mockResolvedValue(null);

    await expect(registrarFumigacion(datos)).rejects.toThrow("Producto no encontrado");
    expect(Fumigacion.create).not.toHaveBeenCalled();
  });

  test("si el stock es insuficiente no guarda el producto ni crea la fumigación", async () => {
    const producto = { nombre: "Fungicida X", stockLitros: 2, save: jest.fn() };
    Producto.findById.mockResolvedValue(producto);

    await expect(registrarFumigacion(datos)).rejects.toThrow(
      "Stock insuficiente para completar la fumigación"
    );

    expect(producto.stockLitros).toBe(2);
    expect(producto.save).not.toHaveBeenCalled();
    expect(Fumigacion.create).not.toHaveBeenCalled();
  });

  test("permite usar exactamente todo el stock disponible", async () => {
    const producto = {
      nombre: "Fungicida X",
      stockLitros: 5,
      save: jest.fn().mockResolvedValue(true),
    };
    Producto.findById.mockResolvedValue(producto);
    Fumigacion.create.mockResolvedValue({ _id: "f-1", fecha: new Date() });

    const registro = await registrarFumigacion(datos);

    expect(producto.stockLitros).toBe(0);
    expect(registro.stockRestante).toBe(0);
  });

  test("convierte los litros a número en la respuesta", async () => {
    const producto = {
      nombre: "Fungicida X",
      stockLitros: 10,
      save: jest.fn().mockResolvedValue(true),
    };
    Producto.findById.mockResolvedValue(producto);
    Fumigacion.create.mockResolvedValue({ _id: "f-2", fecha: new Date() });

    const registro = await registrarFumigacion({ ...datos, litrosAplicados: "3" });

    expect(registro.litrosAplicados).toBe(3);
    expect(registro.stockRestante).toBe(7);
  });

  test("guarda el producto antes de crear el registro de fumigación", async () => {
    const orden = [];
    const producto = {
      nombre: "Fungicida X",
      stockLitros: 10,
      save: jest.fn().mockImplementation(async () => orden.push("save")),
    };
    Producto.findById.mockResolvedValue(producto);
    Fumigacion.create.mockImplementation(async () => {
      orden.push("create");
      return { _id: "f-3", fecha: new Date() };
    });

    await registrarFumigacion(datos);

    expect(orden).toEqual(["save", "create"]);
  });
});