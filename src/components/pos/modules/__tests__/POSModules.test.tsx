import React from 'react';
import ReportsAnalytics from '../ReportsAnalytics';
import HardwareIntegration from '../HardwareIntegration';
import OfflineManager from '../OfflineManager';
import { PWAManager } from '../PWAManager';

// Mock hooks
vi.mock('@/hooks/usePOSData', () => ({
  usePOSData: () => ({
    sessions: [
      { id: '1', terminalId: 'TERM001', startTime: new Date(), endTime: null, cashDrawerStart: 100 }
    ],
    transactions: [
      { id: '1', sessionId: '1', amount: 50, items: [], paymentMethod: 'card', timestamp: new Date() }
    ],
    receipts: [],
    loading: false
  })
}));

// Mock utils
vi.mock('@/utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  exportToCSV: vi.fn()
}));

describe('POS Modules Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ReportsAnalytics', () => {
    it('should render analytics dashboard', () => {
      render(<ReportsAnalytics />);
      expect(screen.getByText('Rapports & Analyses POS')).toBeInTheDocument();
      expect(screen.getByText('Ventes Totales')).toBeInTheDocument();
    });

    it('should handle PDF export', async () => {
      const { exportToPDF } = await import('@/utils/exportUtils');
      render(<ReportsAnalytics />);
      
      const exportButton = screen.getByText('PDF');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(exportToPDF).toHaveBeenCalled();
      });
    });

    it('should handle CSV export', async () => {
      const { exportToCSV } = await import('@/utils/exportUtils');
      render(<ReportsAnalytics />);
      
      const exportButton = screen.getByText('CSV');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalled();
      });
    });
  });

  describe('HardwareIntegration', () => {
    it('should render hardware status', () => {
      render(<HardwareIntegration />);
      expect(screen.getByText('Intégration Matérielle')).toBeInTheDocument();
      expect(screen.getByText('Scanner Code-barres')).toBeInTheDocument();
      expect(screen.getByText('Imprimante Thermique')).toBeInTheDocument();
    });

    it('should handle scanner connection', async () => {
      // Mock WebUSB
      Object.defineProperty(navigator, 'usb', {
        value: {
          requestDevice: vi.fn().mockResolvedValue({
            open: vi.fn(),
            selectConfiguration: vi.fn(),
            claimInterface: vi.fn()
          })
        },
        writable: true
      });

      render(<HardwareIntegration />);
      
      const connectButton = screen.getByText('Connecter Scanner');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(navigator.usb.requestDevice).toHaveBeenCalled();
      });
    });
  });

  describe('OfflineManager', () => {
    it('should render offline status', () => {
      render(<OfflineManager />);
      expect(screen.getByText('Gestion Hors Ligne')).toBeInTheDocument();
    });

    it('should handle sync operation', async () => {
      render(<OfflineManager />);
      
      const syncButton = screen.getByText('Synchroniser');
      fireEvent.click(syncButton);
      
      // Should show sync in progress
      await waitFor(() => {
        expect(screen.getByText('En cours...')).toBeInTheDocument();
      });
    });
  });

  describe('PWAManager', () => {
    it('should render PWA status', () => {
      render(<PWAManager />);
      expect(screen.getByText('Statut PWA & Connectivité')).toBeInTheDocument();
    });

    it('should handle install prompt', () => {
      const mockOnInstall = vi.fn();
      render(<PWAManager onInstallPrompt={mockOnInstall} />);
      
      // Simulate install prompt event
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });
  });
});