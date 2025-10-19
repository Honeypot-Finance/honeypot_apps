import { usePoolsStore } from '@/lib/algebra/state/poolsStore';
import { renderHook, act } from '@testing-library/react';
import { Address } from 'viem';

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('PoolsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
    
    // Reset the store to initial state
    usePoolsStore.setState({ pluginsForPools: {} });
  });

  describe('Positive Tests', () => {
    test('should initialize with empty plugins state', () => {
      const { result } = renderHook(() => usePoolsStore());
      
      expect(result.current.pluginsForPools).toEqual({});
    });

    test('should set plugins for a pool correctly', () => {
      const { result } = renderHook(() => usePoolsStore());
      const poolId = '0x123456789abcdef' as Address;
      const plugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: false,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(poolId, plugins);
      });
      
      expect(result.current.pluginsForPools[poolId.toLowerCase()]).toEqual(plugins);
    });

    test('should update existing pool plugins', () => {
      const { result } = renderHook(() => usePoolsStore());
      const poolId = '0x123456789abcdef' as Address;
      
      const initialPlugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: false,
        farmingPlugin: false,
      };
      
      const updatedPlugins = {
        dynamicFeePlugin: false,
        limitOrderPlugin: true,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(poolId, initialPlugins);
      });
      
      act(() => {
        result.current.setPluginsForPool(poolId, updatedPlugins);
      });
      
      expect(result.current.pluginsForPools[poolId.toLowerCase()]).toEqual(updatedPlugins);
    });
  });

  describe('Negative Tests', () => {
    test('should handle empty pool ID gracefully', () => {
      const { result } = renderHook(() => usePoolsStore());
      const emptyPoolId = '' as Address;
      const plugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: false,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(emptyPoolId, plugins);
      });
      
      expect(result.current.pluginsForPools['']).toEqual(plugins);
    });

    test('should handle undefined plugins gracefully', () => {
      const { result } = renderHook(() => usePoolsStore());
      const poolId = '0x123456789abcdef' as Address;
      
      act(() => {
        result.current.setPluginsForPool(poolId, undefined as unknown as { dynamicFeePlugin: boolean; limitOrderPlugin: boolean; farmingPlugin: boolean; });
      });
      
      expect(result.current.pluginsForPools[poolId.toLowerCase()]).toBeUndefined();
    });

    test('should handle null pool ID', () => {
      const { result } = renderHook(() => usePoolsStore());
      const plugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: false,
        farmingPlugin: true,
      };
      
      expect(() => {
        act(() => {
          result.current.setPluginsForPool(null as unknown as Address, plugins);
        });
      }).toThrow();
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle multiple pools with different plugins', () => {
      const { result } = renderHook(() => usePoolsStore());
      
      const pool1 = '0x111' as Address;
      const pool2 = '0x222' as Address;
      const pool3 = '0x333' as Address;
      
      const plugins1 = {
        dynamicFeePlugin: true,
        limitOrderPlugin: false,
        farmingPlugin: false,
      };
      
      const plugins2 = {
        dynamicFeePlugin: false,
        limitOrderPlugin: true,
        farmingPlugin: false,
      };
      
      const plugins3 = {
        dynamicFeePlugin: false,
        limitOrderPlugin: false,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(pool1, plugins1);
        result.current.setPluginsForPool(pool2, plugins2);
        result.current.setPluginsForPool(pool3, plugins3);
      });
      
      expect(result.current.pluginsForPools[pool1.toLowerCase()]).toEqual(plugins1);
      expect(result.current.pluginsForPools[pool2.toLowerCase()]).toEqual(plugins2);
      expect(result.current.pluginsForPools[pool3.toLowerCase()]).toEqual(plugins3);
      expect(Object.keys(result.current.pluginsForPools)).toHaveLength(3);
    });

    test('should normalize pool ID to lowercase', () => {
      const { result } = renderHook(() => usePoolsStore());
      const poolId = '0xABCDEF123456789' as Address;
      const plugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: true,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(poolId, plugins);
      });
      
      expect(result.current.pluginsForPools[poolId.toLowerCase()]).toEqual(plugins);
      expect(result.current.pluginsForPools[poolId]).toBeUndefined();
    });

    test('should handle all plugins enabled', () => {
      const { result } = renderHook(() => usePoolsStore());
      const poolId = '0x123456789abcdef' as Address;
      const allEnabledPlugins = {
        dynamicFeePlugin: true,
        limitOrderPlugin: true,
        farmingPlugin: true,
      };
      
      act(() => {
        result.current.setPluginsForPool(poolId, allEnabledPlugins);
      });
      
      const storedPlugins = result.current.pluginsForPools[poolId.toLowerCase()];
      expect(storedPlugins.dynamicFeePlugin).toBe(true);
      expect(storedPlugins.limitOrderPlugin).toBe(true);
      expect(storedPlugins.farmingPlugin).toBe(true);
    });
  });
});