import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

/** Converts a base64url VAPID public key to the Uint8Array the PushManager expects. */
function vapidKeyToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function useNotifications() {
  const { user } = useAuth();

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    Boolean(VAPID_PUBLIC_KEY);

  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as PermissionState;
  });
  const [subscribed, setSubscribed] = useState(false);
  const swReg = useRef<ServiceWorkerRegistration | null>(null);

  // Register SW and check existing subscription whenever a user logs in
  useEffect(() => {
    if (!supported || !user) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        swReg.current = reg;
        return reg.pushManager.getSubscription();
      })
      .then((sub) => setSubscribed(sub !== null))
      .catch(() => {});
  }, [supported, user]);

  /** Request permission and subscribe, storing the subscription in Supabase. */
  const subscribe = useCallback(async () => {
    if (!supported || !user || !VAPID_PUBLIC_KEY) return;

    // Register SW if not already done
    let reg = swReg.current;
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      swReg.current = reg;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm as PermissionState);
    if (perm !== 'granted') return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKeyToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = sub.toJSON();
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      },
      { onConflict: 'endpoint' }
    );

    setSubscribed(true);
  }, [supported, user]);

  /** Remove the subscription from the browser and from Supabase. */
  const unsubscribe = useCallback(async () => {
    if (!user) return;
    const reg = swReg.current ?? (await navigator.serviceWorker.ready);
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    }
    setSubscribed(false);
  }, [user]);

  return { supported, permission, subscribed, subscribe, unsubscribe };
}
