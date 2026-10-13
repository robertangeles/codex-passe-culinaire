import type { Access, FieldAccess } from 'payload'

const roleOf = (user: unknown): unknown => user && typeof user === 'object' && 'role' in user ? user.role : undefined

export const isAdmin = (user: unknown): boolean => roleOf(user) === 'admin'
export const isStaff = (user: unknown): boolean => roleOf(user) === 'admin' || roleOf(user) === 'editor'

export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const staffOnly: Access = ({ req }) => isStaff(req.user)
export const staffField: FieldAccess = ({ req }) => isStaff(req.user)
export const adminField: FieldAccess = ({ req }) => isAdmin(req.user)
export const publishedOrStaff: Access = ({ req }) =>
  isStaff(req.user) || { _status: { equals: 'published' } }
export const publishedFlagOrStaff: Access = ({ req }) =>
  isStaff(req.user) || { published: { equals: true } }
