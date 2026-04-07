// Make passport's Express.User compatible with our AuthRequest.user shape
declare global {
  namespace Express {
    interface User {
      userId?: string  // not used by passport but keeps compatibility
      id: string
      username: string
      email: string
      role: string
      passwordHash: string
      createdAt: Date
    }
  }
}

export {}
