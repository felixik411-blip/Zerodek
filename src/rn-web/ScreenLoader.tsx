'use client';

import * as React from 'react';

type ScreenLoaderProps<P extends object> = {
  /** Load the React Native screen module. Called on the client only, which
   * also keeps `useWindowDimensions()` out of SSR (no hydration mismatch). */
  load: () => Promise<{ default: React.ComponentType<P> }>;
  /** Props forwarded to the screen once its module has loaded. */
  screenProps?: P;
  /** Page background behind the loading / error states. */
  backgroundColor?: string;
};

const FONT =
  'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

/**
 * Client-side loader for the React Native hand-off screens.
 *
 * Replaces a bare `next/dynamic` import so that a failed chunk (preview
 * server restarted, flaky proxy, offline moment) surfaces an explicit error
 * card with a Reload / Try again affordance instead of hanging on a silent
 * "Loading screen…" forever — the dead-looking state where "buttons are not
 * clickable".
 */
export default function ScreenLoader<P extends object>({
  load,
  screenProps,
  backgroundColor = '#F7FAFE',
}: ScreenLoaderProps<P>) {
  const [Screen, setScreen] = React.useState<React.ComponentType<P> | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    setFailed(false);
    setTimedOut(false);
    setScreen(null);
    load().then(
      mod => {
        if (alive) setScreen(() => mod.default);
      },
      () => {
        if (alive) setFailed(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [load, attempt]);

  // A rejected import shows the error card immediately, but a request that
  // hangs (proxy stall, half-open connection) never settles — the promise
  // just pends forever. Give up visually after a timeout; if the module
  // still arrives later, the screen below replaces the card (self-healing).
  React.useEffect(() => {
    if (Screen || failed) return;
    const timer = setTimeout(() => setTimedOut(true), 15_000);
    return () => clearTimeout(timer);
  }, [Screen, failed, attempt]);

  const retry = React.useCallback(() => setAttempt(value => value + 1), []);

  if (Screen) {
    // `React.createElement` instead of JSX: generic components in JSX hit
    // TS's `IntrinsicAttributes` check, which an unconstrained (object-bounded)
    // `P` cannot satisfy. createElement types props against `P` directly.
    return React.createElement(Screen, screenProps);
  }

  if (failed || timedOut) {
    return (
      <div
        role="alert"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          backgroundColor,
          fontFamily: FONT,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#FFF1F1',
            color: '#D92D20',
            fontSize: 22,
            lineHeight: '44px',
            fontWeight: 700,
          }}
        >
          !
        </div>
        <div style={{ color: '#172B49', fontSize: 16, fontWeight: 700 }}>
          Screen could not load
        </div>
        <div style={{ color: '#60779A', fontSize: 13, lineHeight: '20px', maxWidth: 380 }}>
          The screen is taking unusually long to load. The preview server may
          have restarted, or a code chunk is stuck on the network. Reload the
          page to reconnect.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              minHeight: 40,
              padding: '0 18px',
              borderRadius: 9,
              border: 'none',
              backgroundColor: '#0878F9',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={retry}
            style={{
              minHeight: 40,
              padding: '0 18px',
              borderRadius: 9,
              border: '1px solid #80B5FF',
              backgroundColor: '#FFFFFF',
              color: '#0878F9',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!Screen) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          color: '#60779A',
          fontSize: 14,
          fontFamily: FONT,
        }}
      >
        Loading screen…
      </div>
    );
  }

  // `React.createElement` instead of JSX: generic components in JSX hit
  // TS's `IntrinsicAttributes` check, which an unconstrained (object-bounded)
  // `P` cannot satisfy. createElement types props against `P` directly.
  return React.createElement(Screen, screenProps);
}
