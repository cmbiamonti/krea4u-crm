// components/settings/BillingSettings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, Download, Zap, Crown } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function BillingSettings() {
  const [currentPlan ] = useState<'base' | 'premium' | 'premium-plus'>('base');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'base',
      name: 'Base',
      price: 29,
      icon: Zap,
      features: [
        'Up to 100 artists',
        'Up to 10 projects',
        '5 GB storage',
        'Email support',
        'Basic analytics',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 79,
      icon: Crown,
      popular: true,
      features: [
        'Unlimited artists',
        'Unlimited projects',
        '50 GB storage',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access',
      ],
    },
    {
      id: 'premium-plus',
      name: 'Premium+',
      price: 149,
      icon: Crown,
      features: [
        'Everything in Premium',
        'Unlimited storage',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'Team collaboration (up to 10 users)',
        'SLA guarantee',
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
  setIsLoading(true);

  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    
    if (!stripe) throw new Error('Stripe not loaded');

    // TODO: Uncomment when Stripe is configured
    // const { error } = await stripe.redirectToCheckout({ sessionId });
    // if (error) throw error;
    
    console.log('Stripe session created:', sessionId); // Temporary log
    toast.info('Stripe checkout not yet configured');
  } catch (error) {
    toast.error('Failed to process upgrade');
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  const mockInvoices = [
    { id: 'INV-001', date: '2024-01-01', amount: 29, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 29, status: 'paid' },
    { id: 'INV-003', date: '2023-11-01', amount: 29, status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the {plans.find(p => p.id === currentPlan)?.name} plan</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              €{plans.find(p => p.id === currentPlan)?.price}/month
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plans.find(p => p.id === currentPlan)?.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.popular ? 'border-primary shadow-lg' : ''}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <plan.icon className="h-8 w-8 text-primary" />
                  {currentPlan === plan.id && (
                    <Badge>Current Plan</Badge>
                  )}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  €{plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan !== plan.id && (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading}
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {currentPlan === 'base' || plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentPlan)
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/24</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Default</Badge>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">€{invoice.amount}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
          <CardDescription>
            Cancel your subscription. Your account will remain active until the end of the billing period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Cancel Subscription</Button>
        </CardContent>
      </Card>
    </div>
  );
}