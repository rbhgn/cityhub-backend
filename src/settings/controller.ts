import { JsonController, Get, HttpCode, Body, Authorized, Patch, Param, NotFoundError} from 'routing-controllers'

import Setting from './entity';

@JsonController()
export default class SettingsController {

    @Authorized()
    @HttpCode(201)
    @Patch('/settings')
    async updateSettings(
      @Body() update: Partial<Setting>,
    ) {
        const item = await Setting.findOne(update.id)
        if (!item) throw new NotFoundError('Not Found')
        update['data']['refreshData'] ? item.refreshData = Number(update['data']['refreshData']) : null
        update['data']['refreshItem'] ? item.refreshItem = Number(update['data']['refreshItem']) : null
        update['data']['eventInterval'] ? item.eventInterval = Number(update['data']['eventInterval']) : null
        update['data']['messageInterval'] ? item.messageBarInterval = Number(update['data']['messageBarInterval']) : null
       return await item.save()
    }

    @HttpCode(201)
    @Get('/settings/:location')
    async getSettings(
        @Param('location') location: string
    ) {
        // const data = await Setting.query(`SELECT * FROM settings WHERE location='${location}'`)
        const data = await Setting.find({where:{location: location}})

        return data[0]
    }
}