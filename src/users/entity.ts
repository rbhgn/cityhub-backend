import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'
import { BaseEntity } from 'typeorm/repository/BaseEntity'
import { Exclude } from 'class-transformer'
import * as bcrypt from 'bcrypt'

@Entity()
export default class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @Column('text')
    email: string

    @Column('text', { nullable:true })
    @Exclude({toPlainOnly:true})
    password: string

    @Column('text', { nullable:true })
    location: string

    @Column('text', { nullable:true })
    hotelCode: string

    @Column('boolean',{default: false})
    admin: boolean

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;

  async setPassword(rawPassword: string) {
    const hash = await bcrypt.hash(rawPassword, 10)
    this.password = hash
  }

  checkPassword(rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, this.password)
  }

}