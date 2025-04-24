import pg from 'pg';
const { Client } = pg;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!('airwayReservationId' in body)
      || !('dronePortReservationIdFrom' in body)
      || !('dronePortReservationIdTo' in body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'airwayReservationId or dronePortReservationIdFrom or dronePortReservationIdTo not specified!',
    });
  }

  const rsvId = body['airwayReservationId'];
  const portIdFrom = body['dronePortReservationIdFrom'];
  const portIdTo = body['dronePortReservationIdTo'];

  if ((rsvId === '') || (portIdFrom === '') || (portIdTo === '')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'non-empty values need to be specified!',
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

  const sqltxt = `DELETE FROM ${dbTableName} WHERE rsv_id = '${rsvId}' AND port_id_from = '${portIdFrom}' AND port_id_to = '${portIdTo}';`;

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

  return {
    airwayReservationId: rsvId,
    dronePortReservationIdFrom: portIdFrom,
    dronePortReservationIdTo: portIdTo,
  };
});
