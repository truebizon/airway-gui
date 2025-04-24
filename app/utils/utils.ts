import { DateTime } from 'luxon'

interface Utils {
  isNullUndefined(val: any): boolean
  isBlank(val: any): boolean
  isNullUndefinedEmptyArray(val: any): boolean
  isNormalStatusResponse(val: any): boolean
  toFormatJSTtime(val: string, format?: string, timezone?: string): string
  convertUTCtoJST(val: string): string | null
  convertJSTtoUTC(val: string): string | null
  convertUTCtoJSTDateTime(val: string): DateTime | null
  convertJSTtoUTCDateTime(val: string): DateTime | null
  createDateIsoAndTimefromUTCISOTime(fromTimeISO: string, toTimeHHmm: string): string | null
}

// 共通処理関数
const utils: Utils = {
  // null判定
  isNullUndefined(val: any) {
    return typeof val === 'undefined' || val === null
  },
  // null or 空文字判定
  isBlank(val: any) {
    return this.isNullUndefined(val) || val === ''
  },
  // null or 空配列判定
  isNullUndefinedEmptyArray(val: any) {
    return this.isNullUndefined(val) || !Array.isArray(val) || val.length === 0
  },
  // 正常ステータス判定
  isNormalStatusResponse(val: number) {
    return val >= 200 && val < 300
  },

  // ISO形式からJSTの○○：××形式の時刻形式に変換
  toFormatJSTtime(val: string, format = 'HH:mm', timezone = DateTime.local().zoneName) {
    return DateTime.fromISO(val).setZone(timezone).toFormat(format)
  },

  // ISO形式のUTCからJSTへの変換メソッド
  convertUTCtoJST(val: string) {
    const timeZone = DateTime.local().zoneName
    const utcDate = DateTime.fromISO(val)
    const jstDate = utcDate.setZone(timeZone)
    return jstDate.toISO()
  },
  // ISO形式のJSTからUTCへの変換メソッド
  convertJSTtoUTC(val: string) {
    const jstDate = DateTime.fromISO(val)
    const utcDate = jstDate.setZone('utc')
    return utcDate.toISO()
  },

  // ISO形式のUTCからJST(DateTime型)への変換メソッド
  convertUTCtoJSTDateTime(val: string) {
    const timeZone = DateTime.local().zoneName
    const utcDate = DateTime.fromISO(val)
    const jstDate = utcDate.setZone(timeZone)
    return jstDate
  },

  // ISO形式のJSTからUTC(DateTime型)への変換メソッド
  convertJSTtoUTCDateTime(val: string) {
    const jstDate = DateTime.fromISO(val)
    const utcDate = jstDate.setZone('utc')
    return utcDate
  },

  // ISO形式（JST）の時刻（日付情報）とHH:mm形式の時刻から
  // 入力時刻のISO形式（UTC）を生成するメソッド
  createDateIsoAndTimefromUTCISOTime(fromTimeISO: string, toTimeHHmm: string) {
    const startDateTime = DateTime.fromISO(fromTimeISO)
    const [endHour, endMinute] = toTimeHHmm.split(':').map(Number)

    const toTime = startDateTime.set({
      hour: endHour,
      minute: endMinute,
    })
    const toTimeUtc = toTime.setZone('utc')
    return toTimeUtc.toISO()
  },
}
export { utils }
