// import
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const getDefaultAuthorizationToken = (url) => {
  const auth_token = document.cookie.split(';').find((row) => row.startsWith('auth.token')).split('=')[1];
  const decode = jwtDecode(auth_token);
  const apigwUrl = useRuntimeConfig().public.apigwApiBaseUrl;
  const tokenUrl = useRuntimeConfig().public.weatherApiBaseUrl;
  const tokenStr = useRuntimeConfig().public.weatherApiToken;

  const tokenMap = {
    [tokenUrl]: tokenStr,
  };

  for (const key in tokenMap) {
    if (url.startsWith(key)) return tokenMap[key];
  }

  if (url.startsWith(apigwUrl)) return `Bearer ${decode.accessToken}`;

  return '';
}

const addDefaultAuthorizationToken = (headers, url, type) => {
  let tokenRequired = false;
  let tmpHeaders = {};

  // タイプによってヘッダの形式が異なる
  if (type == 'GET' || type == 'DELETE') {
    tmpHeaders = headers;
  } else if (type == 'POST' || type == 'PUT') {
    if (!('headers' in headers)) {
      headers['headers'] = {};
      tmpHeaders = headers['headers'];
    }
  }

  // Authorization フィールドと authorizationtoken フィールドが存在しない場合のみ追加
  // 予約APIがGW対応完了次第、Authorizationの条件は削除する
  if (!('Authorization' in tmpHeaders) && !('authorizationtoken' in tmpHeaders)) {
    tokenRequired = true;
  }

  if (tokenRequired) {
    const token = getDefaultAuthorizationToken(url);
    // URL に対応する認証トークンの定義が無い場合は何もしない
    if (token === '') return;

    if (type == 'GET' || type == 'DELETE') {
      headers['Authorization'] = token;
    } else if (type == 'POST' || type == 'PUT') {
      headers['headers']['Authorization'] = token;
    }
  }
}

/*** axios ***/
/* axios GET
 * @params   url    : URL
 *          param  : クエリパラメータ(JSON)
 *          headers: ヘッダ
 *          timeout : タイムアウト値（ミリ秒）
 * @returns {status:HTTPステータスコード data:レスポンスデータ}
 */
 
