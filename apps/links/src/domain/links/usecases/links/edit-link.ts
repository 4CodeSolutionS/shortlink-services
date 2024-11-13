import { Either, left, right } from '@/core/types/either'
import { LinksRepository } from '../../application/repositories/links-repository'
import { Link } from '../../enterprise/entities/link'
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'

interface EditLinkRequest {
  linkId: string
  newOriginalUrl: string
}

export type EditLinksResponse = Either<ResourceNotFoundError, { link: Link }>
@Injectable()
export class EditLinksUseCase {
  constructor(private linkRepository: LinksRepository) {}

  async execute({
    linkId,
    newOriginalUrl,
  }: EditLinkRequest): Promise<EditLinksResponse> {
    // validar se o link existe pelo id
    const link = await this.linkRepository.findById(linkId)

    // validar se o link existe
    if (!link) {
      return left(new ResourceNotFoundError())
    }
    // validar se o link esta ativo
    if (!link.isActive()) {
      return left(new ResourceNotFoundError())
    }
    // editar o link
    link.originalUrl = newOriginalUrl

    link.clicks = 0

    const updatedLink = await this.linkRepository.save(link)

    return right({ link: updatedLink })
  }
}
