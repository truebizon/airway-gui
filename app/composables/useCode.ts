import { codes } from '~/constants/codes'
import type { Codes } from '~/constants/codes'

export const useCode = () => {
  /**
   * コード種別からコードリストを取得する
   * @param type コード種別
   * @param blank true: リストの頭に空白を追加するかどうかのフラグ
   * @returns コードの配列
   */
  const getCodeByType = (type: keyof Codes, blank = false): any => {
    if (utils.isBlank(type)) {
      return []
    }
    const targetCodes = codes[type]
    if (utils.isNullUndefined(targetCodes)) {
      return []
    }
    const newArray = []
    Object.entries(targetCodes).forEach(([_, fromValue]) => {
      newArray.push(fromValue)
    })

    if (blank) {
      newArray.unshift({ value: null, title: '' })
    }
    return newArray
  }

  return { codes, getCodeByType }
}
