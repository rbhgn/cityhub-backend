import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity';

@Entity()
export default class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('int', {nullable:true})  
  refreshData: number

  @Column('int', {nullable:true})  
  refreshItem: number

  @Column('int', {nullable:true})  
  eventInterval: number

  @Column('int', {nullable:true})  
  messageBarSpeed: number

  @Column('text', {nullable:true})
  location: string

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;
}

