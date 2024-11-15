import { Injectable } from '@nestjs/common'
import { PrismaUserMapper } from '../mappers/prisma-users-mapper'
import { UsersRepository } from '@/domain/users/application/repositories/users-repository'
import { User } from '@/domain/users/enterprise/entities/user'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  async create(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user)

    const createdUser = await this.prisma.user.create({
      data,
    })

    return PrismaUserMapper.toDomain(createdUser)
  }

  async save(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user)

    const updatedUser = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data,
    })

    return PrismaUserMapper.toDomain(updatedUser)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async delete(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data,
    })
  }
}
