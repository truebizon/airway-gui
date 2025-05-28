import getAreaJsonData from '../../app/server/api/getAreaJsonData.js'

import { describe, it, expect } from 'vitest'

describe('getAreaJsonData', () => {
  it('returns JSON data with areas array', async () => {
    const result = await getAreaJsonData()
    expect(result).toHaveProperty('areas')
    expect(Array.isArray(result.areas)).toBe(true)
  })
})
