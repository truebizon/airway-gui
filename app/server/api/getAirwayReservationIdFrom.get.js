import pg from 'pg';
const { Client } = pg;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!('id' in query)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id not specified!',
    });
  }

  const config = useRuntimeConfig();
  const dbUser = config.dronedbUser;
  const dbPassword = config.dronedbPassword;
  const dbHost = config.dronedbHost;
  const dbPort = Number(config.dronedbPort);
  const dbName = config.dronedbName;
  const dbTableName = config.dronedbTableName;

  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: dbName,
  });

  try {
    await client.connect();
  } catch (err) {
    throw createError({
      statusCode: 503,
      statusMessage: `failed to connect db: ${err.name}: ${err.message}`,
    })
  }

  const targetId = query.id;
  const sqltxt = `SELECT * FROM ${dbTableName} WHERE port_id_from = '${targetId}' OR port_id_to = '${targetId}';`;

  try {
    var res = await client.query(sqltxt);
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `failed to query: ${err.name}: ${err.message}`,
    })
  } finally {
    await client.end();
  }

  const idCount = res.rowCount;
  let rsvId = '';
  let ids = [];
  for (let i = 0; i < idCount; ++i) {
    ids.push(res.rows[i].rsv_id);
  }
  if (idCount > 0) {
    rsvId = res.rows[0].rsv_id;
  }

  return {
    count: idCount,
    ids: ids,
    id: rsvId,
  };
});
