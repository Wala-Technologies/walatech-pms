I'll create a comprehensive frontend prototype for your SAAS Manufacturing Management System with tenant and department isolation. Here's a complete prototype using React with TypeScript:

## 1. Project Structure & Dependencies

```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "tailwindcss": "^3.2.0",
    "@headlessui/react": "^1.7.0",
    "react-hook-form": "^7.43.0",
    "date-fns": "^2.29.0"
  }
}
```

## 2. Core Types & Interfaces

```typescript
// src/types/tenant.ts
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  config: TenantConfig;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  dataIsolationLevel: 'full' | 'partial' | 'none';
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  departmentId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'invited';
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  department: Department | null;
  login: (email: string, password: string, tenantSubdomain: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}
```

## 3. Authentication & Context Providers

```tsx
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, Department, AuthContextType } from '../types/tenant';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);

  const login = async (email: string, password: string, tenantSubdomain: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        tenantSubdomain
      });
      
      const { user, tenant, department, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setTenant(tenant);
      setDepartment(department);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenant(null);
    setDepartment(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.roles.some(role => 
      role.permissions.includes(permission) || role.permissions.includes('*')
    );
  };

  return (
    <AuthContext.Provider value={{ user, tenant, department, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 4. Main Layout & Navigation

```tsx
// src/components/Layout/DashboardLayout.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from './Navigation';
import { DepartmentSwitcher } from './DepartmentSwitcher';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tenant, department } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {tenant?.name} - Manufacturing System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <DepartmentSwitcher />
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## 5. Department-Aware Components

```tsx
// src/components/Layout/DepartmentSwitcher.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';

export const DepartmentSwitcher: React.FC = () => {
  const { department, user, hasPermission } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch user's accessible departments
  React.useEffect(() => {
    if (user && hasPermission('departments:view')) {
      api.get('/departments/my-departments').then(setDepartments);
    }
  }, [user]);

  if (!department) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium">{department.name}</span>
        <span className="text-xs text-gray-500">▼</span>
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">Switch Department</p>
          </div>
          
          {departments.map((dept) => (
            <Menu.Item key={dept.id}>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex justify-between w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => api.post('/users/switch-department', { departmentId: dept.id })}
                >
                  <span>{dept.name}</span>
                  {dept.id === department.id && (
                    <span className="text-green-500">✓</span>
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
```

## 6. Tenant Onboarding Flow

```tsx
// src/components/Onboarding/TenantRegistration.tsx
import React from 'react';
import { useForm } from 'react-hook-form';

interface RegistrationForm {
  companyName: string;
  subdomain: string;
  plan: 'free' | 'pro' | 'enterprise';
  adminEmail: string;
  adminPassword: string;
  industry: string;
  employeeCount: string;
}

export const TenantRegistration: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationForm>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    setLoading(true);
    try {
      await api.post('/tenants/register', data);
      // Redirect to success page or login
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start Your Manufacturing Hub
          </h1>
          <p className="text-gray-600">
            Set up your company's manufacturing management system
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              {...register('companyName', { required: 'Company name is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Manufacturing Inc."
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain
            </label>
            <div className="flex">
              <input
                {...register('subdomain', { 
                  required: 'Subdomain is required',
                  pattern: {
                    value: /^[a-z0-9]+$/,
                    message: 'Only lowercase letters and numbers allowed'
                  }
                })}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-company"
              />
              <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                .manufacturingapp.com
              </span>
            </div>
            {errors.subdomain && (
              <p className="text-red-500 text-sm mt-1">{errors.subdomain.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'free', name: 'Free', price: '$0' },
                { id: 'pro', name: 'Pro', price: '$49' },
                { id: 'enterprise', name: 'Enterprise', price: 'Custom' }
              ].map((plan) => (
                <label key={plan.id} className="relative">
                  <input
                    {...register('plan', { required: 'Please select a plan' })}
                    type="radio"
                    value={plan.id}
                    className="sr-only"
                  />
                  <div className="cursor-pointer border rounded-lg p-4 text-center hover:border-blue-500 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-200">
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600">{plan.price}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
          >
            {loading ? 'Creating Your Account...' : 'Start Free Trial'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

## 7. Department-Scoped Dashboard

```tsx
// src/components/Dashboard/DepartmentDashboard.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const DepartmentDashboard: React.FC = () => {
  const { department, user, hasPermission } = useAuth();
  const [stats, setStats] = useState({
    inventoryItems: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    todayProduction: 0
  });

  React.useEffect(() => {
    // Fetch department-specific statistics
    api.get('/dashboard/stats').then(setStats);
  }, [department?.id]);

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {department?.name} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {department?.dataIsolationLevel === 'full' 
                ? 'Viewing data for your department only'
                : 'Viewing all company data'
              }
            </p>
          </div>
          
          {hasPermission('reports:view') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Inventory Items"
          value={stats.inventoryItems}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          trend="+5%"
          color="orange"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          trend="-3%"
          color="red"
        />
        <StatCard
          title="Today's Production"
          value={stats.todayProduction}
          trend="+8%"
          color="green"
        />
      </div>

      {/* Department-Specific Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <ActivityList departmentId={department?.id} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; trend: string; color: string }> = ({
  title,
  value,
  trend,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};
```

## 8. Tenant Administration Panel

```tsx
// src/components/Admin/TenantSettings.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const TenantSettings: React.FC = () => {
  const { tenant, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  if (!hasPermission('tenant:manage')) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">You don't have permission to access tenant settings.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'general' && <GeneralSettings tenant={tenant} />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
};

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  React.useEffect(() => {
    api.get('/departments').then(setDepartments);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Department Management</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Department
        </button>
      </div>

      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{dept.name}</h4>
              <p className="text-sm text-gray-500">
                Code: {dept.code} • Isolation: {dept.dataIsolationLevel}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 9. Main App Router

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { TenantRegistration } from './components/Onboarding/TenantRegistration';
import { Login } from './components/Auth/Login';
import { DepartmentDashboard } from './components/Dashboard/DepartmentDashboard';
import { TenantSettings } from './components/Admin/TenantSettings';
import { InventoryManagement } from './components/Inventory/InventoryManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<TenantRegistration />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DepartmentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute>
              <DashboardLayout>
                <InventoryManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/tenant-settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <TenantSettings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
```

This prototype provides:

1. **Multi-tenant authentication** with subdomain support
2. **Department-aware UI** with switching capabilities
3. **Role-based permissions** throughout the application
4. **Tenant onboarding flow** with subdomain registration
5. **Administration panels** for tenant management
6. **Responsive design** with Tailwind CSS
7. **Type-safe** development with TypeScript

The frontend automatically adapts based on the user's department isolation level and permissions, providing a seamless experience across different roles and departments within the same tenant.