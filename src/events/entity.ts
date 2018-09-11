import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity';

@Entity()
export default class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', {nullable:false})  
  title: string 

  @Column('text', {nullable:false})  
  description: string 

  @Column('text', {nullable:true})  
  imgUrl: string 

  @Column('text', {nullable:true})  
  address: string 

  @Column('text', {nullable:true, default:'event'})  
  media: string 

  @Column('text', {nullable:true})  
  startDate: Date 

  @Column('text', {nullable:true})  
  endDate: Date 

  @Column('text', {nullable:true})
  location: string

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;
}