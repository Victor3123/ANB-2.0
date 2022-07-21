import {Client, ClientConfig} from 'pg';

const config: ClientConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
}
const client = new Client(config);
async function main() {
  await client.connect()
}

main();

export default client;
