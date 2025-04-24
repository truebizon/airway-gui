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
  const sqltxt = `SELECT * FROM ${dbTableName} WHERE rsv_id = '${targetId}';`;

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
  let portIdFrom = '';
  let portIdTo = '';
  let ids = [];
  for (let i = 0; i < idCount; ++i) {
    ids.push([res.rows[i].port_id_from, res.rows[i].port_id_to]);
  }
  if (idCount > 0) {
    portIdFrom = res.rows[0].port_id_from;
    portIdTo = res.rows[0].port_id_to;
  }

  return {
    count: idCount,
    ids: ids,
    idFrom: portIdFrom,
    idTo: portIdTo,
  };
});
