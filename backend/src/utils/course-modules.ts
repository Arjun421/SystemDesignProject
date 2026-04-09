export interface NormalizedCourseModule {
  id: string
  title: string
  moduleIndex: number
}

const sanitizeModuleId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const normalizeCourseModules = (modules: unknown): NormalizedCourseModule[] => {
  const rawModules = Array.isArray(modules) ? modules : []

  const normalized = rawModules.map((module, index) => {
    if (typeof module === 'string') {
      const title = module.trim() || `Module ${index + 1}`
      return {
        id: sanitizeModuleId(title) || `module-${index + 1}`,
        title,
        moduleIndex: index,
      }
    }

    if (module && typeof module === 'object') {
      const maybeModule = module as { id?: unknown; title?: unknown; name?: unknown }
      const titleCandidate = typeof maybeModule.title === 'string'
        ? maybeModule.title
        : typeof maybeModule.name === 'string'
          ? maybeModule.name
          : `Module ${index + 1}`
      const idCandidate = typeof maybeModule.id === 'string'
        ? maybeModule.id
        : sanitizeModuleId(titleCandidate) || `module-${index + 1}`

      return {
        id: sanitizeModuleId(idCandidate) || `module-${index + 1}`,
        title: titleCandidate.trim() || `Module ${index + 1}`,
        moduleIndex: index,
      }
    }

    return {
      id: `module-${index + 1}`,
      title: `Module ${index + 1}`,
      moduleIndex: index,
    }
  })

  if (normalized.length > 0) {
    return normalized
  }

  return [
    {
      id: 'module-1',
      title: 'Course content',
      moduleIndex: 0,
    },
  ]
}
