jest.mock("../src/models/Producto", () => ({
  distinct: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../src/models/TipoProducto", () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

const Producto = require("../src/models/Producto");
const TipoProducto = require("../src/models/TipoProducto");
const { listarTipos, crearTipo, crearProducto } = require("../src/services/producto.service");

const datosValidos = {
  nombre: "Fungicida Z",
  categoria: "polvoso",
  dosisMlPorLitro: 4,
  stockLitros: 10,
};

beforeEach(() => {
  jest.clearAllMocks();
  TipoProducto.find.mockResolvedValue([{ nombre: "polvoso" }]);
  Producto.distinct.mockResolvedValue(["trips"]);
  Producto.findOne.mockResolvedValue(null);
  Producto.create.mockImplementation(async (d) => ({ _id: "p1", ...d }));
  TipoProducto.create.mockResolvedValue({});
});

describe("listarTipos", () => {
  test("une los tipos guardados con las categorías de productos existentes, sin repetir", async () => {
    TipoProducto.find.mockResolvedValue([{ nombre: "polvoso" }, { nombre: "trips" }]);
    Producto.distinct.mockResolvedValue(["Trips", " velloso "]);

    await expect(listarTipos()).resolves.toEqual(["polvoso", "trips", "velloso"]);
  });
});

describe("crearTipo", () => {
  test("guarda el tipo normalizado (minúsculas y sin espacios)", async () => {
    const tipo = await crearTipo("  Cochinilla ");
    expect(tipo).toEqual({ nombre: "cochinilla" });
    expect(TipoProducto.create).toHaveBeenCalledWith({ nombre: "cochinilla" });
  });

  test.each([["a"], [""], [123], [null], ["x".repeat(41)]])("rechaza el nombre inválido %p", async (nombre) => {
    await expect(crearTipo(nombre)).rejects.toMatchObject({ status: 400 });
    expect(TipoProducto.create).not.toHaveBeenCalled();
  });

  test("rechaza un tipo que ya existe aunque cambien mayúsculas", async () => {
    await expect(crearTipo("POLVOSO")).rejects.toMatchObject({ status: 409 });
  });

  test("rechaza un tipo que ya viene de un producto existente", async () => {
    await expect(crearTipo("Trips")).rejects.toMatchObject({ status: 409 });
  });
});

describe("crearProducto", () => {
  test("crea el producto con los datos normalizados", async () => {
    const producto = await crearProducto({ ...datosValidos, nombre: "  Fungicida Z ", categoria: "Polvoso", dosisMlPorLitro: "4", stockLitros: "10" });

    expect(Producto.create).toHaveBeenCalledWith({
      nombre: "Fungicida Z",
      categoria: "polvoso",
      dosisMlPorLitro: 4,
      stockLitros: 10,
    });
    expect(producto.nombre).toBe("Fungicida Z");
  });

  test("permite stock inicial 0", async () => {
    await expect(crearProducto({ ...datosValidos, stockLitros: 0 })).resolves.toBeDefined();
  });

  test.each([
    ["nombre muy corto", { nombre: "a" }],
    ["nombre que no es texto", { nombre: 5 }],
    ["sin tipo", { categoria: "" }],
    ["dosis cero", { dosisMlPorLitro: 0 }],
    ["dosis negativa", { dosisMlPorLitro: -2 }],
    ["dosis que no es número", { dosisMlPorLitro: "abc" }],
    ["dosis demasiado alta", { dosisMlPorLitro: 5000 }],
    ["stock negativo", { stockLitros: -1 }],
    ["stock que no es número", { stockLitros: "mucho" }],
  ])("rechaza datos inválidos: %s", async (_caso, cambio) => {
    await expect(crearProducto({ ...datosValidos, ...cambio })).rejects.toMatchObject({ status: 400 });
    expect(Producto.create).not.toHaveBeenCalled();
  });

  test("rechaza un tipo que no existe", async () => {
    await expect(crearProducto({ ...datosValidos, categoria: "inventado" })).rejects.toThrow(/no existe/);
    expect(Producto.create).not.toHaveBeenCalled();
  });

  test("acepta un tipo que solo existe en productos anteriores", async () => {
    await expect(crearProducto({ ...datosValidos, categoria: "trips" })).resolves.toBeDefined();
  });

  test("rechaza un nombre de producto repetido", async () => {
    Producto.findOne.mockResolvedValue({ nombre: "Fungicida Z" });
    await expect(crearProducto(datosValidos)).rejects.toMatchObject({ status: 409 });
    expect(Producto.create).not.toHaveBeenCalled();
  });
});