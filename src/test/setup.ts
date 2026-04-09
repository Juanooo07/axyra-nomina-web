import '@testing-library/jest-dom';

// Mock Supabase
vi.mock('./lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock Auth Context
vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));