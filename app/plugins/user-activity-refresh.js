import axios from 'axios';

let refreshTimer = null;
let lastActivityTime = Date.now();
const non_operation_interval = 3 * 60 * 1000; // 3分
const refresh_interval = 2 * 60 * 1000;  // 1分

export default defineNuxtPlugin((nuxtApp) => {
  // リフレッシュ要求関数
  const refreshToken = async () => {
    try {
      // headerにCookieを付与
      const res_refresh = await axios.post('/api/refreshauth', {}, { withCredentials: true });
    } catch (error) {
      console.error(`activity refresh faild(${error}).`);
    }
  };

  // リフレッシュ実行関数
  const startRefresh = async () => {
    try {
      // タイマーが既に開始している場合は終了(新たに開始しない)
      if (refreshTimer) {
        return;
      }
      // Cookieがない場合終了(タイマーを開始しない)
      const cookie_all = document.cookie;
      if (cookie_all == "") {
        return;
      }
      const auth_token = cookie_all.split(';').find((row) => row.startsWith('auth.token'));
      if (auth_token == undefined) {
        return;
      }
      refreshTimer = setInterval(async () => {
        const now = Date.now();
        const timepassage = now - lastActivityTime;
        if (timepassage > non_operation_interval) {
          stopRefresh();
        } else {
          await refreshToken();
        }
      }, refresh_interval);
    } catch (error) {
      console.error(`refresh startRefresh faild(${error}).`);
    }
  };

  // リフレッシュ停止関数
  const stopRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  // ユーザ操作検知イベント
  const userActivityHandler = async () => {
    try {
      lastActivityTime = Date.now();
      if (!refreshTimer) {
        console.log(`activity refresh(user operation was detected).`);
        await startRefresh();
      }
    } catch (error) {
      console.error(`refresh userActivityHandler faild(${error}).`);
    }
  };

  // ユーザー操作を検知するイベントを登録
  if (process.client) {
    try {
      const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
      activityEvents.forEach((event) => {
        window.addEventListener(event, userActivityHandler);
      });
    } catch (error) {
      console.error(`refresh addEventListener(userActivityHandler) faild(${error}).`);
    }
  }
  // アプリがアンマウントされたらリスナーを削除
  nuxtApp.hook('app:unmounted', () => {
    try {
      stopRefresh();
      activityEvents.forEach((event) => {
        window.removeEventListener(event, userActivityHandler);
      });
    } catch (error) {
      console.error(`refresh app:unmounted faild(${error}).`);
    }
  });
});