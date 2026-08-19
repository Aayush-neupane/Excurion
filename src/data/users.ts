import type { User } from '@/types/user'

export const mockUsers: User[] = [
  {
    id: 'u-1',
    name: 'Ava Thompson',
    email: 'ava@excurion.app',
    role: 'teacher',
    title: 'Senior Mathematics Instructor',
    timezone: 'America/New_York',
    bio: 'Teaching calculus with a focus on intuition. 12 years of experience across high school and university levels.',
    createdAt: '2024-09-02T08:00:00.000Z',
  },
  {
    id: 'u-2',
    name: 'Marcus Chen',
    email: 'marcus@excurion.app',
    role: 'teacher',
    title: 'Physics & Astronomy Lecturer',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-10-14T08:00:00.000Z',
  },
  {
    id: 'u-3',
    name: 'Sofia Reyes',
    email: 'sofia@excurion.app',
    role: 'student',
    title: 'Grade 11 Student',
    timezone: 'Europe/Madrid',
    createdAt: '2025-01-09T08:00:00.000Z',
  },
  {
    id: 'u-4',
    name: 'Liam O’Connor',
    email: 'liam@excurion.app',
    role: 'student',
    title: 'Undergraduate, Computer Science',
    timezone: 'Europe/Dublin',
    createdAt: '2025-02-21T08:00:00.000Z',
  },
  {
    id: 'u-5',
    name: 'Priya Sharma',
    email: 'priya@excurion.app',
    role: 'student',
    title: 'Grade 12 Student',
    timezone: 'Asia/Kolkata',
    createdAt: '2025-03-02T08:00:00.000Z',
  },
  {
    id: 'u-6',
    name: 'Noah Williams',
    email: 'noah@excurion.app',
    role: 'student',
    title: 'Graduate Student, Data Science',
    timezone: 'America/Chicago',
    createdAt: '2025-04-18T08:00:00.000Z',
  },
  {
    id: 'u-7',
    name: 'Emma Laurent',
    email: 'emma@excurion.app',
    role: 'student',
    title: 'Grade 10 Student',
    timezone: 'Europe/Paris',
    createdAt: '2025-05-11T08:00:00.000Z',
  },
  {
    id: 'u-8',
    name: 'Ethan Park',
    email: 'ethan@excurion.app',
    role: 'student',
    title: 'Undergraduate, Biology',
    timezone: 'Asia/Seoul',
    createdAt: '2025-06-25T08:00:00.000Z',
  },
  {
    id: 'u-9',
    name: 'Maya Patel',
    email: 'maya@excurion.app',
    role: 'teacher',
    title: 'Chemistry Instructor',
    timezone: 'Asia/Kolkata',
    createdAt: '2024-11-30T08:00:00.000Z',
  },
  {
    id: 'u-10',
    name: 'Lucas Meyer',
    email: 'lucas@excurion.app',
    role: 'student',
    title: 'Grade 11 Student',
    timezone: 'Europe/Berlin',
    createdAt: '2025-07-07T08:00:00.000Z',
  },
]

export const currentUser: User = mockUsers[0]!

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

export function getDisplayName(id: string): string {
  return getUserById(id)?.name ?? 'Guest'
}