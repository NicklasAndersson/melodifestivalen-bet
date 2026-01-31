import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for useIsMobile hook tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.spark for SSO tests
Object.defineProperty(window, 'spark', {
  writable: true,
  value: {
    user: vi.fn().mockResolvedValue({
      email: 'test@example.com',
      login: 'testuser',
      avatarUrl: 'https://example.com/avatar.png',
      isOwner: false,
    }),
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
