jest.mock("../src/config/db", () => ({
  conectarDB: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");

describe("servidor", () => {
  afterEach(() => {
    delete mongoose.connection.readyState;
  });

  test("/health responde 503 cuando MongoDB no está conectado", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error", db: "MongoDB sin conexion" });
  });

  test("/health responde 200 cuando MongoDB está conectado", async () => {
    Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "MongoDB conectado" });
  });

  test("las rutas protegidas exigen token", async () => {
    const res = await request(app).get("/api/productos/tipos");
    expect(res.status).toBe(401);
  });

  test("una ruta inexistente responde 404", async () => {
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
  });
});