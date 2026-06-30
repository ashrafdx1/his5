import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (error: any) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: (err?: any) => void;
  onExpire?: () => void;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
      
      const initializeWidget = () => {
        if (window.turnstile && containerRef.current && !widgetIdRef.current) {
          try {
            const widgetId = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              callback: onVerify,
              'error-callback': onError,
              'expired-callback': onExpire,
              theme: 'dark', // Match our dark premium theme
            });
            widgetIdRef.current = widgetId;
          } catch (e) {
            console.error('Failed to render Turnstile:', e);
            if (onError) onError(e);
          }
        }
      };

      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]');
      if (existingScript) {
        if (window.turnstile) {
          initializeWidget();
        } else {
          // Wait for script load event
          existingScript.addEventListener('load', initializeWidget);
        }
      } else {
        // Load the Turnstile script
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = initializeWidget;
        document.body.appendChild(script);
      }

      return () => {
        // Cleanup widget
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [onVerify, onError, onExpire]);

    return (
      <div 
        ref={containerRef} 
        style={{ 
          minHeight: '65px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '10px 0' 
        }} 
      />
    );
  }
);

Turnstile.displayName = 'Turnstile';
