import type { AppNotification } from '@/types/notification'

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()
const hoursAgo = (h: number) => minutesAgo(h * 60)
const daysAgo = (d: number) => hoursAgo(d * 24)

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'meeting',
    title: 'Meeting started',
    body: '“Calculus II — Derivatives Review” is now live.',
    read: false,
    createdAt: minutesAgo(42),
    link: '/meeting/m-1',
  },
  {
    id: 'n-2',
    kind: 'reminder',
    title: 'Upcoming class',
    body: '“Physics — Newton’s Laws Lab” starts in 2 hours.',
    read: false,
    createdAt: minutesAgo(60),
    link: '/meeting/m-2',
  },
  {
    id: 'n-3',
    kind: 'chat',
    title: 'New message from Sofia',
    body: 'Sofia Reyes: “For problem 3, do we use the product rule first?”',
    read: false,
    createdAt: minutesAgo(9),
  },
  {
    id: 'n-4',
    kind: 'recording',
    title: 'Recording ready',
    body: '“Chemistry — Periodic Trends” recording is available to review.',
    read: false,
    createdAt: hoursAgo(4),
    link: '/recordings/m-4',
  },
  {
    id: 'n-5',
    kind: 'system',
    title: 'Weekly report',
    body: 'Your teaching report for the past week is ready.',
    read: true,
    createdAt: daysAgo(1),
  },
  {
    id: 'n-6',
    kind: 'warning',
    title: 'Connection quality',
    body: 'Ethan Park is experiencing a weak connection in your class.',
    read: true,
    createdAt: hoursAgo(9),
  },
  {
    id: 'n-7',
    kind: 'reminder',
    title: 'Office hours',
    body: '“Office Hours — Algebra Support” is scheduled for today at 5:00 PM.',
    read: true,
    createdAt: hoursAgo(12),
    link: '/meeting/m-3',
  },
  {
    id: 'n-8',
    kind: 'meeting',
    title: 'New participant',
    body: 'Lucas Meyer joined “Physics — Newton’s Laws Lab”.',
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'n-9',
    kind: 'system',
    title: 'Welcome to Excurion!',
    body: 'Explore your dashboard and create your first class.',
    read: true,
    createdAt: daysAgo(30),
  },
]