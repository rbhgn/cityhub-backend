import { JsonController, Get, Post, HttpCode, Body, Authorized, NotFoundError, Patch, Param} from 'routing-controllers'
import Instagram from './entity';
import * as request from 'superagent'
import ScrapeSession from '../scrapeSessions/entity';
import { locations, hashTags, keyWords, owner } from '../scrapeSettings'
import { getPaths, getShortCode } from '../functions'
const snakeCaseKeys = require('snakecase-keys')

// let counter = 0

const getInstaUser =  async (item) => {
    request
    .get(`https://www.instagram.com/p/${item.mediaShortCode}/?__a=1`)
    .then (async (result) =>  {
        const user = JSON.parse(result.text).graphql.shortcode_media
        item.profilePicUrl = user.owner.profile_pic_url
        item.userName = user.owner.username
        item.fullName = user.owner.full_name
        item.userId = user.owner.id
        item.videoUrl = user.video_url
        item.media = item.videoUrl ? 'instagramVideo' : 'instagramImage'
        item.displayUrl = user.display_url
        item.isVideo = user.is_video
        item.multiPhoto = user['__typename'] === 'GraphSidecar' ? true : false 

        if (item.multiPhoto) {
            user.edge_sidecar_to_children.edges.map(async (n, index) =>{
                const newItem = new Instagram()
                newItem.displayUrl = n.node.display_url
                newItem.isVideo = n.node.is_video
                newItem.commentCount = item.commentCount
                newItem.likeCount = item.likeCount
                newItem.date = item.date
                newItem.hashtag = item.hashtag
                newItem.source = item.source
                newItem.status = item.status
                newItem.text = item.text
                newItem.type = item.type
                newItem.mediaShortCode = n.node.shortcode
                newItem.location = item.location
                newItem.scrapeSession = item.scrapeSession
                newItem.multiPhoto = false
                newItem.carouselIndex = index
                newItem.mediaId = item.location + n.node.id
                newItem.profilePicUrl = item.profilePicUrl
                newItem.userName = item.userName
                newItem.fullName = item.fullName
                newItem.userId = item.userId
                newItem.media = newItem.isVideo ? 'instagramVideo' : 'instagramImage'
                newItem.videoUrl = index === 0 && item.videoUrl ? item.videoUrl : n.node.video_url

                    const duplicate = await Instagram.findOne({mediaId: newItem.mediaId})
                    if(!duplicate) {
                            const savedItem = newItem.save()    
                            if (!savedItem) console.log("error saving")
                    }  
                    if (duplicate !== undefined) {
                        item.status === duplicate.status
                        const updateItem = Instagram.merge(duplicate, newItem).save()
                        updateItem ? console.log("Updated Item") : console.log("error updating")
                    }
            })
        } else {
            const duplicate = await Instagram.findOne({mediaId: item.mediaId})
            if(!duplicate) {
                    const savedItem = item.save()    
                    if (!savedItem) console.log("error saving")
            }  
            if (duplicate !== undefined) {
                item.status === duplicate.status
                const updateItem = Instagram.merge(duplicate, item).save()
                updateItem ? console.log("Updated Item") : console.log("error updating")
            }
        }
    })
    .catch(err => {
        console.log(err.status)
    })
  }

const handleItem = (data, item) => {
    const items = getPaths(item, data.type)
    items.map(m => {
        const date = new Date(m.node.taken_at_timestamp * 1000)
        const item = new Instagram()
        item.commentCount = m.node.edge_media_to_comment.count
        item.likeCount = m.node.edge_liked_by.count
        item.date = date.toDateString()
        item.hashtag = data.hashTag
        item.source = 'instagram'
        item.status = 'accepted'
        item.text = m.node.edge_media_to_caption.edges.length > 0 && m.node.edge_media_to_caption.edges[0].node.text
        item.type = data.type
        item.mediaShortCode = m.node.shortcode
        item.location = data.location
        item.scrapeSession = data.scrapeSession
        item.mediaId = data.location + m.node.id
        return item
    }).map(async i => {
        !i.text ? i.text = '' : i.text
        data.containsKeyword = i.text.includes(data.keyWord)
        if ( data.containsKeyword )  {
            try {
                return await getInstaUser(i)
            } catch(e) {
                console.log(e.status)
            }
        }
    })
}

