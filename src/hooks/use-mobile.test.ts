import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const MOBILE_BREAKPOINT = 768;
  let listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const createMatchMedia = (width: number) => {
    return vi.fn().mockImplementation((query: string) => {
      const matches = width < MOBILE_BREAKPOINT;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            listeners.push(callback);
          }
        }),
        removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            listeners = listeners.filter(l => l !== callback);
          }
        }),
        dispatchEvent: vi.fn(),
      };
    });
  };

  beforeEach(() => {
    listeners = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true for mobile viewport (width < 768)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.matchMedia = createMatchMedia(500);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport (width >= 768)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return false for exactly 768px (breakpoint boundary)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    window.matchMedia = createMatchMedia(768);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for 767px (just below breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });
    window.matchMedia = createMatchMedia(767);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should update when viewport changes from desktop to mobile', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      // Trigger the change event
      listeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    expect(result.current).toBe(true);
  });

  it('should update when viewport changes from mobile to desktop', () => {
    // Start with mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.matchMedia = createMatchMedia(500);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Simulate resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      // Trigger the change event
      listeners.forEach(listener => {
        listener({ matches: false } as MediaQueryListEvent);
      });
    });

    expect(result.current).toBe(false);
  });

  it('should remove event listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    const removeEventListener = vi.fn();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle initial undefined state correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.matchMedia = createMatchMedia(1024);

    const { result } = renderHook(() => useIsMobile());
    
    // The hook uses !!isMobile which converts undefined to false initially,
    // but then the useEffect sets the actual value
    expect(typeof result.current).toBe('boolean');
  });
});
