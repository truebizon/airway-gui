import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export default defineEventHandler(async (event) => {

  let response = {};
  const body = await readBody(event);
  const { code } = body;

  console.log(`code : ` + code);

  const config = useRuntimeConfig();
  const redirectUri = config.public.oidcRedirectUri;
  const clientId = config.public.oidcClientId;
  const clientSecret = config.oidcClientSecret;
  const grantType = config.oidcGrantType;
  const tokenEndPoint = config.oidcTokenEndPointDev;
  const issuer = config.oidcIssuerDev;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  };
  const params = { 
    grant_type: grantType,
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  };

  console.log("Get token start.");
  try {
    response = await axios.post(tokenEndPoint, params, { headers: headers });
    if (response.data.id_token) {
      const isVerify = verifyIdToken(response.data.id_token, issuer, clientId);
      if (isVerify) {
        return {
          status: 200,
          data: response.data
        }
      } else {
        console.error('Id token invalid.');
        return {
          status: 400,
        }
      }
    } else {
      console.error('Id token not exist.');
      return {
        status: 400,
      }
    }
  } catch (error) {
    console.error('Failed to getDispToken.');
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
      status: statusCode,
    }
  } finally {
    console.log("Get token end.");
  }
});

// ID トークン検証
function verifyIdToken(idToken, issuer, clientId) {
  const decIdToken = jwtDecode(idToken);
  console.log(decIdToken);
  // iss クレーム確認
  if (decIdToken.iss === issuer) {
    // ID トークンの発行者が異なる場合は不正
    console.log("invalid iss(" + decIdToken.iss + ")");
    return false;
  }
  // aud クレーム確認
  if (decIdToken.aud !== clientId) {
    // クライアントIDと一致しない場合は不正
    console.log("invalid aud(" + decIdToken.aud + ")");
    return false;
  }
  // exp クレーム確認
  console.log("getCurrentUnixTime() : " + getCurrentUnixTime());
  if (decIdToken.exp < getCurrentUnixTime()) {
    // 現在時刻より前の場合は不正
    console.log("invalid exp(" + decIdToken.exp + ")");
    return false;
  }
  console.log("verifyIdToken() success.");
  return true;
}

// Unix 時間取得(秒)
function getCurrentUnixTime() {
  // 現在の時刻をミリ秒単位で取得
  const currentTimeMillis = Date.now();
  
  // ミリ秒から秒に変換
  return Math.floor(currentTimeMillis / 1000);
}