export const axios_get = async (url, params={}, headers={}, timeout=useRuntimeConfig().public.timeoutValueGet, ...[useDefaultToken=true]) => {
  let response = {};
  let query = {};

  console.log(`axios_get start: ${url}`);
  if (useDefaultToken) {
    addDefaultAuthorizationToken(headers, url, 'GET');
  }

  if (params.length !=0) {
    query = {
      params:params,
      headers,
      timeout
    };
  } else {
    query = {
      headers,
      timeout
    };
  }

  try {
    if (query.length != 0) {
      const ret = await axios.get(url, query);
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else {
      const ret = await axios.get(url);
      response["status"] = ret.status;
      response["data"] = ret.data;
    }
  } catch (error) {
    let statusCode = -1;
    if (error.response) {
      statusCode = error.response.status;
      console.log(`axios_get HTTP error(status:${statusCode}).`);
    } else {
      console.log(`axios_get request error.`);
    }
    response["status"] = statusCode;
    response["data"] = null;
  } finally {
    console.log(`axios_get end.`);
    return response;
  }
}

/* axios POST
 * @param   url    : URL
 *          params  : リクエストボディ(JSON)
 *          headers: ヘッダ
 *          timeout : タイムアウト値（ミリ秒）
 * @returns {status:HTTPステータスコード data:レスポンスデータ}
 */

export const axios_post = async (url, params={}, headers={}, timeout=useRuntimeConfig().public.timeoutValue, ...[useDefaultToken=true]) => {
  let response = {};

  console.log(`axios_post start: ${url}`);
  if (useDefaultToken) {
    addDefaultAuthorizationToken(headers, url, 'PUT');
  }

  try {
    if (params.length !=0 && headers.length !=0) {
      const ret = await axios.post(url, params, { ...headers, timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else if (params.length != 0 && headers.length ==0) {
      const ret = await axios.post(url, params, { timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else if (params.length == 0 && headers.length !=0) {
      const ret = await axios.post(url, { ...headers, timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else {
      const ret = await axios.post(url, { timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    }
  } catch (error) {
    let statusCode = -1;
    if (error.response) {
      statusCode = error.response.status;
      console.log(`axios_post HTTP error(status:${statusCode}).`);
    } else {
      console.log(`axios_post request error.`);
    }
    response["status"] = statusCode;
    response["data"] = null;
  } finally {
    console.log(`axios_post end.`);
    return response;
  }
}

/*** fetch ***/
/* 指定した URL から情報を GET
 * @param url URL
 * @returns レスポンスデータ
 */

export const getUrl = async (url) => {
  let res;
  let res_data = null;

  res = await fetch(url);
  if (res.status == 200) {
    res_data = await res.json();
  }
  return res_data;
}

/* axios DELETE
 *   送信データをクエリパラメータ (URL) として送信するバージョン
 * @params   url    : URL
 *          param  : 送信データ(JSON)
 *          headers: ヘッダ
 *          timeout : タイムアウト値（ミリ秒）
 * @returns {status:HTTPステータスコード}
 */
 
export const axios_delete = async (url, params={}, headers={}, timeout=useRuntimeConfig().public.timeoutValue, ...[useDefaultToken=true]) => {
  let response = {};
  let query = {};

  console.log(`axios_delete start: ${url}`)
  if (useDefaultToken) {
    addDefaultAuthorizationToken(headers, url, 'DELETE');
  }
  if (params.length !=0) {
    query = {
      params:params,
      headers:headers,
      timeout:timeout,
    };
  } else {
    query = {
      headers:headers,
      timeout:timeout
    };
  }

  try {
    if (query.length != 0) {
      const ret = await axios.delete(url, query);
      response["status"] = ret.status;
    } else {
      const ret = await axios.delete(url);
      response["status"] = ret.status;
    }
  } catch (error) {
    let statusCode = -1;
    if (error.response) {
      statusCode = error.response.status;
      console.log(error.response)
      console.log(`axios_delete HTTP error(status:${statusCode}).`);
    } else {
      console.log(`axios_delete request error.`);
    }
    response["status"] = statusCode;
  } finally {
    console.log(`axios_delete end.`);
    return response;
  }
}

/* axios DELETE
 *   送信データをリクエストボディとして送信するバージョン
 * @params   url    : URL
 *          param  : 送信データ(JSON)
 *          headers: ヘッダ
 *          timeout : タイムアウト値（ミリ秒）
 * @returns {status:HTTPステータスコード}
 */
 
export const axios_delete_body = async (url, params={}, headers={}, timeout=useRuntimeConfig().public.timeoutValue, ...[useDefaultToken=true]) => {
  let response = {};
  let query = {};

  console.log(`axios_delete start: ${url}`)
  if (useDefaultToken) {
    addDefaultAuthorizationToken(headers, url, 'DELETE');
  }
  if (params.length !=0) {
    query = {
      data:params,
      headers:headers,
      timeout:timeout
    };
  } else {
    query = {
      headers:headers,
      timeout:timeout
    };
  }

  try {
    if (query.length != 0) {
      const ret = await axios.delete(url, query);
      response["status"] = ret.status;
    } else {
      const ret = await axios.delete(url);
      response["status"] = ret.status;
    }
  } catch (error) {
    let statusCode = -1;
    if (error.response) {
      statusCode = error.response.status;
      console.log(error.response)
      console.log(`axios_delete HTTP error(status:${statusCode}).`);
    } else {
      console.log(`axios_delete request error.`);
    }
    response["status"] = statusCode;
  } finally {
    console.log(`axios_delete end.`);
    return response;
  }
}

/* axios PUT
 * @param   url    : URL
 *          params  : リクエストボディ(JSON)
 *          headers: ヘッダ
 *          timeout : タイムアウト値（ミリ秒）
 * @returns {status:HTTPステータスコード data:レスポンスデータ}
 */

export const axios_put = async (url, params={}, headers={}, timeout=useRuntimeConfig().public.timeoutValue, ...[useDefaultToken=true]) => {
  let response = {};

  console.log(`axios_put start: ${url}`);
  if (useDefaultToken) {
    addDefaultAuthorizationToken(headers, url, 'PUT');
  }

  try {
    if (params.length !=0 && headers.length !=0) {
      const ret = await axios.put(url, params, { ...headers, timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else if (params.length != 0 && headers.length ==0) {
      const ret = await axios.put(url, params, { timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else if (params.length == 0 && headers.length !=0) {
      const ret = await axios.put(url, { ...headers, timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    } else {
      const ret = await axios.put(url, { timeout });
      response["status"] = ret.status;
      response["data"] = ret.data;
    }
  } catch (error) {
    let statusCode = -1;
    if (error.response) {
      statusCode = error.response.status;
      console.log(`axios_put HTTP error(status:${statusCode}).`);
    } else {
      console.log(`axios_put request error.`);
    }
    response["status"] = statusCode;
    response["data"] = null;
  } finally {
    console.log(`axios_put end.`);
    return response;
  }
}