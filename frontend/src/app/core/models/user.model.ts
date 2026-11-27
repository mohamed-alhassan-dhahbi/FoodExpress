export type Role = 'CLIENT' | 'RESTAURANT' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

/**
 * Shape sent by the API: login/register return "id",
 * while /me, profile and admin routes return the raw MongoDB "_id".
 */
export type ApiUser = Omit<User, 'id'> & { id?: string; _id?: string };

export function normalizeUser(user: ApiUser): User {
  const { _id, id, ...rest } = user;
  return { ...rest, id: id ?? _id ?? '' };
}