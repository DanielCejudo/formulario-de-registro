import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    console.log("Conexión exitosa a PostgreSQL.");
    client.release();
  })
  .catch((error) => {
    console.error("No se pudo conectar:", error);
  })
  .finally(() => {
    pool.end();
  });

