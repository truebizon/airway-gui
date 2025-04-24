import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Cookie解析関数
const getCookietoName = async (name, cookie) => {
  try {
    let matchCookievalue = "";
    let cookieName = name + "=";
    let cookies = cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        matchCookievalue = cookie.substring(cookieName.length, cookie.length);  
        break;
      }
    }
    return matchCookievalue;
  } catch (error) {
    console.error(`getCookietoName error: ${error}`);
    throw new Error(error);
  }
}

export default defineEventHandler(async (event) => {
  // API GW アクセストークン取り出し
  const authHeaderValue = await getRequestHeader(event, 'Cookie');
  const auth_token = await getCookietoName('auth.token', authHeaderValue);
  const decode = jwtDecode(auth_token);
  console.log(decode.accessToken);

  // 外部連携へアクセストークン等を保存
  let response = {};
  const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
  const regTokenEndPoint = `${miscApiBaseUrl}/dipsToken`;
  const params = await readBody(event);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${decode.accessToken}`
  };
  console.log('params: ' + params);
  console.log('headers: ' + headers);

  console.log("Register Token start.");
  try {
    response = await axios.put(regTokenEndPoint, params, { headers: headers });
    if (response.status === 200) {
      console.log("Register Token Success.");
    } else {
      console.log("Register Token Failed.");
    }
    return {
      status: response.status
    }
  } catch (error) {
    console.error('Failed to register token.');
    let statusCode = 500;
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      statusCode = error.response.status;
    } else if (error.request) {
      console.log("Axios no response.");
      console.log(error.request);
    } else {
      console.log("Axios error");
      console.log(error.message);
    }
    return {
      status: statusCode
    }
  } finally {
    console.log("Register Token end.");
  }
});