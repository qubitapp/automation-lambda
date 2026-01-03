import { Request, Response } from 'express'
import { ResponseData } from '../interface'

export const send = (next: Function, data: ResponseData) => async (request: Request, response: Response) => {
  try {
    const result = await next({ request, response, userProfile: {} })
    if (!data?.alreadySendResponse) {
      response.status(data?.code ?? 200).json(result)
    }
  } catch (error: any) {
    console.trace('Error in send function:', error)

    const statusCode = Object.prototype.hasOwnProperty.call(error, 'statusCode') ? error.statusCode : 500
    const message = Object.prototype.hasOwnProperty.call(error, 'statusCode')
      ? error.error
      : { message: 'Internal server error' }
    response.status(statusCode).send(message)
  }
}
