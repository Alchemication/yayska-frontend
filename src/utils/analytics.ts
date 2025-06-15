import { v4 as uuidv4 } from 'uuid';
import { Platform, AppState } from 'react-native';

export interface EventPayload {
  [key: string]: any;
}

export interface AnalyticsEvent {
  event_type: string;
  payload: EventPayload;
  session_id: string;
  source: string;
}

// Map React Native Platform.OS to backend Source enum
const getEventSource = (): string => {
  switch (Platform.OS) {
    case 'web':
      return 'web';
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    default:
      return 'web'; // fallback
  }
};

// Backend API call function type
type SendEventFunction = (event: AnalyticsEvent) => Promise<void>;

// Global reference to the send function (will be set by the API service)
let sendEventToBackend: SendEventFunction = async (event: AnalyticsEvent) => {
  console.log('[Analytics] Event queued (API not ready):', event.event_type);
};

// Function to set the backend sender (called by API service)
export const setEventSender = (sender: SendEventFunction) => {
  sendEventToBackend = sender;
};

export class AnalyticsSession {
  private static currentSessionId: string | null = null;
  private static sessionStartTime: number | null = null;
  private static lastActivityTime: number | null = null;
  private static backgroundTime: number | null = null;

  // Timeouts
  private static readonly BACKGROUND_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
  private static readonly MAX_SESSION_MS = 2 * 60 * 60 * 1000; // 2 hours safety net

  // Generate a new session ID
  static generateNewSession(trigger: string = 'unknown'): string {
    this.currentSessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.backgroundTime = null;

    console.log(
      `[Analytics] New session started: ${this.currentSessionId.substring(
        0,
        8
      )}... (${trigger})`
    );

    // Track session start
    this.trackSessionEvent('SESSION_STARTED', { trigger });

    return this.currentSessionId;
  }

  // Get current session ID (create if none exists)
  static getCurrentSessionId(): string {
    if (!this.currentSessionId) {
      return this.generateNewSession('first_access');
    }
    return this.currentSessionId;
  }

  // Update activity timestamp
  static updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  // Handle app going to background
  static handleAppBackground(): void {
    this.backgroundTime = Date.now();
    console.log('[Analytics] App backgrounded');
  }

  // Handle app coming to foreground
  static handleAppForeground(): string {
    const now = Date.now();

    if (this.backgroundTime) {
      const backgroundDuration = now - this.backgroundTime;

      if (backgroundDuration > this.BACKGROUND_TIMEOUT_MS) {
        // Long absence - start new session
        console.log(
          `[Analytics] Long background (${Math.round(
            backgroundDuration / 60000
          )}min), starting new session`
        );
        return this.generateNewSession('background_return');
      }

      // Short absence - continue existing session
      console.log(
        `[Analytics] Short background (${Math.round(
          backgroundDuration / 60000
        )}min), continuing session`
      );
      this.backgroundTime = null;
      this.updateActivity();
      return this.getCurrentSessionId();
    }

    return this.getCurrentSessionId();
  }

  // Get active session ID with safety checks
  static getActiveSessionId(): string {
    // Check safety net (2 hour max)
    if (this.sessionStartTime) {
      const sessionDuration = Date.now() - this.sessionStartTime;

      if (sessionDuration > this.MAX_SESSION_MS) {
        console.log(
          '[Analytics] Session exceeded 2 hours, starting new session'
        );
        return this.generateNewSession('safety_timeout');
      }
    }

    // Check day boundary
    if (this.isNewDay()) {
      console.log('[Analytics] New day detected, starting new session');
      return this.generateNewSession('new_day');
    }

    this.updateActivity();
    return this.getCurrentSessionId();
  }

  // Check if it's a new day since session started
  private static isNewDay(): boolean {
    if (!this.sessionStartTime) return false;

    const sessionDate = new Date(this.sessionStartTime).toDateString();
    const currentDate = new Date().toDateString();

    return sessionDate !== currentDate;
  }

  // Track session-specific events (internal use)
  private static trackSessionEvent(
    eventType: string,
    payload: EventPayload = {}
  ): void {
    // Don't create infinite loops by calling getActiveSessionId here
    const sessionId = this.currentSessionId || 'unknown';

    const event: AnalyticsEvent = {
      event_type: eventType,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      },
      session_id: sessionId,
      source: getEventSource(),
    };

    // Use the same sending mechanism as the main trackEvent function
    sendEventToBackend(event).catch((error) => {
      console.error('[Analytics] Failed to track session event:', error);
    });
  }

  // Get session info for debugging
  static getSessionInfo() {
    return {
      sessionId: this.currentSessionId?.substring(0, 8) + '...',
      startTime: this.sessionStartTime
        ? new Date(this.sessionStartTime).toLocaleTimeString()
        : null,
      duration: this.sessionStartTime
        ? Math.round((Date.now() - this.sessionStartTime) / 60000)
        : 0,
      isBackgrounded: !!this.backgroundTime,
    };
  }
}

// Main tracking function for the app to use
export const trackEvent = async (
  eventType: string,
  payload: EventPayload = {}
): Promise<void> => {
  const trackingId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();

  try {
    console.log(
      `[Analytics-${trackingId}] 🟡 START trackEvent: "${eventType}" at ${timestamp}`
    );
    console.log(
      `[Analytics-${trackingId}] 📝 Payload:`,
      JSON.stringify(payload, null, 2)
    );

    // Add stack trace to see where this is being called from
    const stack = new Error().stack;
    const callerLine = stack?.split('\n')[2]?.trim() || 'Unknown caller';
    console.log(`[Analytics-${trackingId}] 📍 Called from:`, callerLine);

    const sessionId = AnalyticsSession.getActiveSessionId();
    console.log(
      `[Analytics-${trackingId}] 🔑 Session ID:`,
      sessionId.substring(0, 8) + '...'
    );

    const event: AnalyticsEvent = {
      event_type: eventType,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      },
      session_id: sessionId,
      source: getEventSource(),
    };

    console.log(
      `[Analytics-${trackingId}] 📦 Event created, calling sendEventToBackend...`
    );

    // Send to backend
    await sendEventToBackend(event);

    console.log(
      `[Analytics-${trackingId}] ✅ COMPLETED trackEvent: "${eventType}"`
    );
  } catch (error) {
    console.error(
      `[Analytics-${trackingId}] ❌ FAILED trackEvent: "${eventType}"`,
      error
    );
    // Don't let analytics errors break the app
  }
};

// Initialize analytics system
export const initializeAnalytics = (): (() => void) => {
  console.log('[Analytics] Initializing analytics system');

  // Handle app state changes
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      AnalyticsSession.handleAppForeground();
    } else if (nextAppState === 'background') {
      AnalyticsSession.handleAppBackground();
    }
  };

  // Listen to app state changes
  const subscription = AppState.addEventListener(
    'change',
    handleAppStateChange
  );

  // Initialize first session
  AnalyticsSession.generateNewSession('app_launch');

  // Return cleanup function
  return () => {
    subscription?.remove();
  };
};
