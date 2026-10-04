import { useState, useEffect } from 'react';
import { storageService } from '../utils/storageService';

/**
 * Custom controller hook for App view states (Splash, Toast, Tabs, Drawer)
 */
export function useAppViewController() {
  // Splash State - Display once per browser session
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('gmao_splash_shown');
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('gmao_splash_shown', 'true');
    } catch {}
  };

  // Toast System State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: 'success' } : prev));
    }, 4500);
  };

  // Persisted Active Tab State
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      return storageService.getItem('gmao_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      if (currentTab) {
        storageService.setItem('gmao_active_tab', currentTab);
      }
    } catch {}
  }, [currentTab]);

  // UI Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return {
    showSplash,
    handleSplashComplete,
    toast,
    setToast,
    showToast,
    currentTab,
    setCurrentTab,
    mobileMenuOpen,
    setMobileMenuOpen,
  };
}
