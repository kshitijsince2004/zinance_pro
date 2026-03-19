export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'amc_officer' | 'viewer';
  department?: string;
  location?: string;
  company?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  // New access control fields
  accessLevel: 'global' | 'company' | 'department';
  allowedCompanies: string[];
  allowedDepartments: string[];
  isCompanyHead?: boolean;
  isDepartmentHead?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock users for demo with better data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@herocorp.com',
    name: 'Jasnoor Singh Khalsa',
    role: 'super_admin',
    department: 'IT',
    location: 'Mumbai',
    company: 'Hero Corporate Services',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
    accessLevel: 'global',
    allowedCompanies: ['Hero Corporate Services', 'Hero FinCorp', 'Hero Tech'],
    allowedDepartments: ['IT', 'Finance', 'HR', 'Operations'],
    isCompanyHead: false,
    isDepartmentHead: false
  },
  {
    id: '2',
    email: 'manager@herocorp.com',
    name: 'Sarah Johnson',
    role: 'manager',
    department: 'Finance',
    location: 'Delhi',
    company: 'Hero Corporate Services',
    isActive: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-12-15',
    accessLevel: 'company',
    allowedCompanies: ['Hero Corporate Services'],
    allowedDepartments: ['IT', 'Finance', 'HR', 'Operations'],
    isCompanyHead: true,
    isDepartmentHead: false
  },
  {
    id: '3',
    email: 'amc@herocorp.com',
    name: 'Mike Wilson',
    role: 'amc_officer',
    department: 'Operations',
    location: 'Chennai',
    company: 'Hero Corporate Services',
    isActive: true,
    createdAt: '2024-02-01',
    lastLogin: '2024-12-14',
    accessLevel: 'department',
    allowedCompanies: ['Hero Corporate Services'],
    allowedDepartments: ['Operations'],
    isCompanyHead: false,
    isDepartmentHead: true
  },
  {
    id: '4',
    email: 'viewer@herocorp.com',
    name: 'Lisa Brown',
    role: 'viewer',
    department: 'HR',
    location: 'Bangalore',
    company: 'Hero Corporate Services',
    isActive: true,
    createdAt: '2024-03-01',
    lastLogin: '2024-12-13',
    accessLevel: 'department',
    allowedCompanies: ['Hero Corporate Services'],
    allowedDepartments: ['HR'],
    isCompanyHead: false,
    isDepartmentHead: false
  }
];

class AuthService {
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'currentUser';

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    try {
      console.log('AuthService: Initializing authentication...');
      const savedUser = localStorage.getItem(this.STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthService: Found saved user:', parsedUser);
        // Validate user data and ensure access control fields are present
        if (this.isValidUser(parsedUser)) {
          this.currentUser = this.ensureAccessControlFields(parsedUser);
          // Update localStorage with complete user data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
          console.log('AuthService: User restored from localStorage');
        } else {
          console.log('AuthService: Invalid user data, clearing localStorage');
          // Clear invalid data
          localStorage.removeItem(this.STORAGE_KEY);
        }
      } else {
        console.log('AuthService: No saved user found');
      }
    } catch (error) {
      console.error('AuthService: Error initializing auth:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private ensureAccessControlFields(user: any): User {
    return {
      ...user,
      accessLevel: user.accessLevel || 'department',
      allowedCompanies: user.allowedCompanies || [user.company || 'Hero Corporate Services'],
      allowedDepartments: user.allowedDepartments || [user.department || ''],
      isCompanyHead: user.isCompanyHead || false,
      isDepartmentHead: user.isDepartmentHead || false
    };
  }

  private isValidUser(user: any): user is User {
    return user && 
           typeof user.id === 'string' && 
           typeof user.email === 'string' && 
           typeof user.name === 'string' &&
           ['super_admin', 'admin', 'manager', 'amc_officer', 'viewer'].includes(user.role);
  }

  async login(email: string, password: string): Promise<User> {
    console.log('AuthService: Login attempt for email:', email);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!email || !password) {
      console.log('AuthService: Missing email or password');
      throw new Error('Email and password are required');
    }

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    console.log('AuthService: User lookup result:', user);
    
    if (user && password === 'password123') {
      // Update last login
      user.lastLogin = new Date().toISOString();
      this.currentUser = this.ensureAccessControlFields(user);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      console.log('AuthService: Login successful for user:', this.currentUser.name);
      return this.currentUser;
    }
    
    console.log('AuthService: Login failed - invalid credentials');
    throw new Error('Invalid email or password');
  }

  async register(userData: Partial<User> & { password: string }): Promise<User> {
    console.log('AuthService: Registration attempt for:', userData.email);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!userData.email || !userData.name || !userData.password) {
      console.log('AuthService: Missing required registration fields');
      throw new Error('Name, email and password are required');
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === userData.email!.toLowerCase());
    if (existingUser) {
      console.log('AuthService: User already exists with email:', userData.email);
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role || 'viewer',
      department: userData.department || '',
      location: userData.location || '',
      company: userData.company || 'Hero Corporate Services',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      accessLevel: userData.accessLevel || 'department',
      allowedCompanies: userData.allowedCompanies || [userData.company || 'Hero Corporate Services'],
      allowedDepartments: userData.allowedDepartments || [userData.department || ''],
      isCompanyHead: userData.isCompanyHead || false,
      isDepartmentHead: userData.isDepartmentHead || false
    };

