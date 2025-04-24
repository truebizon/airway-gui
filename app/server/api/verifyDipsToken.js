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

  // DIPSトークンの検証
  let response = {};
  const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
  const verifyTokenEndPoint = `${miscApiBaseUrl}/dipsTokenVerification`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization':  `Bearer ${decode.accessToken}`
  };

  console.log("VerifyDipsToken start.");
  try {
    response = await axios.post(verifyTokenEndPoint, '{}', { headers: headers });
    console.log(response.data);
    if (response.status === 200) {
      console.log("Verify token success.");
    } else {
      console.log("Verify token failed.");
    }
    return {
      status: response.status
    }
  } catch (error) {
    console.error("Failed to Verify token.");
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
    console.log("VerifyDipsToken end.");
  }
});