import { AppItem } from '../types';

/**
 * Native Android App Blocker Bridge
 * 
 * Provides communication with native Android OS services (Capacitor / Android Studio)
 * for physical app detection and blocking using Android's AccessibilityService and UsageStatsManager.
 * 
 * When running in standard Web browser / PWA mode, this gracefully operates in Simulated Shield Mode.
 */

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        StudyBlocker?: {
          startBlocking?: (options: { blockedPackages: string[]; activeSubject: string }) => Promise<{ success: boolean }>;
          stopBlocking?: () => Promise<{ success: boolean }>;
          checkAccessibilityPermission?: () => Promise<{ granted: boolean }>;
          openAccessibilitySettings?: () => Promise<void>;
          openUsageAccessSettings?: () => Promise<void>;
          openOverlaySettings?: () => Promise<void>;
        };
      };
    };
  }
}

export const NativeAppBlocker = {
  /**
   * Check if running natively inside Android wrapper (Capacitor APK)
   */
  isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.Capacitor?.isNativePlatform?.();
  },

  /**
   * Start native system-level app blocking on Android device
   */
  async startBlocker(blockedApps: AppItem[], subjectName: string): Promise<boolean> {
    const blockedPackages = blockedApps
      .filter((app) => !app.isAllowed && app.packageName)
      .map((app) => app.packageName);

    if (this.isNativeAndroid() && window.Capacitor?.Plugins?.StudyBlocker?.startBlocking) {
      try {
        const result = await window.Capacitor.Plugins.StudyBlocker.startBlocking({
          blockedPackages,
          activeSubject: subjectName,
        });
        return result.success;
      } catch (err) {
        console.warn('[NativeAppBlocker] Native blocking call failed:', err);
        return false;
      }
    }

    // Web simulation mode
    console.log(`[StudyMode AppShield] Active for subject: ${subjectName}. Restricted packages: ${blockedPackages.length}`);
    return true;
  },

  /**
   * Stop native system-level app blocking
   */
  async stopBlocker(): Promise<boolean> {
    if (this.isNativeAndroid() && window.Capacitor?.Plugins?.StudyBlocker?.stopBlocking) {
      try {
        const result = await window.Capacitor.Plugins.StudyBlocker.stopBlocking();
        return result.success;
      } catch (err) {
        console.warn('[NativeAppBlocker] Native stop blocking failed:', err);
        return false;
      }
    }

    console.log('[StudyMode AppShield] Deactivated.');
    return true;
  },

  /**
   * Open Android System Accessibility Settings
   */
  async openAccessibilitySettings(): Promise<void> {
    if (this.isNativeAndroid() && window.Capacitor?.Plugins?.StudyBlocker?.openAccessibilitySettings) {
      await window.Capacitor.Plugins.StudyBlocker.openAccessibilitySettings();
    }
  },

  /**
   * Open Android System Usage Access Settings
   */
  async openUsageAccessSettings(): Promise<void> {
    if (this.isNativeAndroid() && window.Capacitor?.Plugins?.StudyBlocker?.openUsageAccessSettings) {
      await window.Capacitor.Plugins.StudyBlocker.openUsageAccessSettings();
    }
  },

  /**
   * Open Android Display Over Other Apps (Overlay) Settings
   */
  async openOverlaySettings(): Promise<void> {
    if (this.isNativeAndroid() && window.Capacitor?.Plugins?.StudyBlocker?.openOverlaySettings) {
      await window.Capacitor.Plugins.StudyBlocker.openOverlaySettings();
    }
  },
};
