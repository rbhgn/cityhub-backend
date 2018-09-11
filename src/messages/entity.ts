import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity';

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', {nullable:true})  
  message: string 

  @Column('text', {nullable:true})
  location: string

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;
}