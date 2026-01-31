import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "meditrack",
    password: "meditrack_dev_password",
    database: "meditrack",
    ssl: false,
  },
});
