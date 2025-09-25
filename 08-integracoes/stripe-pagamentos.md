# 💳 Integração Stripe - Sistema de Pagamentos

## Visão Geral

O MadBoat v3 utiliza Stripe como plataforma de pagamentos principal, implementando um sistema completo de assinaturas, pagamentos únicos e gerenciamento de clientes. A integração segue as melhores práticas de segurança PCI DSS e oferece uma experiência de pagamento sem friction.

## Arquitetura de Pagamentos

### 🏗️ Stack de Pagamentos
```typescript
interface PaymentStack {
  frontend: 'Stripe.js + React Stripe.js';
  backend: 'Stripe SDK + Supabase Edge Functions';
  database: 'PostgreSQL via Supabase';
  security: 'PCI DSS Level 1 + Webhook Signatures';
  currencies: ['USD', 'BRL', 'EUR'];
}
```

### 💰 Produtos e Preços
```typescript
// Stripe Product Configuration
interface MadBoatProducts {
  free_tier: {
    name: 'MadBoat Free';
    description: 'Acesso básico à jornada de descoberta IA';
    features: [
      'Descoberta de perfil IA',
      '1 história pessoal',
      'Identificação de tipo de negócio',
      'Acesso a 3 cards da jornada'
    ];
    price: 0;
    limits: {
      stories: 1;
      ai_interactions: 10;
      export_data: false;
    };
  };

  pro_monthly: {
    name: 'MadBoat Pro Monthly';
    description: 'Acesso completo com IA personalizada';
    stripe_price_id: 'price_pro_monthly_usd';
    features: [
      'Jornada completa de transformação',
      'Histórias ilimitadas',
      'IA personalizada com seus dados',
      'Planos de ação customizados',
      'Análises avançadas',
      'Acesso à comunidade',
      'Suporte prioritário'
    ];
    price: 2999; // $29.99 in cents
    currency: 'usd';
    interval: 'month';
    limits: {
      stories: -1; // unlimited
      ai_interactions: -1; // unlimited
      export_data: true;
    };
  };

  pro_yearly: {
    name: 'MadBoat Pro Yearly';
    description: 'Plano anual com desconto';
    stripe_price_id: 'price_pro_yearly_usd';
    features: ['All Pro features'];
    price: 29999; // $299.99 in cents (2 months free)
    currency: 'usd';
    interval: 'year';
    discount: '17% off';
  };
}
```

## Implementação Frontend

### ⚛️ Stripe Provider Setup
```typescript
// apps/web/src/lib/stripe.ts
import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

// Singleton Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Currency formatting utilities
export const formatPrice = (
  price: number,
  currency: string = 'usd'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(price / 100);
};

export const formatBRLPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price / 100);
};
```

### 💳 Payment Components
```typescript
// apps/web/src/components/payments/CheckoutButton.tsx
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  userId: string;
  planName: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: string) => void;
}

export function CheckoutButton({
  priceId,
  userId,
  planName,
  onSuccess,
  onError
}: CheckoutButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription on the server
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          planName
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm payment with Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?subscription_id=${subscriptionId}`,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Success handled by redirect
      onSuccess?.(subscriptionId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe to ${planName}`
        )}
      </Button>
    </form>
  );
}
```

### 🎯 Pricing Component
```typescript
// apps/web/src/components/payments/PricingCard.tsx
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/stripe';

interface PricingCardProps {
  plan: {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
    popular?: boolean;
    stripeId: string;
  };
  onSelectPlan: (priceId: string) => void;
  isCurrentPlan?: boolean;
}

export function PricingCard({
  plan,
  onSelectPlan,
  isCurrentPlan = false
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border p-6',
        plan.popular
          ? 'border-black shadow-lg scale-105'
          : 'border-gray-200'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-gray-600 mt-2">{plan.description}</p>

        <div className="mt-4">
          <span className="text-4xl font-bold">
            {formatPrice(plan.price, plan.currency)}
          </span>
          <span className="text-gray-600">/{plan.interval}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onSelectPlan(plan.stripeId)}
          >
            {plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Backend Implementation

### 🔧 API Routes (Next.js)
```typescript
// apps/web/src/app/api/stripe/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, planName } = await request.json();

    // Validate user authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    let customerId = await getStripeCustomerId(userId, session.user.email);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    // Store subscription in database
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      plan_name: planName,
      amount: invoice.amount_due,
      currency: invoice.currency,
      interval_type: 'month', // or extract from price
      interval_count: 1,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

async function getStripeCustomerId(userId: string, email: string): Promise<string | null> {
  // Check if customer exists in our database
  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data?.stripe_customer_id || null;
}
```

### 🔄 Webhook Handler
```typescript
// apps/web/src/app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date(),
    });

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  // Update user profile with subscription status
  await updateUserSubscriptionStatus(subscription);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  // Record payment
  await supabase.from('payments').insert({
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_customer_id: invoice.customer as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: `Payment for ${subscription.id}`,
  });

  // Track analytics event
  await supabase.from('timeline_events').insert({
    user_id: await getUserIdFromCustomer(invoice.customer as string),
    event_type: 'payment_succeeded',
    event_category: 'system_event',
    event_data: {
      amount: invoice.amount_paid,
      currency: invoice.currency,
      subscription_id: subscription.id,
    },
  });
}
```

## Subscription Management

### 🔄 Subscription Lifecycle
```typescript
// apps/web/src/lib/subscription.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SubscriptionManager {
  checkAccess: (userId: string, feature: string) => Promise<boolean>;
  getUsage: (userId: string) => Promise<UsageStats>;
  upgradeSubscription: (userId: string, newPriceId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  reactivateSubscription: (subscriptionId: string) => Promise<void>;
}

