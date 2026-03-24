/**
 * PROXY PATTERN — Resource Access Control
 *
 * RealResourceService handles actual data fetching.
 * ResourceAccessProxy sits in front and decides if the user can access it.
 * Controllers talk to the Proxy, never directly to the real service.
 */

import { resourceService } from '../services/resource.service'
import { userRepository } from '../repositories/user.repository'

// Interface both Real and Proxy implement
export interface IResourceAccess {
  getById(id: string, userId?: string): Promise<any>
  getAll(params: { search?: string; type?: 'BOOK' | 'COURSE'; page?: number; limit?: number }, userId?: string): Promise<any>
}

// Real subject
class RealResourceService implements IResourceAccess {
  getById(id: string) {
    return resourceService.getById(id)
  }
  getAll(params: any) {
    return resourceService.getAll(params)
  }
}

// Proxy — adds access control on top
class ResourceAccessProxy implements IResourceAccess {
  private real = new RealResourceService()

  async getById(id: string, userId?: string) {
    const resource = await this.real.getById(id)

    if (resource.isPremium) {
      await this.checkPremiumAccess(userId)
    }

    return resource
  }

  async getAll(params: any, userId?: string) {
    const result = await this.real.getAll(params)

    // If not authenticated or free user, hide premium resource details
    const role = await this.getUserRole(userId)
    if (role !== 'PREMIUM' && role !== 'ADMIN') {
      result.data = result.data.map((r: any) => ({
        ...r,
        _premiumLocked: r.isPremium ? true : undefined,
      }))
    }

    return result
  }

  private async checkPremiumAccess(userId?: string) {
    if (!userId) throw { status: 401, message: 'Login required to access this resource' }
    const user = await userRepository.findById(userId)
    if (!user || user.role === 'FREE') {
      throw { status: 403, message: 'Premium subscription required' }
    }
  }

  private async getUserRole(userId?: string): Promise<string> {
    if (!userId) return 'GUEST'
    const user = await userRepository.findById(userId)
    return user?.role ?? 'FREE'
  }
}

// Export singleton proxy — this is what controllers use
export const resourceProxy = new ResourceAccessProxy()
