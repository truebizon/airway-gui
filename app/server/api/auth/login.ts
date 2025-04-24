
import {NuxtAuthHandler} from '#auth';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Buffer } from 'buffer';
import { defineEventHandler } from 'h3'


export const SECRET_KEY = 'Drone_route_service';

export const jwt_decode_token = async (token: string) => {
  try {
    const parts = token.split('.');
    // ペイロードをデコード
    const decode = Buffer.from(parts[1], 'base64');
    const payload = decode.toString();

    return payload;
  } catch (error) {
    console.error(`jwt_decode_token error:${error}`);
    throw new Error(error);
  }
}

export default defineEventHandler(async (event) => {
    try {
      const {userId, password} = await readBody(event);
      let jwt_payload = {};
      /* API利用版ログイン認証 */
        // アクセストークン取得(ログイン認証apiの実行)
        const authApiBaseUrl = useRuntimeConfig().public.authApiBaseUrl;
        const url_login = `${authApiBaseUrl}/auth/login`;
        const APIKey = useRuntimeConfig().public.loginApiKey; // システムごとに払い出されるキー
        const params_login = {
          operatorAccountId: userId,
          accountPassword: password
        };
        const request_header = {
          headers: {
            'apiKey': APIKey,
            'Content-Type': 'application/json'
          }
        };
        const res_login = await axios.post(url_login, params_login, request_header);
        const tokens = res_login.data;
        // アクセストークンをデコードし、operatorIdを取得
        const decode = await jwt_decode_token(tokens.accessToken);
        const accessToken_json = JSON.parse(decode);
        const operatorId = accessToken_json.operator_id;

        // ロールを取得
        const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
        const headers_role = {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        };

        const url_role = `${miscApiBaseUrl}/operatorRole?operatorId=${operatorId}`;
        const res_role = await axios.get(url_role, headers_role);
        const roles = res_role.data;

        //JWTトークン作成
        jwt_payload = {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          operatorId: roles.operatorId,
          operatorName: roles.operatorName,
          roleList: roles.roleList
        }

      const expires = {
        expiresIn: '12h'
      }
      const jwt_token = await jwt.sign(
        jwt_payload,
        SECRET_KEY,
        expires
      );

      return {
        token: jwt_token,
      }
    } catch (error) {
        console.error(`login faild(${error}).`);
        return {
          token: `login faild(${error}).`
        }
    }
})