export class SubscriptionService implements SubscriptionManager {
  private supabase = createClientComponentClient();

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    // Get user's current subscription
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return this.checkFreeAccess(feature);
    }

    return this.checkPremiumAccess(subscription, feature);
  }

  private checkFreeAccess(feature: string): boolean {
    const freeFeatures = [
      'basic_journey',
      'single_story',
      'business_identification',
    ];

    return freeFeatures.includes(feature);
  }

  private checkPremiumAccess(subscription: any, feature: string): boolean {
    // Premium users have access to all features
    return subscription.current_period_end > new Date();
  }

  async getUsage(userId: string): Promise<UsageStats> {
    const [storiesResult, eventsResult] = await Promise.all([
      this.supabase
        .from('stories')
        .select('id, word_count')
        .eq('user_id', userId)
        .eq('status', 'active'),

      this.supabase
        .from('timeline_events')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
    ]);

    return {
      storiesCount: storiesResult.data?.length || 0,
      totalWords: storiesResult.data?.reduce((sum, story) => sum + story.word_count, 0) || 0,
      monthlyInteractions: eventsResult.data?.length || 0,
    };
  }

  async upgradeSubscription(userId: string, newPriceId: string): Promise<void> {
    const response = await fetch('/api/stripe/change-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPriceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  }
}

// Usage hook
export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageStats | null>(null);

  const subscriptionService = useMemo(() => new SubscriptionService(), []);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      fetchCurrentSubscription(userId),
      subscriptionService.getUsage(userId)
    ]).then(([subscriptionData, usageData]) => {
      setSubscription(subscriptionData);
      setUsage(usageData);
      setLoading(false);
    });
  }, [userId, subscriptionService]);

  const hasAccess = useCallback(
    (feature: string) => subscriptionService.checkAccess(userId, feature),
    [userId, subscriptionService]
  );

  return {
    subscription,
    usage,
    loading,
    hasAccess,
    upgrade: (priceId: string) => subscriptionService.upgradeSubscription(userId, priceId),
    cancel: () => subscription && subscriptionService.cancelSubscription(subscription.stripe_subscription_id),
  };
}
```

## Security e Compliance

### 🔒 Security Best Practices
```typescript
// Security utilities
export const securityUtils = {
  // Validate webhook signatures
  validateWebhookSignature: (
    payload: string,
    signature: string,
    secret: string
  ): boolean => {
    try {
      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch {
      return false;
    }
  },

  // Sanitize sensitive data for logging
  sanitizeForLogging: (data: any): any => {
    const sensitive = ['client_secret', 'payment_method', 'card'];
    return Object.keys(data).reduce((acc, key) => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = data[key];
      }
      return acc;
    }, {} as any);
  },

  // Rate limiting for payment endpoints
  createRateLimiter: () => {
    const attempts = new Map();
    return (identifier: string, maxAttempts: number = 5): boolean => {
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes

      if (!attempts.has(identifier)) {
        attempts.set(identifier, []);
      }

      const userAttempts = attempts.get(identifier);
      const recentAttempts = userAttempts.filter(
        (time: number) => now - time < windowMs
      );

      if (recentAttempts.length >= maxAttempts) {
        return false;
      }

      recentAttempts.push(now);
      attempts.set(identifier, recentAttempts);
      return true;
    };
  }
};
```

### 📊 Analytics e Monitoramento
```typescript
// Payment analytics
interface PaymentAnalytics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  subscriptions: {
    active: number;
    cancelled: number;
    churned: number;
    conversion_rate: number;
  };
  payments: {
    success_rate: number;
    failed_payments: number;
    refunds: number;
    disputes: number;
  };
}

export async function getPaymentAnalytics(
  startDate: Date,
  endDate: Date
): Promise<PaymentAnalytics> {
  const [revenue, subscriptions, payments] = await Promise.all([
    getRevenueData(startDate, endDate),
    getSubscriptionData(startDate, endDate),
    getPaymentData(startDate, endDate)
  ]);

  return {
    revenue,
    subscriptions,
    payments
  };
}

// Stripe dashboard integration
export const stripeDashboard = {
  createDashboardSession: async (userId: string) => {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      throw new Error('No subscription found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
    });

    return session.url;
  }
};
```

## Testes

### 🧪 Testing Strategy
```typescript
// Payment testing utilities
export const paymentTestUtils = {
  // Test cards
  testCards: {
    visa: '4242424242424242',
    visaDebit: '4000056655665556',
    mastercard: '5555555555554444',
    declined: '4000000000000002',
    insufficientFunds: '4000000000009995',
    requiresAuth: '4000002500003155'
  },

  // Mock Stripe for tests
  createMockStripe: () => ({
    confirmPayment: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    customers: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    subscriptions: {
      create: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn()
    }
  }),

  // Test subscription scenarios
  createTestSubscription: (overrides = {}) => ({
    id: 'sub_test_123',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
    customer: 'cus_test_123',
    ...overrides
  })
};
```

A integração Stripe do MadBoat v3 oferece uma experiência de pagamento robusta e segura, com suporte completo a assinaturas, gestão de clientes e compliance PCI DSS, proporcionando uma base sólida para monetização da plataforma.