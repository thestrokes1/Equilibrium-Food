// Supabase Edge Function — push-notify
// Called by the admin panel after an order status change.
// Looks up the user's push subscription and sends a Web Push notification.
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   VAPID_PRIVATE_KEY  — base64url raw P-256 private key scalar
//
// Automatically available (Supabase injects these):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import webpush from 'npm:web-push@3';
import { createClient } from 'npm:@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY =
  'VAPID_PUBLIC_KEY_REDACTED';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'confirmed! We\'re preparing it now',
  preparing: 'being prepared',
  on_the_way: 'on its way 🛵',
  delivered: 'delivered! Enjoy your meal 🎉',
  cancelled: 'cancelled',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!vapidPrivateKey) {
      return new Response('VAPID_PRIVATE_KEY not set', { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:admin@equilibrium-food.com',
      VAPID_PUBLIC_KEY,
      vapidPrivateKey,
    );

    const { userId, orderId, status } = await req.json() as {
      userId: string;
      orderId: string;
      status: string;
    };

    if (!userId || !orderId || !status) {
      return new Response('Missing fields', { status: 400, headers: corsHeaders });
    }

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: subs } = await db
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const label = STATUS_LABELS[status] ?? status.replace('_', ' ');
    const payload = JSON.stringify({
      title: 'Order update',
      body: `Your order is ${label}`,
      url: `/orders/${orderId}`,
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;

    // Clean up expired subscriptions (410 Gone from push server)
    const expiredEndpoints = results
      .map((r, i) => (r.status === 'rejected' ? subs[i].endpoint : null))
      .filter(Boolean) as string[];

    if (expiredEndpoints.length) {
      await db
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return new Response(JSON.stringify({ sent, expired: expiredEndpoints.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500, headers: corsHeaders });
  }
});
