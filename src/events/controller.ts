import { JsonController, Post, HttpCode, Body, Authorized, Get, Param, Delete} from 'routing-controllers'
import Event from './entity';

@JsonController()
export default class EventController {

  @Authorized()
  @Post('/event')
  @HttpCode(201)
  async createEvent(
      @Body() Event: Event
  ) {
          const newEvent =  await Event.save()
          newEvent['img_url']       = newEvent.imgUrl
          newEvent['start_date']    = newEvent.startDate
          newEvent['end_date']      = newEvent.endDate
          delete newEvent.imgUrl
          delete newEvent.startDate
          delete newEvent.endDate
          return newEvent

  }

  @HttpCode(201)
  @Get('/event/:location')
  async getEvent(
      @Param('location') location: string
  ) {
      const data = await Event.query(`SELECT * FROM events WHERE location='${location}'`)
      return data
  }

  @Authorized()
  @HttpCode(201)
  @Delete('/event/:id([0-9]+)')
  async deleteEvent(
      @Param('id') id: number
  ) {
    await Event.delete(id)
    return { id }
  }
}