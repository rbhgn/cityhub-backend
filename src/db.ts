import { createConnection } from 'typeorm'
import { DefaultNamingStrategy } from 'typeorm/naming-strategy/DefaultNamingStrategy'
import { NamingStrategyInterface } from 'typeorm/naming-strategy/NamingStrategyInterface'
import { snakeCase } from 'typeorm/util/StringUtils'
import User from './users/entity';
import { DATABASE_URL } from './constants';
import Instagram from './instagram/entity';
import Message from './messages/entity';
import Event from './events/entity'
import Setting from './settings/entity';
import ScrapeSession from './scrapeSessions/entity';



class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

  tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName) + 's';
  }

  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCase(embeddedPrefixes.concat(customName ? customName : propertyName).join("_"));
  }

  columnNameCustomized(customName: string): string {
    return customName;
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }
}

export default () =>
  createConnection({
      type: "postgres",
      url: process.env.DATABASE_URL || DATABASE_URL,
      entities: [User, Instagram, Message, Event, Setting, ScrapeSession],
      synchronize: true,
      logging: true,
      namingStrategy: new CustomNamingStrategy()
  })
  .then(_ => console.log('Connected to Postgres with TypeORM'))
