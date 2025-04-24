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
  let aircraftRemoteId = '';
  let aircraftInfo = null;

  if (idCount > 0) {
    const row = res.rows[0];

    if (('aci_maker' in row)
        && ('aci_model_num' in row)
        && ('aci_name' in row)
        && ('aci_type' in row)
        && ('aci_len' in row)
        && ('ac_remote_id' in row)) {
      aircraftRemoteId = (row.ac_remote_id == null) ? '' : row.ac_remote_id;
      aircraftInfo = {
        maker: row.aci_maker,
        modelNumber: row.aci_model_num,
        name: row.aci_name,
        type: row.aci_type,
        length: row.aci_len,
      };
    }
  }

  return {
    airwayReservationId: targetId,
    aircraftRemoteId: aircraftRemoteId,
    aircraftInfo: aircraftInfo,
  };
});
