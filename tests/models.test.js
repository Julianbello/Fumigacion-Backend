const Usuario = require("../src/models/Usuario");
const Producto = require("../src/models/Producto");
const Fumigacion = require("../src/models/Fumigacion");
const TipoProducto = require("../src/models/TipoProducto");

describe("modelos", () => {
  test("Usuario exige username, passwordHash y un rol válido", async () => {
    await expect(new Usuario({}).validate()).rejects.toHaveProperty("errors.username");
    await expect(new Usuario({ username: "a", passwordHash: "x", role: "JEFE" }).validate()).rejects.toHaveProperty(
      "errors.role"
    );
    await expect(new Usuario({ username: "a", passwordHash: "x", role: "OPERARIO" }).validate()).resolves.toBeUndefined();
  });

  test("Producto exige nombre, categoría, dosis y stock", async () => {
    const error = await new Producto({}).validate().catch((e) => e);
    expect(Object.keys(error.errors)).toEqual(
      expect.arrayContaining(["nombre", "categoria", "dosisMlPorLitro", "stockLitros"])
    );
  });

  test("Fumigacion exige producto, litros, responsable y stock restante", async () => {
    const error = await new Fumigacion({}).validate().catch((e) => e);
    expect(Object.keys(error.errors)).toEqual(
      expect.arrayContaining(["productoId", "litrosAplicados", "responsable", "stockRestante"])
    );
  });

  test("TipoProducto guarda el nombre en minúsculas y sin espacios", async () => {
    expect(new TipoProducto({ nombre: "  Cochinilla " }).nombre).toBe("cochinilla");
    await expect(new TipoProducto({}).validate()).rejects.toHaveProperty("errors.nombre");
  });
});