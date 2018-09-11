import setupDb from './db'
import 'reflect-metadata'
import { verify } from './jwt'
import 'reflect-metadata'
import { Action, BadRequestError, useKoaServer } from 'routing-controllers'
import * as Koa from 'koa'
import {Server} from 'http'
import UserController from './users/controller';
import LoginController from './logins/controller';
import User from './users/entity';
import InstagramController from './instagram/controller';
import MessageController from './messages/controller';
import EventController from './events/controller';
import SettingsController from './settings/controller';

require('dotenv').config()


const app = new Koa()
const server = new Server(app.callback())
const port = process.env.PORT || 4000

useKoaServer(app, {
  cors: true,
  controllers: [
    UserController,
    LoginController,
    InstagramController,
    MessageController,
    EventController,
    SettingsController
  ],  
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')

      try {
        return !!(token && verify(token))
      }
      catch (e) {
        throw new BadRequestError(e)
      }
    }

    return false
  },
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      
      if (token) {
        const {id} = verify(token)
        return User.findOne(id)
      }
    }
    return undefined
  }
})

setupDb()
  .then(_ => {
    server.listen(port)
    console.log(`Listening on port ${port}`)
  })
  .catch(err => console.error(err))