import { jwtDecode } from "jwt-decode";

/* 内部関数 */
export const role_check = async (page_role_list, virtual_role) => {
  let result = false;
  try {
    if (!Array.isArray(page_role_list)) return false;

    // role check
    const is_exist = page_role_list.includes(virtual_role)
    if (is_exist) result = true;

    return result;
  }  catch(error) {
    console.error(`role_check error: ${error}`);
    return result;
  }
}

/* CookieからRoleを取得し、検証をおこなう。
 * 　・表示可能なRoleならCookieから取得したRoleを返却する。
 * 　・表示不可なRoleなら別のエラーページにリダイレクトする。
 * @param page_role_list 各ページが持つroleリスト
 * @returns Cookieから取得したroleオブジェクト(JSON)
 */

export const roleVerification = async (page_role_list) => {
  let role_info = {};
  try {
    //console.log(`roleVerification input role: ${page_role_list}`);
    // CookieからToken('auth.token')を取得
    // (key=value で保存されていて複数の場合、';'で区切られる)
    const auth_token = document.cookie
      .split(';')
      .find((row) => row.startsWith('auth.token'))
      .split('=')[1];
    // Tokenをデコード
    const decode = jwtDecode(auth_token);
    // user role からユーザが選択したroleがpage参照に必要なrole一覧にあるか
    // チェックする(cookieの元々userに付加されているrole一覧は使用しない)
    const virtual_role = localStorage.getItem('virtualRole');
    // ロールを検証
    const check_result = await role_check(page_role_list, virtual_role);
    if (check_result == false) {
      showError({
        statusCode: 403,
        statusMessage:
          'This role is not allowed to view the page.',
      });
      return role_info;
    }
    // role情報作成
    role_info = {
      access_token: decode.accessToken,
      refresh_token: decode.refreshToken,
      operatorId: decode.operatorId,
      operatorName: decode.operatorName,
      roleList: decode.roleList,
      virtual_role: virtual_role
    }
    return role_info;
  } catch(error) {
    role_info = {};
    console.error(`roleVerification error: ${error}`);
    return role_info;
  }
}

/* 検証は行わず、CookieからRoleを取得する。
 * @param なし
 * @returns Cookieから取得したroleオブジェクト(JSON)
 */
export const roleVerification_noncheck = async () => {
  let role_info = {};
  try {
    // CookieからToken('auth.token')を取得
    // (key=value で保存されていて複数の場合、';'で区切られる)
    const auth_token = document.cookie
      .split(';')
      .find((row) => row.startsWith('auth.token'))
      .split('=')[1];
    if (auth_token == null) {
      showError({
        statusCode: 403,
        statusMessage:
          'This role is not allowed to view the page.',
      });
      return role_info;
    }
    // Tokenをデコード
    const decode = jwtDecode(auth_token);
    // role情報作成
    role_info = {
      access_token: decode.accessToken,
      refresh_token: decode.refreshToken,
      operatorId: decode.operatorId,
      operatorName: decode.operatorName,
      roleList: decode.roleList,
    }
    return role_info;
  } catch(error) {
    role_info = {};
    console.error(`roleVerification error: ${error}`);
    return role_info;
  }
}