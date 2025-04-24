/* 航路予約 日時フォーマット変換
 * @param input YYYY-MM-DDTHH:MM:SSZ形式の文字列
 * @returns YYYY/MM/DD HH:MM形式の文字列
 */

export const useDateString1 = (input) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/* 航路予約 日時フォーマット変換
 * @param input YYYY-MM-DDTHH:MM:SSZ形式の文字列
 * @returns YYYY/MM/DD形式の文字列
 */
export const useDateString2 = (input) => {
  //return input.slice(0, 4) + '/' + input.slice(5, 7) + '/' + input.slice(8, 10);
  const date = new Date(input);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}/${month}/${day}`;
}

/* 航路予約 ローカルの時刻を取得
 * @param input YYYY-MM-DDTHH:MM:SSZ形式の文字列
 * @returns YYYY-MM-DDTHH:MM:SSZ形式の文字列
 */

export const useDateStringUTCtoLocal = (input) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

/* 航路予約 UTC時刻を取得
 * @param input YYYY-MM-DDTHH:MM:SSZ形式の文字列
 * @returns YYYY-MM-DDTHH:MM:00Z 形式の文字列
 */
export const useDateStringLocaltoUTC = (input) => {
  const localDate = new Date(input);
  const utcYear = localDate.getUTCFullYear();
  const utcMonth = String(localDate.getUTCMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
  const utcDay = String(localDate.getUTCDate()).padStart(2, '0');
  const utcHours = String(localDate.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}:00Z`;
}

/* 曜日取得
 * @param input YYYY-MM-DD または YYYY/MM/DD などの文字列
 * @returns 曜日 (日～土)
 */
export const useDateStringGetDayOfTheWeekString = (input) => {
  let date = new Date(input.slice(0, 4), input.slice(5, 7) - 1, input.slice(8, 10));
  let dayOfTheWeekStr = ["日", "月", "火", "水", "木", "金", "土"];
  return dayOfTheWeekStr[date.getDay()];
}