    mockUsers.push(newUser);
    console.log('AuthService: User registered successfully:', newUser.name);
    return newUser;
  }

  logout(): void {
    console.log('AuthService: Logging out user');
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.STORAGE_KEY,
      newValue: null,
      oldValue: JSON.stringify(this.currentUser)
    }));
    console.log('AuthService: Logout complete');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    const isAuth = this.currentUser !== null;
    console.log('AuthService: Authentication check:', isAuth);
    return isAuth;
  }

  hasPermission(action: string, resource: string): boolean {
    if (!this.currentUser) return false;

    const permissions = {
      super_admin: ['*'],
      admin: ['read_assets', 'write_assets', 'read_users', 'write_users', 'read_amc', 'write_amc'],
      manager: ['read_assets', 'write_assets', 'read_amc', 'write_amc', 'read_users'],
      amc_officer: ['read_assets', 'read_amc', 'write_amc'],
      viewer: ['read_assets', 'read_amc']
    };

    const userPermissions = permissions[this.currentUser.role];
    const requiredPermission = `${action}_${resource}`;
    
    return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
  }

  canAccessCompany(company: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.accessLevel === 'global') return true;
    
    const allowedCompanies = this.currentUser.allowedCompanies || [];
    return allowedCompanies.includes(company);
  }

  canAccessDepartment(department: string, company?: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.accessLevel === 'global') return true;
    
    // Check company access first
    if (company && !this.canAccessCompany(company)) return false;
    
    // If company head, can access all departments in their companies
    if (this.currentUser.isCompanyHead && company && this.canAccessCompany(company)) return true;
    
    const allowedDepartments = this.currentUser.allowedDepartments || [];
    return allowedDepartments.includes(department);
  }

  filterUsersByAccess(users: User[]): User[] {
    if (!this.currentUser) return [];
    
    if (this.currentUser.accessLevel === 'global') return users;
    
    return users.filter(user => {
      // Check company access
      if (!this.canAccessCompany(user.company || '')) return false;
      
      // If company head, can see all users in their companies
      if (this.currentUser!.isCompanyHead) return true;
      
      // Otherwise, check department access
      return this.canAccessDepartment(user.department || '', user.company);
    });
  }

  getAllUsers(): User[] {
    const allUsers = mockUsers.filter(u => u.isActive).map(user => this.ensureAccessControlFields(user));
    return this.filterUsersByAccess(allUsers);
  }

  updateUser(id: string, updates: Partial<User>): User {
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    // Check if current user can access this user
    const targetUser = mockUsers[userIndex];
    if (!this.canAccessCompany(targetUser.company || '') || 
        (!this.currentUser?.isCompanyHead && !this.canAccessDepartment(targetUser.department || '', targetUser.company))) {
      throw new Error('Access denied');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    
    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = this.ensureAccessControlFields(mockUsers[userIndex]);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    }
    
    return mockUsers[userIndex];
  }

  deleteUser(id: string): void {
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    // Check if current user can access this user
    const targetUser = mockUsers[userIndex];
    if (!this.canAccessCompany(targetUser.company || '') || 
        (!this.currentUser?.isCompanyHead && !this.canAccessDepartment(targetUser.department || '', targetUser.company))) {
      throw new Error('Access denied');
    }
    
    // Soft delete by setting isActive to false
    mockUsers[userIndex].isActive = false;
  }

  // Get available companies and departments based on user access
  getAvailableCompanies(): string[] {
    if (!this.currentUser) return [];
    if (this.currentUser.accessLevel === 'global') {
      return ['Hero Corporate Services', 'Hero FinCorp', 'Hero Tech'];
    }
    const allowedCompanies = this.currentUser.allowedCompanies || [];
    return allowedCompanies;
  }

  getAvailableDepartments(company?: string): string[] {
    if (!this.currentUser) return [];
    if (this.currentUser.accessLevel === 'global') {
      return ['IT', 'Finance', 'HR', 'Operations'];
    }
    
    if (company && !this.canAccessCompany(company)) return [];
    
    if (this.currentUser.isCompanyHead) {
      return ['IT', 'Finance', 'HR', 'Operations'];
    }
    
    const allowedDepartments = this.currentUser.allowedDepartments || [];
    return allowedDepartments;
  }

  // Get user statistics
  getUserStats() {
    const activeUsers = this.getAllUsers(); // This now respects access control
    const roleStats = activeUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: activeUsers.length,
      roleDistribution: roleStats,
      recentLogins: activeUsers
        .filter(u => u.lastLogin)
        .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
        .slice(0, 5)
    };
  }
}

export const authService = new AuthService();
