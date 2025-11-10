import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
  }),
);
app.use(express.json());

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Nombre, correo y contraseña son obligatorios.",
    });
  }

  try {
    const insertQuery = `
      INSERT INTO users (full_name, email, password_hash)
      VALUES ($1, $2, crypt($3, gen_salt('bf')))
      RETURNING id, full_name, email, created_at;
    `;

    const { rows } = await pool.query(insertQuery, [name, email, password]);

    res.status(201).json({
      ok: true,
      user: rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        message: "El correo ya se encuentra registrado.",
      });
    }

    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      ok: false,
      message: "Ocurrió un error inesperado. Inténtalo más tarde.",
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