const getInstaByOwner = (data, nextPage, endCursor) => {
    let url
    nextPage ? url =`https://www.instagram.com/${data.owner}/?__a=1&max_id=${endCursor}` : url = `https://www.instagram.com/${data.owner}/?__a=1` 
    request
    .get(url)
    .then(async result => {
       const nextPage = JSON.parse(result.text).graphql.user.edge_owner_to_timeline_media.page_info.has_next_page
       const endCursor = JSON.parse(result.text).graphql.user.edge_owner_to_timeline_media.page_info.end_cursor
       const item = JSON.parse(result.text).graphql.user
       try {
           await handleItem(data, item)
           if (nextPage) {
               try {
                   await getInstaByOwner(data, nextPage, endCursor)
               } catch(e) {
                   console.log(e.status)
               }  
           }
       } catch(e) {
           console.log('109 ' + e.status + ' ' + new Date())
       }  
   })
   .catch(err => {
        console.log('113 ' + err.status + ' ' + new Date())
   }) 
}

const getInstaByLocation = (data, nextPage, endCursor) => {
    let url
     nextPage ? url =`https://www.instagram.com/explore/locations/${data.locationId}/?__a=1&max_id=${endCursor}` : url = `https://www.instagram.com/explore/locations/${data.locationId}/?__a=1`
     request
     .get(url)
     .then(async result => {
        const nextPage = JSON.parse(result.text).graphql.location.edge_location_to_media.page_info.has_next_page
        const endCursor = JSON.parse(result.text).graphql.location.edge_location_to_media.page_info.end_cursor
        const item = JSON.parse(result.text).graphql.location
        try {
            await handleItem(data, item)
            if (nextPage) {
                try {
                    await getInstaByLocation(data, nextPage, endCursor)
                } catch(e) {
                    console.log(e.status)
                }  
            }
        } catch(e) {
            console.log('109 ' + e.status + ' ' + new Date())
        }  
    })
    .catch(err => {
         console.log('113 ' + err.status + ' ' + new Date())
    }) 
}

const getInstaByHashtag= (data, nextPage, endCursor) => {
    let url
     nextPage ? url =`https://www.instagram.com/explore/tags/${data.hashTag}/?__a=1&max_id=${endCursor}` : url = `https://www.instagram.com/explore/tags/${data.hashTag}/?__a=1`
     request
     .get(url)
     .then(async result => {
        const nextPage = JSON.parse(result.text).graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page
        const endCursor = JSON.parse(result.text).graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
        const item = JSON.parse(result.text).graphql.hashtag
        try {
             await handleItem(data, item)
            if (nextPage) {
                try {
                     await getInstaByHashtag(data, nextPage, endCursor)
                } catch(e) {
                    console.log(e.status)
                }  
            }
        } catch(e) {
            console.log('136 ' + e.status + ' ' + new Date())
        }  
    })
    .catch(err => {
         console.log('140 ' + err.status + ' ' + endCursor + ' ' + new Date())
         if (err.status === 429) setTimeout(async () => await getInstaByHashtag(data, nextPage, endCursor), 5 * 60 * 1000)
    }) 
}

