import jwt from 'jsonwebtoken';
import axios from 'axios';
import { defineEventHandler, setCookie } from 'h3'
import { jwt_decode_token, SECRET_KEY } from './auth/login'

// wait関数(test用)
const sleep_time_ms = 5000;
const WaitFunction = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(`${sleep_time_ms} [ms] 待機`);
  }, sleep_time_ms);
});

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
  
const refreshaccessToken = async (event) => {
  try {
    const authHeaderValue = await getRequestHeader(event, 'Cookie');
    if (typeof authHeaderValue === 'undefined') {
      console.error('Need to pass vaild Bearer-authorization header to access refresh.');
      throw new Error('Need to pass vaild Bearer-authorization header to access refresh.');
    }
    const current_JwtToken = await getCookietoName('auth.token', authHeaderValue);
    let jwt_payload = {};
    const decode_accessToken = await jwt_decode_token(current_JwtToken);
    const decode_accessToken_json = JSON.parse(decode_accessToken);

    const dummy_check = decode_accessToken_json.operatorId.indexOf('70782784-568c-62df-4ff3-fb3e90051c0');
    if (dummy_check == -1) {
      // 新しいaccessTokenを申請
      const authApiBaseUrl = useRuntimeConfig().public.authApiBaseUrl;
      const url_refresh = `${authApiBaseUrl}/auth/refresh`;
      const APIKey = useRuntimeConfig().public.loginApiKey; // システムごとに払い出されるキー
      const params_refresh = {
        refreshToken: decode_accessToken_json.refreshToken,
      };
      const request_header = {
        headers: {
          'apiKey': APIKey,
          'Content-Type': 'application/json'
        }
      };
      const res_refresh = await axios.post(url_refresh, params_refresh, request_header);
      const tokens = res_refresh.data;

      // accessToken をデコード
      const decode_new_accessToken = await jwt_decode_token(tokens.accessToken);
      const decode_new_accessToken_json = JSON.parse(decode_new_accessToken);
      const new_operatorId = decode_new_accessToken_json.operator_id;

      // ロールを取得
      const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
      const headers_role = {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      };
      const url_role = `${miscApiBaseUrl}/operatorRole?operatorId=${new_operatorId}`;
      
      const res_role = await axios.get(url_role, headers_role);
      const roles = res_role.data;

      //JWTトークン作成
      jwt_payload = {
        accessToken: tokens.accessToken,
        refreshToken: decode_accessToken_json.refreshToken,
        operatorId: roles.operatorId,
        operatorName: roles.operatorName,
        roleList: roles.roleList
      }
    } else {
      jwt_payload = {
        accessToken: decode_accessToken_json.accessToken,
        refreshToken: decode_accessToken_json.refreshToken,
        operatorId: decode_accessToken_json.operatorId,
        operatorName: decode_accessToken_json.operatorName,
        roleList: decode_accessToken_json.roleList
      }
    }
    const expires = {
      expiresIn: '12h'
    }
    const new_jwt_token = await jwt.sign(
      jwt_payload,
      SECRET_KEY,
      expires
    );

    // Cookie を登録(maxAge は seconds)
    setCookie(event, 'auth.token', new_jwt_token, { maxAge: 43200 });
    console.log(`refresh auth success.`);
    return {
      statusCode: 200,
      statusMessage: 'refresh auth success.'
    };
  } catch (error) {
    console.error(`refresh Faild(${error}).`);
  }
};

export default defineEventHandler(async (event) => {
    try {
      await refreshaccessToken(event);
    } catch (error) {
      console.error(`refresh Faild(${error}).`);
    }
});