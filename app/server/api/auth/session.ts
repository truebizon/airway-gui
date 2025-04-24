import {H3Event, eventHandler, createError} from 'h3';
import jwt from 'jsonwebtoken';
import {SECRET_KEY, jwt_decode_token} from './login';

const extractToken = async (authHeaderValue: string) => {
  try {
    const token = authHeaderValue.split(` `)[1];
    return token;
  } catch (error) {
    console.error(`session extractToken error:${error}`);
    throw new Error(error);
  }
};

const ensureAuth = async (event: H3Event) => {
  let res = null;
  try {
    const authHeaderValue = await getRequestHeader(event, 'authorization');
    if (typeof authHeaderValue === 'undefined') {
      console.error('Need to pass vaild Bearer-authorization header to access session.');
      throw new Error('Need to pass vaild Bearer-authorization header to access session.');
    }
    const extractedToken = await extractToken(authHeaderValue);
    res = await jwt.verify(extractedToken, SECRET_KEY);
    return res;
  } catch (error) {
    console.error(`session extractedToken error:${error}`);
    throw new Error(error);
  }
};

export default eventHandler(async (event) => {
  try {
    const data = await ensureAuth(event);
    return data;
  } catch (error) {
    console.error(`Login Session failed(${error}). `);
    throw createError({
      statusCode: 403,
      statusMessage: `Login Session failed(${error}). `
    }); 
  }
});