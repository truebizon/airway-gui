import { utils } from '~/utils/utils'
import { codes } from '~/constants/codes'
import type { Codes, CodeRow } from '~/constants/codes'

export const useMyFilter = () => {
  /**
   * 数値を","区切りで表示するフィルタ
   * @param value 値
   * @returns '1,000'
   */
  const separateNumber = (value: number | null) => {
    if (utils.isNullUndefined(value)) {
      return value
    }
    return value?.toLocaleString()
  }

  /**
   * 空(null)を"-"で表示するフィルタ
   * @param value 値
   * @returns '-'
   */
  const blankToHyphen = (value: any) => {
    if (utils.isBlank(value)) {
      return '-'
    }
    return value
  }

  /**
   * 小数点n桁に整形するフィルタ
   * @param value 値
   * @returns 1.0
   */
  const toFixed = (value: any, decimal = 1) => {
    if (utils.isBlank(value) || isNaN(value)) {
      return value
    }
    return Number(value).toFixed(decimal)
  }

  /**
   * コード値を文字列に変換するフィルタ
   * @param value コード値
   * @param type コード種別
   * @returns コード名
   */
  const convertCode = (value: any, type: keyof Codes) => {
    if (utils.isBlank(type) || utils.isBlank(value)) {
      return value
    }
    const targetCodes = codes[type]
    if (utils.isNullUndefined(targetCodes)) {
      return []
    }
    const newArray = [] as CodeRow[]
    Object.entries(targetCodes).forEach(([_, fromValue]) => {
      newArray.push(fromValue as CodeRow)
    })

    const targetCode = newArray.find(r => r.value === value)

    if (utils.isNullUndefined(targetCode)) {
      return value
    }

    return targetCode?.title
  }

  /**
   * 離着陸場IDから離着陸場メーカーIDを抽出するフィルタ
   * @param id 離着陸場ID
   * @returns 離着陸場メーカーID
   */
  const extractionMakerId = (id: string) => {
    if (utils.isBlank(id)) {
      return id
    }
    const splitId = id.split('-')
    return splitId[1]
  }

  return { separateNumber, blankToHyphen, toFixed, convertCode, extractionMakerId }
}
