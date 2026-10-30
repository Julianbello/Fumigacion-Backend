jest.mock("../src/config/db", () => ({
  conectarDB: jest.fn().mockResolvedValue(undefined),
}));

describe("api/index.js (entrada de Vercel)", () => {
  test("exporta la misma aplicación de Express que src/server.js", () => {
    const entrada = require("../api/index");
    const servidor = require("../src/server");
    expect(entrada).toBe(servidor);
  });
});