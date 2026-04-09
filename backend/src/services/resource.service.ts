import { notFound } from '../errors/app-error'
import { resourceRepository } from '../repositories/resource.repository'

export const resourceService = {
  getAll: async (params: {
    search?: string
    type?: 'BOOK' | 'COURSE'
    category?: string
    page?: number
    limit?: number
  }) => {
    const page = params.page || 1
    const limit = params.limit || 10

    const [resources, total] = await resourceRepository.findAll({
      search: params.search,
      type: params.type,
      category: params.category,
      page,
      limit,
    })

    return {
      data: resources,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  getById: async (id: string) => {
    const resource = await resourceRepository.findById(id)
    if (!resource) {
      throw notFound('Resource not found')
    }
    return resource
  },
}
