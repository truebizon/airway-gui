const { addHeader } = useUrlHeader()

/**
 * ドローンポート情報一覧取得
 * @param params クエリパラメータ
 * @returns 結果オブジェクト
 */
export const useRestApiDronePortGetList = async (params?: DronePortGetListRequestQueryParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  let url = apiBaseUrl + '/droneport/info/list'
  if (params) {
    const query = new URLSearchParams(params)
    url = `${url}?${query}`
  }
  const headers = await addHeader(apiRole)
  return await fetch(url, { method: 'GET', headers: headers })
}

/**
 * ドローンポート情報詳細取得
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiDronePortGetByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/droneport/info/detail/${id}`, { method: 'GET', headers: headers })
}

/**
 * ドローンポート情報登録
 * @param formData 登録データ
 * @returns 結果オブジェクト
 */
export const useRestApiDronePortRegister = async (formData: DronePortRegisterRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/droneport/info`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * ドローンポート情報更新
 * @param id ID
 * @param formData 更新データ
 * @returns 結果オブジェクト
 */
export const useRestApiDronePortUpdateByPk = async (id: string, formData: DronePortUpdateByPkRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/droneport/info`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * ドローンポート情報削除
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiDronePortDeleteByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const formData = { operatorId: null }
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/droneport/info/${id}`, { method: 'DELETE', headers: headers, body: JSON.stringify(formData) })
}

/**
 * ドローンポート予約情報一覧取得
 * @param params クエリパラメータ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveDronePortGetList = async (params?: DronePortReserveGetListRequestQueryParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  let url = apiBaseUrl + '/droneport/reserve/list'
  if (params) {
    const query = new URLSearchParams(params)
    url = `${url}?${query}`
  }
  const headers = await addHeader(apiRole)
  return await fetch(url, { method: 'GET', headers: headers })
}

/**
 * ドローンポート予約情報詳細取得
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiReserveDronePortGetByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/droneport/reserve/detail/${id}`, { method: 'GET', headers: headers })
}

/**
 * ドローンポート予約情報登録
 * @param formData 登録データ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveDronePortRegister = async (formData: DronePortReserveRequestParamData) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/droneport/reserve`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * ドローンポート予約情報更新
 * @param id ID
 * @param formData 更新データ
 * @returns 結果オブジェクト
 */
export const useRestApiReserveDronePortUpdateByPk = async (id: string, formData: DronePortReserveUpdateRequestParams) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/droneport/reserve`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(formData),
  })
}

/**
 * ドローンポート予約情報削除
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiReserveDronePortDeleteByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  const formData = { operatorId: null }
  const roleInfo: any = await roleVerification(apiRole)
  formData.operatorId = roleInfo.operatorId
  return await fetch(apiBaseUrl + `/droneport/reserve/${id}`, { method: 'DELETE', headers: headers, body: JSON.stringify(formData) })
}

/**
 * ドローンポート周辺情報取得
 * @param id ID
 * @returns 結果オブジェクト
 */
export const useRestApiEnvironmentDronePortGetByPk = async (id: string) => {
  const apiRole = ['1', '2', '3']
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const headers = await addHeader(apiRole)
  return await fetch(apiBaseUrl + `/droneport/environment/${id}`, { method: 'GET', headers: headers })
}
