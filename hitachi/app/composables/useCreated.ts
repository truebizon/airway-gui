export const useCreated = () => {
  const getRole = async (ownpage_role: string[]) => {
    let cookie_role: any = null
    let role = null
    if (import.meta.client) {
      // ロールチェック
      cookie_role = await roleVerification(ownpage_role)
      if (cookie_role.length === 0) {
        console.log(`airwayReservation get role error.`)
        return
      }
      switch (cookie_role.virtual_role) {
        case '1':
          role = 1 // 航路運営者
          break
        case '2':
          role = 2 // 運航事業者
          break
        case '3':
          role = 3 // 関係者
          break
        default:
          role = null
          break
      }
      console.log(`role:${role}`)
    }
    return role
  }
  return { getRole }
}
