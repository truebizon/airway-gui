export const useUrlHeader = () => {
  /**
   * ヘッダーを付与
   * @returns 'headers'
   */
  const addHeader = async (apiRole: string[]) => {
    const roleInfo: any = await roleVerification(apiRole)
    const headers = {
      'Content-Type': 'application/json',
      'Apikey': useRuntimeConfig().public.apiKey,
      'Authorization': `Bearer ${roleInfo.access_token}`,
    }
    return headers
  }
  return { addHeader }
}
