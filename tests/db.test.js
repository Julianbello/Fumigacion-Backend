jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("conectarDB", () => {
  let mongoose;
  let conectarDB;

  beforeEach(() => {
    jest.resetModules();
    delete global.mongoose;
    mongoose = require("mongoose");
    mongoose.connect.mockReset();
    ({ conectarDB } = require("../src/config/db"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.MONGO_URI;
    jest.restoreAllMocks();
  });

  test("falla con un mensaje claro si falta MONGO_URI", async () => {
    delete process.env.MONGO_URI;
    await expect(conectarDB()).rejects.toThrow("Falta la variable de entorno MONGO_URI");
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  test("se conecta una sola vez y reutiliza la conexión", async () => {
    process.env.MONGO_URI = "mongodb://localhost/prueba";
    mongoose.connect.mockResolvedValue({ nombre: "conexion" });

    const primera = await conectarDB();
    const segunda = await conectarDB();

    expect(primera).toBe(segunda);
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost/prueba", expect.any(Object));
  });

  test("si la conexión falla, lanza el error y permite reintentar", async () => {
    process.env.MONGO_URI = "mongodb://localhost/prueba";
    mongoose.connect.mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce({ ok: true });

    await expect(conectarDB()).rejects.toThrow("sin red");
    await expect(conectarDB()).resolves.toEqual({ ok: true });
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});