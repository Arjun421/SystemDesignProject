import { forbidden, unauthorized } from '../errors/app-error'
import { resourceService } from '../services/resource.service'
import { userRepository } from '../repositories/user.repository'

export interface IResourceAccess {
  getById(id: string, userId?: string): Promise<unknown>
  getAll(
    params: {
      search?: string
      type?: 'BOOK' | 'COURSE'
      category?: string
      page?: number
      limit?: number
    },
    userId?: string
  ): Promise<unknown>
}

class RealResourceService implements IResourceAccess {
  getById(id: string) {
    return resourceService.getById(id)
  }

  getAll(params: {
    search?: string
    type?: 'BOOK' | 'COURSE'
    category?: string
    page?: number
    limit?: number
  }) {
    return resourceService.getAll(params)
  }
}

class ResourceAccessProxy implements IResourceAccess {
  private real = new RealResourceService()

  async getById(id: string, userId?: string) {
    const resource = await this.real.getById(id) as { isPremium: boolean }

    if (resource.isPremium) {
      await this.checkPremiumAccess(userId)
    }

    return resource
  }

  async getAll(
    params: {
      search?: string
      type?: 'BOOK' | 'COURSE'
      category?: string
      page?: number
      limit?: number
    },
    userId?: string
  ) {
    const result = await this.real.getAll(params) as { data: Array<{ isPremium: boolean }>; meta: unknown }
    const role = await this.getUserRole(userId)

    if (role !== 'PREMIUM' && role !== 'ADMIN') {
      result.data = result.data.map((resource) => ({
        ...resource,
        _premiumLocked: resource.isPremium ? true : undefined,
      }))
    }

    return result
  }

  private async checkPremiumAccess(userId?: string) {
    if (!userId) {
      throw unauthorized('Login required to access this resource')
    }

    const user = await userRepository.findById(userId)
    if (!user || user.role === 'FREE') {
      throw forbidden('Premium subscription required')
    }
  }

  private async getUserRole(userId?: string): Promise<string> {
    if (!userId) {
      return 'GUEST'
    }

    const user = await userRepository.findById(userId)
    return user?.role ?? 'FREE'
  }
}

export const resourceProxy = new ResourceAccessProxy()
