import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { FetchLinkUseCase } from '@/domain/links/usecases/links/fetch-link'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt-strategy'
import { HttpLinksPresenter } from '@/infra/http/presenters/http-links-presenter'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParam = z.infer<typeof pageQueryParamSchema>
@ApiTags('FetchLinks')
@Controller('/links')
export class FetchLinkController {
  constructor(private fetchLinkUseCase: FetchLinkUseCase) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fetch links',
    description:
      'Fetches a list of links for the authenticated user, if logged in.',
  })
  @ApiResponse({ status: 200, description: 'Links fetched successfully.' })
  @ApiResponse({
    status: 404,
    description: 'Links not found for the given user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters.' })
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParam,
    @CurrentUser() user?: UserPayload,
  ) {
    const { sub: userId } = user

    const result = await this.fetchLinkUseCase.execute({
      page,
      userId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    if (result.isRight()) {
      return result.value.links.map(HttpLinksPresenter.toHttp)
    }
  }
}
