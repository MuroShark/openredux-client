export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  role: string;
  premiumUntil?: string;
  bio?: string;
  socialLinks?: { [key: string]: string };
  downloadsCount?: number;
  lastLoginAt?: string;
}

// Хелпер для проверки премиума (сравнивает дату с текущей)
export function isPremium(user: User | null): boolean {
  if (!user || !user.premiumUntil) return false;
  return new Date(user.premiumUntil) > new Date();
}