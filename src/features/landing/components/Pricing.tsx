import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For individual teachers getting started.',
    features: [
      'Up to 20 participants',
      'Unlimited live classes',
      'Infinite whiteboard',
      'Live chat & reactions',
      '48-hour recordings',
    ],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For teachers who need more room to grow.',
    features: [
      'Up to 200 participants',
      'Everything in Free',
      'Screen sharing & spotlight',
      'Raise hand & breakout rooms',
      'Unlimited recording storage',
      'Priority support',
    ],
    cta: 'Go Pro',
    highlighted: true,
  },
  {
    name: 'Schools',
    price: 'Custom',
    period: '',
    description: 'For districts, academies, and universities.',
    features: [
      'Unlimited participants',
      'Everything in Pro',
      'SSO & admin console',
      'Audit logs & compliance',
      'Dedicated success manager',
    ],
    cta: 'Talk to sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing, honest limits.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when your classroom does. Every plan includes the full whiteboard.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-7 transition-colors duration-200 hover:bg-accent/40',
                plan.highlighted
                  ? 'border-primary/60 shadow-sm'
                  : 'border-border',
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-primary/12">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}