import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// The component tree fires real API calls on mount. Without this stub every
// test run printed Axios "Network Error" noise even though assertions passed.
vi.mock('../services/api', () => {
  const empty = { success: true, data: null };
  const api = {
    get: vi.fn().mockResolvedValue(empty),
    post: vi.fn().mockResolvedValue(empty),
    put: vi.fn().mockResolvedValue(empty),
    patch: vi.fn().mockResolvedValue(empty),
    delete: vi.fn().mockResolvedValue(empty)
  };
  return {
    default: api,
    API_BASE_URL: '/api',
    listOf: () => [],
    fetchImageObjectUrl: vi.fn().mockResolvedValue('blob:stub'),
  };
});

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  });
}

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'blob:stub';
  window.URL.revokeObjectURL = () => {};
}

afterEach(() => {
  vi.clearAllMocks();
});
