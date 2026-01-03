import createError from 'http-errors'
import { Order } from 'sequelize'

export function badRequest(message: string): {
  statusCode: number
  error: Error
} {
  return { error: createError(400, message), statusCode: 400 }
}

export function unauthorized(message: string): {
  statusCode: number
  error: Error
} {
  return { error: createError(401, message), statusCode: 401 }
}

export function internalError(message: string): {
  statusCode: number
  error: Error
} {
  return { error: createError(500, message), statusCode: 500 }
}

export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function isNil(value: any): boolean {
  return value == null
}

export function pick<T extends object, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>

  fields.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })

  return result
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function jsonParse(data: any): any {
  try {
    return JSON.parse(data)
  } catch (_error) {
    return data
  }
}

export function jsonStringify(data: any): any {
  try {
    return JSON.stringify(data)
  } catch (_error) {
    return data
  }
}

/**
 * pagination
 *
 * @export
 * @param {Filter<any>} filter
 * @returns {Filter<any>}
 */
export function paginate(filter: any = {}): { limit: number; offset: number; order?: Order } {
  const limit = !isNil(filter.limit) ? Number(filter.limit) : 25
  const offset = !isNil(filter.skip) ? Number(filter.skip) : 0
  if (!isNil(filter.sortBy) && !isNil(filter.orderBy))
    return { limit, offset, order: [[filter.sortBy, filter.orderBy]] }

  return { limit, offset }
}


export function parseDateToUTC(dateText: string): string {
  const [day, month, year] = dateText.split(" ")

  const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  }

  return new Date(
    Date.UTC(
      Number(year),
      monthMap[month],
      Number(day)
    )
  ).toISOString()
}
