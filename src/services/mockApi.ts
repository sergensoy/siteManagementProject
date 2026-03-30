import type { User, CreateUserPayload, UpdateProfilePayload, LoginCredentials } from '@/types/user';

const USERS_KEY = 'mock_users';
const PASSWORDS_KEY = 'mock_passwords';
const RESET_TOKENS_KEY = 'mock_reset_tokens';

interface ResetToken {
  token: string;
  userId: string;
  expiresAt: number;
}

function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getPasswords(): Record<string, string> {
  const data = localStorage.getItem(PASSWORDS_KEY);
  return data ? JSON.parse(data) : {};
}

function savePasswords(passwords: Record<string, string>) {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

// Initialize admin user if none exists
export function initializeMockData() {
  const users = getUsers();
  if (users.length === 0) {
    const adminId = crypto.randomUUID();
    const admin: User = {
      id: adminId,
      username: 'admin',
      email: 'admin@system.com',
      fullName: 'Sistem Yöneticisi',
      phone: '',
      department: 'Yönetim',
      position: 'Sistem Yöneticisi',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    saveUsers([admin]);
    savePasswords({ [adminId]: 'admin123' });
  }
}

// Simulate async delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const mockApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay();
    const users = getUsers();
    const passwords = getPasswords();
    const { identifier, password } = credentials;

    const user = users.find(
      u => (u.email === identifier || u.username === identifier) && u.isActive
    );

    if (!user) throw new Error('Kullanıcı bulunamadı');
    if (passwords[user.id] !== password) throw new Error('Şifre yanlış');

    return { user, token: `mock-token-${user.id}-${Date.now()}` };
  },

  async getUsers(): Promise<User[]> {
    await delay();
    return getUsers();
  },

  async getUserById(id: string): Promise<User> {
    await delay();
    const user = getUsers().find(u => u.id === id);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    return user;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    await delay();
    const users = getUsers();
    const passwords = getPasswords();

    if (users.some(u => u.email === payload.email)) throw new Error('Bu email zaten kullanılıyor');
    if (users.some(u => u.username === payload.username)) throw new Error('Bu kullanıcı adı zaten kullanılıyor');

    const newUser: User = {
      id: crypto.randomUUID(),
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      department: payload.department,
      position: payload.position,
      role: payload.role,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    users.push(newUser);
    saveUsers(users);
    passwords[newUser.id] = payload.password;
    savePasswords(passwords);

    return newUser;
  },

  async updateUser(id: string, payload: UpdateProfilePayload): Promise<User> {
    await delay();
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Kullanıcı bulunamadı');

    users[idx] = { ...users[idx], ...payload };
    saveUsers(users);
    return users[idx];
  },

  async deleteUser(id: string): Promise<void> {
    await delay();
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
  },

  async toggleUserActive(id: string): Promise<User> {
    await delay();
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Kullanıcı bulunamadı');
    users[idx].isActive = !users[idx].isActive;
    saveUsers(users);
    return users[idx];
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await delay();
    const passwords = getPasswords();
    if (passwords[userId] !== currentPassword) throw new Error('Mevcut şifre yanlış');
    if (newPassword.length < 6) throw new Error('Yeni şifre en az 6 karakter olmalıdır');
    passwords[userId] = newPassword;
    savePasswords(passwords);
  },

  async requestPasswordReset(email: string): Promise<{ token: string; userEmail: string }> {
    await delay();
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Bu email adresiyle kayıtlı kullanıcı bulunamadı');

    const token = crypto.randomUUID();
    const resetTokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    resetTokens.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 }); // 30 min
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(resetTokens));

    return { token, userEmail: user.email };
  },

  async validateResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    await delay();
    const resetTokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    const entry = resetTokens.find(t => t.token === token && t.expiresAt > Date.now());
    return entry ? { valid: true, userId: entry.userId } : { valid: false };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await delay();
    if (newPassword.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır');
    const resetTokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
    const entry = resetTokens.find(t => t.token === token && t.expiresAt > Date.now());
    if (!entry) throw new Error('Geçersiz veya süresi dolmuş bağlantı');

    const passwords = getPasswords();
    passwords[entry.userId] = newPassword;
    savePasswords(passwords);

    // Remove used token
    const remaining = resetTokens.filter(t => t.token !== token);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(remaining));
  },
};