const getPages = async (locations, hashTags, keyWords,newScrapeSession) => {
    const nextPage = false
    const endCursor = false
    await owner.map(async o =>{
        o.locations.map(async ol => {
            try {
                const data = {
                    hashTag: 'cityhub',
                    keyWord: 'ownerSearch',
                    type: '',
                    location: ol,
                    shortCode: getShortCode(ol),
                    scrapeSession: newScrapeSession,
                    owner: o.owner
                }
                return await getInstaByOwner(data, nextPage, endCursor)
            } catch(e) {
                console.log(e.status)
            }
        })

    })

    await locations.map(async l => {
        try {
            const data = {
                hashTag: l.hashTag,
                locationId: l.locationId,
                keyWord: '',
                type: 'locationSearch',
                location: l.location,
                shortCode: getShortCode(l.location),
                scrapeSession: newScrapeSession
            }
            return await getInstaByLocation(data, nextPage, endCursor)
        } catch(e) {
            console.log(e.status)
        }     
    })
    await hashTags.map(async h => {
      try {
        const data = {
          hashTag: h.hashTag,
          keyWord: '',
          type: 'hashtagSearch',
          location: h.location,
          shortCode: getShortCode(h.location),
          scrapeSession: newScrapeSession
        }
        !h.keyWord &&  await getInstaByHashtag(data, nextPage, endCursor)
      } catch(e) {
        console.log(e.status)
      }
      await keyWords.map(async k => {
          try {
            const data = {
              hashTag: h.hashTag,
              keyWord: k,
              type: 'hashtagSearch',
              location: k,
              shortCode: getShortCode(k),
              scrapeSession: newScrapeSession
            }
            return await getInstaByHashtag(data, nextPage, endCursor)
          } catch(e) {
            console.log(e.message)
          }
      })
  })
}

const runScraper = async (newScrapeSession) => {
    return await getPages(locations, hashTags, keyWords, newScrapeSession)
}

@JsonController()
export default class InstagramController {

    @Authorized()
    @HttpCode(201)
    @Patch('/instagram')
    async updateInstagram(
      @Body() update: Partial<Instagram>
    ) {
        const item = await Instagram.findOne(Number(update.id)) 
        if (item){
             item.status === 'accepted' ? item.status = 'declined' : item.status = 'accepted'
             const result = await item.save()
             return snakeCaseKeys(result)
        } else {
            throw new NotFoundError('Cannot find item')
        }
    }

    @HttpCode(201)
    @Get('/instagram/:location')
    async slideshowData(
        @Param('location') location: string
    ) {
        const limit = 300
        const data = await Instagram.query(`SELECT * FROM instagrams WHERE status='accepted' AND location='${location}' ORDER BY date DESC, id DESC LIMIT ${limit}`)
        return {location, limit, data}
    }

    @HttpCode(201)
    @Get('/instagrams/:location')
    async allInstagramsLocation(
        @Param('location') location: string
    ) {
        const limit = 'none'
        const data = await Instagram.query(`SELECT * FROM instagrams WHERE location='${location}' ORDER BY date DESC, id DESC `)
        return {location, limit, data}
    }

    @Authorized()
    @HttpCode(201)
    @Post('/scrapesession')
    async allInstagrams(
        @Body() input: object
    ) {
 
        const newScrapeSession = await new ScrapeSession()
        newScrapeSession.scrapedFrom = input['location']
        await newScrapeSession.save()
        runScraper(newScrapeSession)
        const result = await ScrapeSession.findOne(newScrapeSession.id, { relations: ['items'] })
        return {latestSession: result}
    }
    
    @Authorized()
    @HttpCode(201)
    @Get('/scrapesession')
    async allScrapeSessions() {
        const scrapeSessions = await ScrapeSession.find({ relations: ['items'] })
        if (!scrapeSessions) console.log("No Scrapesessions")
        const latestSession = await scrapeSessions.sort((a, b) =>  Number(b.id) - Number(a.id))[0]
        const succesfullScrapes = scrapeSessions.filter(a => a.items.length > 0).map(b => ({
            id: b.id, 
            createdAt: b.createdAt, 
            newItems: b.items.length
        }))
        return { latestSession, succesfullScrapes }
    }
}