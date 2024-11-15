import { InMemoryLinksRepository } from 'test/repositories/in-memory-links-repository'
import { faker } from '@faker-js/faker'
import { FetchLinkUseCase } from './fetch-link'
import { CreateLinksUseCase } from './create-short-link'
import { MockEnvService } from 'test/env/faker-env'

let inMemoryLinksRepository: InMemoryLinksRepository
let stu: FetchLinkUseCase
let inMemoryEnvService: MockEnvService
let createLinksUseCase: CreateLinksUseCase

describe('Fetch Short Link', () => {
  beforeEach(() => {
    inMemoryLinksRepository = new InMemoryLinksRepository()
    inMemoryEnvService = new MockEnvService()
    createLinksUseCase = new CreateLinksUseCase(
      inMemoryLinksRepository,
      inMemoryEnvService,
    )
    stu = new FetchLinkUseCase(inMemoryLinksRepository)
  })

  it('should be able to fetch links with userId', async () => {
    const userId = faker.string.uuid()
    await createLinksUseCase.execute({
      originalUrl: 'https://teddy360.com.br/',
      userId,
    })

    await createLinksUseCase.execute({
      originalUrl: 'https://rocketseat.com.br/',
      userId,
    })

    await createLinksUseCase.execute({
      originalUrl: 'https://4codesolutions.com.br',
      userId,
    })

    const result = await stu.execute({
      userId,
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.isRight()).toBeTruthy()
      expect(result.value.links).toHaveLength(3)
    }
  })

  it('should be able to fetch links with pagination with userId', async () => {
    const userId = faker.string.uuid()
    for (let i = 0; i < 22; i++) {
      await createLinksUseCase.execute({
        originalUrl: 'https://teddy360.com.br/',
        userId,
      })
    }

    const result = await stu.execute({
      userId,
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.isRight()).toBeTruthy()
      expect(result.value.links).toHaveLength(2)
    }
  })

  it('shoud be able to fetch links ordered by more recent with userId', async () => {
    const userId = faker.string.uuid()
    await createLinksUseCase.execute({
      originalUrl: 'https://teddy360.com.br/',
      userId,
    })
    await createLinksUseCase.execute({
      originalUrl: 'https://rocketseat.com.br/',
      userId,
    })
    await createLinksUseCase.execute({
      originalUrl: 'https://4codesolutions.com.br',
      userId,
    })
    const result = await stu.execute({
      userId,
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.isRight()).toBeTruthy()
      expect(result.value.links).toEqual([
        expect.objectContaining({
          originalUrl: 'https://4codesolutions.com.br',
        }),
        expect.objectContaining({
          originalUrl: 'https://rocketseat.com.br/',
        }),
        expect.objectContaining({
          originalUrl: 'https://teddy360.com.br/',
        }),
      ])
    }
  })
})
