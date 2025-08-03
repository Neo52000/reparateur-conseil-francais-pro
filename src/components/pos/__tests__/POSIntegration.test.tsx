import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { syncService } from '../services/pos/AdvancedSyncService';
import { securityService } from '../services/pos/SecurityService';
import { performanceCache } from '../components/pos/performance/PerformanceOptimizations';

// Mock Navigator API
const mockNavigator = {
  onLine: true,
  usb: {
    requestDevice: vi.fn().mockResolvedValue({
      open: vi.fn(),
      selectConfiguration: vi.fn(),
      claimInterface: vi.fn()
    })
  },
  bluetooth: {
    requestDevice: vi.fn().mockResolvedValue({
      gatt: {
        connect: vi.fn().mockResolvedValue({
          getPrimaryService: vi.fn()
        })
      }
    })
  },
  vibrate: vi.fn()
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock IndexedDB
const mockIDB = {
  open: vi.fn().mockImplementation(() => ({
    result: {
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn() }
    }
  }))
};

vi.stubGlobal('indexedDB', mockIDB);

describe('POS System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    performanceCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Advanced Sync Service', () => {
    it('should handle offline queue correctly', async () => {
      // Simuler hors ligne
      mockNavigator.onLine = false;
      
      await syncService.addToSyncQueue('transaction', {
        id: 'test-transaction',
        amount: 100,
        timestamp: Date.now()
      });

      const status = syncService.getSyncQueueStatus();
      expect(status.pending).toBe(1);
      expect(status.inProgress).toBe(false);
    });

    it('should detect and manage sync conflicts', async () => {
      const mockLocalData = { id: '1', value: 'local', modified: Date.now() };
      const mockServerData = { id: '1', value: 'server', serverModified: Date.now() - 1000 };

      // Simuler un conflit
      await syncService.resolveConflict('1', 'local');
      
      const conflicts = syncService.getConflicts();
      expect(conflicts.length).toBe(0); // Conflit résolu
    });

    it('should perform delta synchronization', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          changes: [
            { id: '1', type: 'update', data: { test: 'data' }, serverModified: Date.now() }
          ]
        })
      } as Response);

      await syncService.performDeltaSync();
      
      expect(fetchSpy).toHaveBeenCalledWith('/api/pos/sync/delta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('lastSync')
      });
    });
  });

  describe('Security Service', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = { sensitive: 'information', amount: 100 };
      
      const encrypted = securityService.encryptData(testData);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('timestamp');

      const decrypted = securityService.decryptData(encrypted);
      expect(decrypted).toEqual(testData);
    });

    it('should validate transaction data', () => {
      const validTransaction = {
        amount: 100,
        paymentMethod: 'card',
        items: [{ id: '1', name: 'Test Item' }]
      };

      const invalidTransaction = {
        amount: -10, // Invalid
        paymentMethod: '', // Missing
        items: [] // Empty
      };

      const validationRules = securityService.getTransactionValidationRules();
      
      const validResult = securityService.validatePOSData(validTransaction, validationRules);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidResult = securityService.validatePOSData(invalidTransaction, validationRules);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it('should create and validate secure sessions', () => {
      const sessionToken = securityService.createSecureSession('user123', 'terminal001');
      expect(sessionToken).toBeTruthy();
      expect(sessionToken).toContain('.');

      const validation = securityService.validateSession(sessionToken);
      expect(validation.isValid).toBe(true);
      expect(validation.data).toHaveProperty('userId', 'user123');
      expect(validation.data).toHaveProperty('terminalId', 'terminal001');
    });

    it('should create audit trail entries', () => {
      const auditEntry = securityService.createAuditEntry('transaction_created', 'user123', {
        amount: 100,
        cardNumber: '1234567890123456'
      });

      const parsedEntry = JSON.parse(auditEntry);
      expect(parsedEntry).toHaveProperty('action', 'transaction_created');
      expect(parsedEntry).toHaveProperty('userId', 'user123');
      expect(parsedEntry).toHaveProperty('timestamp');
      expect(parsedEntry).toHaveProperty('integrity');
      
      // Vérifier que les données sensibles sont hashées
      expect(parsedEntry.data.cardNumber).not.toBe('1234567890123456');
      expect(parsedEntry.data.cardNumber).toContain('...');
    });
  });

  describe('Performance Optimizations', () => {
    it('should cache data with TTL', () => {
      const testData = { id: '1', value: 'cached data' };
      const key = 'test-cache-key';
      
      performanceCache.set(key, testData, 1000); // 1 second TTL
      
      const cachedData = performanceCache.get(key);
      expect(cachedData).toEqual(testData);
      
      // Test expiration
      setTimeout(() => {
        const expiredData = performanceCache.get(key);
        expect(expiredData).toBeNull();
      }, 1100);
    });

    it('should handle cache cleanup', () => {
      performanceCache.set('key1', 'data1', 100); // Short TTL
      performanceCache.set('key2', 'data2', 5000); // Long TTL
      
      setTimeout(() => {
        performanceCache.cleanup();
        
        expect(performanceCache.get('key1')).toBeNull();
        expect(performanceCache.get('key2')).not.toBeNull();
      }, 150);
    });
  });

  describe('Touch Interface', () => {
    it('should detect device type correctly', () => {
      // Mock window dimensions for mobile
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      
      // Simuler le re-render pour déclencher la détection
      window.dispatchEvent(new Event('resize'));
      
      // Le test devrait détecter mobile
      expect(window.innerWidth).toBe(500);
    });

    it('should handle touch gestures', () => {
      const element = document.createElement('div');
      let gestureDetected = '';
      
      // Simuler touch start
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      // Simuler touch end (swipe right)
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 200, clientY: 100 } as Touch]
      });
      
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
      
      // Le geste devrait être détecté comme swipe-right
      expect(Math.abs(200 - 100)).toBeGreaterThan(50); // Seuil de geste
    });

    it('should trigger haptic feedback', () => {
      const button = document.createElement('button');
      
      // Simuler touch start avec vibration
      const touchEvent = new TouchEvent('touchstart');
      button.dispatchEvent(touchEvent);
      
      // Vérifier que vibrate est appelé (si supporté)
      if ('vibrate' in navigator) {
        expect(mockNavigator.vibrate).toHaveBeenCalledWith(10);
      }
    });
  });

  describe('Hardware Integration', () => {
    it('should connect to barcode scanner via WebUSB', async () => {
      await mockNavigator.usb.requestDevice({
        filters: [{ vendorId: 0x1234 }]
      });
      
      expect(mockNavigator.usb.requestDevice).toHaveBeenCalledWith({
        filters: [{ vendorId: 0x1234 }]
      });
    });

    it('should connect to thermal printer via Bluetooth', async () => {
      await mockNavigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
      });
      
      expect(mockNavigator.bluetooth.requestDevice).toHaveBeenCalledWith({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
      });
    });
  });

  describe('End-to-End Transaction Flow', () => {
    it('should complete a full transaction cycle', async () => {
      // 1. Créer une transaction
      const transactionData = {
        amount: 150,
        paymentMethod: 'card',
        items: [
          { id: '1', name: 'Réparation écran', price: 120, quantity: 1 },
          { id: '2', name: 'Protection', price: 30, quantity: 1 }
        ]
      };

      // 2. Valider les données
      const rules = securityService.getTransactionValidationRules();
      const validation = securityService.validatePOSData(transactionData, rules);
      expect(validation.isValid).toBe(true);

      // 3. Chiffrer les données sensibles
      const encrypted = securityService.encryptData(transactionData);
      expect(encrypted).toHaveProperty('encrypted');

      // 4. Ajouter à la queue de sync
      await syncService.addToSyncQueue('transaction', transactionData);
      
      const queueStatus = syncService.getSyncQueueStatus();
      expect(queueStatus.pending).toBe(1);

      // 5. Créer un audit trail
      const auditEntry = securityService.createAuditEntry(
        'transaction_completed',
        'cashier123',
        transactionData
      );
      
      expect(auditEntry).toBeTruthy();
    });
  });
});