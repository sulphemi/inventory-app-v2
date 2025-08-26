import { Pool } from "pg";

const env = process.env;
const pool = new Pool({
    connectionString: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_IP}:${env.DB_PORT}/keyboard_inventory`
});

export default pool;
