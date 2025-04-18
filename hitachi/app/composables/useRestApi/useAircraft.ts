const { addHeader } = useUrlHeader()

/**
 * 機体情報一覧取得
 * @param params クエリパラメータ
 * @returns 結果オブジェクト
 */
export const useRestApiAircraftGetList = async (params?: AircraftGetListRequestQueryParams) => {
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  let url = apiBaseUrl + '/aircraft/info/list'
  const apiRole = ['1', '2', '3']
  if (params) {
    const query = new URLSearchParams(params)
    url = `${url}?${query}`
  }
  const headers = await addHeader(apiRole)
  return await fetch(url, { method: 'GET', headers: headers })
}

/**
 * 機体情報詳細取得
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiAircraftGetByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/aircraft/info/detail/${id}`, { method: 'GET', headers: headers })
}

/**
 * 機体情報登録
 * @param formData 登録データ
 * @returns 結果オブジェクト
 */
export const useRestApiAircraftRegister = async (formData: AircraftRegisterRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/info`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * 機体情報更新
 * @param id ID
 * @param formData 更新データ
 * @returns 結果オブジェクト
 */
export const useRestApiAircraftUpdateByPk = async (id: string, formData: AircraftUpdateByPkRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/info`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * 機体情報削除
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiAircraftDeleteByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const formData = { operatorId: null }
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/info/${id}`, { method: 'DELETE', headers: headers, body: JSON.stringify(formData) })
}

/**
 * 機体予約情報一覧取得
 * @param params クエリパラメータ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveAircraftGetList = async (params?: AircraftReserveGetListRequestQueryParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  let url = apiBaseUrl + '/aircraft/reserve/list'
  if (params) {
    const query = new URLSearchParams(params)
    url = `${url}?${query}`
  }
  const headers = await addHeader(apiRole)
  return await fetch(url, { method: 'GET', headers: headers })
}

/**
 * 機体予約情報詳細取得
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiReserveAircraftGetByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/aircraft/reserve/detail/${id}`, { method: 'GET', headers: headers })
}

/**
 * 機体予約情報登録
 * @param formData 登録データ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveAircraftRegister = async (formData: AircraftReserveRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/reserve`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * 機体予約情報更新
 * @param id ID
 * @param formData 更新データ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveAircraftUpdateByPk = async (id: string, formData: AircraftUpdateReserveRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/reserve`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * 機体予約情報削除
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiReserveAircraftDeleteByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const formData = { operatorId: null }
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/aircraft/reserve/${id}`, { method: 'DELETE', headers: headers, body: JSON.stringify(formData) })
}
