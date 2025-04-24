import pg from 'pg';
const { Client } = pg;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!('airwayReservationId' in body)
      || !('dronePortReservationIdFrom' in body)
      || !('dronePortReservationIdTo' in body)
      || !('aircraftRemoteId' in body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'airwayReservationId or dronePortReservationIdFrom or dronePortReservationIdTo or aircraftRemoteId not specified!',
    });
  }

  if (!('aircraftInfo' in body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'aircraftInfo not specified!',
    });
  }

  if (!('maker' in body.aircraftInfo)
      || !('modelNumber' in body.aircraftInfo)
      || !('name' in body.aircraftInfo)
      || !('type' in body.aircraftInfo)
      || !('length' in body.aircraftInfo)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'maker or modelNumber or name or type or length not specified!',
    });
  }

  const rsvId = body['airwayReservationId'];
  const portIdFrom = body['dronePortReservationIdFrom'];
  const portIdTo = body['dronePortReservationIdTo'];
  const acRemoteId = body['aircraftRemoteId'];
  const acraftInfo = body['aircraftInfo'];
  const aciMaker = acraftInfo.maker;
  const aciModelNumber = acraftInfo.modelNumber;
  const aciName = acraftInfo.name;
  const aciType = acraftInfo.type;
  const aciLength = acraftInfo.length;

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

  const sqltxt_cmd = `INSERT INTO`;
  const sqltxt_keys = `(rsv_id, port_id_from, port_id_to, ac_remote_id, aci_maker, aci_model_num, aci_name, aci_type, aci_len)`;
  const sqltxt_vals = `VALUES ('${rsvId}', '${portIdFrom}', '${portIdTo}', '${acRemoteId}', '${aciMaker}', '${aciModelNumber}', '${aciName}', '${aciType}', ${aciLength})`;
  const sqltxt = `${sqltxt_cmd} ${dbTableName} ${sqltxt_keys} ${sqltxt_vals};`;

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
    aircraftRemoteId: acRemoteId,
    aircraftInfo: acraftInfo,
  };
});
