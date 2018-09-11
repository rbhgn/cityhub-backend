import { JsonController, Get, Post, HttpCode, Body, Authorized, NotFoundError, Patch, Param} from 'routing-controllers'
import Instagram from './entity';

@JsonController()
export default class InstagramController {

    // Instagram items for Dashboard
    @Authorized()
    @Get('/hashtags')
    async allHashtags() {
        const hashtags = await Instagram.find()
        return { hashtags }
    }

    // Instagram from Scraper
    @Post('/instagram')
    @HttpCode(201)
    async createSocialScreen(
        @Body() newSocialScreen: Instagram
    ) {
        newSocialScreen.videoUrl ? newSocialScreen.media ='instagramVideo' : newSocialScreen.media ='instagramImage'
        const duplicate = await Instagram.findOne({mediaId: newSocialScreen.mediaId})
        if(!duplicate) {
            return newSocialScreen.save()
        }  else {
            newSocialScreen.status = duplicate.status
            return Instagram.merge(duplicate, newSocialScreen).save()
        } 
    }

    @Authorized()
    @HttpCode(201)
    @Patch('/instagram')
    async updateInstagram(
      @Body() update: Partial<Instagram>,
    ) {
        const item = await Instagram.findOne(Number(update.id)) 
        if (item){
             item.status = 'declined'
             return await item.save()
        } else {
            throw new NotFoundError('Cannot find item')
        }
    }

    @HttpCode(201)
    @Get('/instagram/:location')
    async slideshowData(
        @Param('location') location: string
    ) {
        console.log(location)
        const data = await Instagram.query(`SELECT * FROM instagrams WHERE status='accepted' AND location='${location}' ORDER BY date DESC, id DESC`)
        return data
    }
}