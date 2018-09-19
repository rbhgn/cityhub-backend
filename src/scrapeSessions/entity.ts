import { Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Column } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity';
import Instagram from '../instagram/entity';

@Entity()
export default class ScrapeSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number
  
  @Column('text', {nullable:false})
  scrapedFrom: string

  @CreateDateColumn({type: "timestamp without time zone"})
  createdAt: Date;

  @OneToMany(() => Instagram, instagram => instagram.scrapeSession)
  items: Instagram[];
}


