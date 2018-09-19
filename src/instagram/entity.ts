import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity';
import ScrapeSession from '../scrapeSessions/entity';

@Entity()
export default class Instagram extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', {nullable:false, unique:true})  
  mediaId: string 

  @Column('text', {nullable:true})
  text: string

  @Column('int', {nullable:false})
  commentCount: number

  @Column('int', {nullable:false})
  likeCount: number

  @Column('text', {nullable:false})
  displayUrl: string

  @Column('date', {nullable:false})
  date: string 

  @Column('text', {nullable:false})
  isVideo: boolean

  @Column('text', {nullable:true})
  videoUrl: string

  @Column('text', {nullable:false })
  mediaShortCode: string

  @Column('text', {nullable:false})
  userId: string

  @Column('text', {nullable:false})
  hashtag: string

  @Column('text', {nullable:false})
  userName: string

  @Column('text', {nullable:false})
  fullName: string

  @Column('text', {nullable:false})
  profilePicUrl: string

  @Column('text', {nullable:false})
  status: string

  @Column('text', {nullable:false})
  source: string

  @Column('text', {nullable:false})
  type: string

  @Column('text', {nullable:false})
  media: string

  @Column('text', {nullable:false})
  location: string

  @Column('boolean', {nullable:false})
  multiPhoto: boolean

  @Column('text', {nullable:true})
  carouselIndex: string

  @ManyToOne(() => ScrapeSession, scrapeSession => scrapeSession.items)
  scrapeSession: ScrapeSession;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;
}


