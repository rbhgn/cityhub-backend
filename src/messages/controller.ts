import { JsonController, Post, HttpCode, Body, Authorized, Get, Param, Delete} from 'routing-controllers'
import Event from './entity';

@JsonController()
export default class MessageController {

  @Authorized()
  @Post('/message')
  @HttpCode(201)
  async createMessage(
      @Body() Message: Event
  ) {
          return Message.save()
  }

  @HttpCode(201)
  @Get('/message/:location')
  async getMessages(
      @Param('location') location: string
  ) {
      const data = await Event.query(`SELECT * FROM messages WHERE location='${location}'`)
      return data
  }

  @Authorized()
  @HttpCode(201)
  @Delete('/message/:id([0-9]+)')
  async deleteMessage(
      @Param('id') id: number
  ) {
    await Event.delete(id)
    return { id }
  }
}