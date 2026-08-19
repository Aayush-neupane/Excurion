import type { User } from '@/types/user'

export const mockUsers: User[] = [
  {
    id: 'u-1',
    name: 'Tony Stark',
    email: 'tony@excurion.app',
    role: 'teacher',
    title: 'Senior Mathematics Instructor',
    timezone: 'America/New_York',
    bio: 'Teaching calculus with a focus on intuition. 12 years of experience across high school and university levels.',
    createdAt: '2024-09-02T08:00:00.000Z',
  },
  {
    id: 'u-2',
    name: 'Stephen Strange',
    email: 'stephen@excurion.app',
    role: 'teacher',
    title: 'Physics & Astronomy Lecturer',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-10-14T08:00:00.000Z',
  },
  {
    id: 'u-3',
    name: 'Peter Parker',
    email: 'peter@excurion.app',
    role: 'student',
    title: 'Grade 11 Student',
    timezone: 'Europe/Madrid',
    createdAt: '2025-01-09T08:00:00.000Z',
  },
  {
    id: 'u-4',
    name: 'Bruce Banner',
    email: 'bruce@excurion.app',
    role: 'student',
    title: 'Undergraduate, Computer Science',
    timezone: 'Europe/Dublin',
    createdAt: '2025-02-21T08:00:00.000Z',
  },
  {
    id: 'u-5',
    name: 'Natasha Romanoff',
    email: 'natasha@excurion.app',
    role: 'student',
    title: 'Grade 12 Student',
    timezone: 'Asia/Kolkata',
    createdAt: '2025-03-02T08:00:00.000Z',
  },
  {
    id: 'u-6',
    name: 'Wanda Maximoff',
    email: 'wanda@excurion.app',
    role: 'student',
    title: 'Graduate Student, Data Science',
    timezone: 'America/Chicago',
    createdAt: '2025-04-18T08:00:00.000Z',
  },
  {
    id: 'u-7',
    name: 'Carol Danvers',
    email: 'carol@excurion.app',
    role: 'student',
    title: 'Grade 10 Student',
    timezone: 'Europe/Paris',
    createdAt: '2025-05-11T08:00:00.000Z',
  },
  {
    id: 'u-8',
    name: 'Steve Rogers',
    email: 'steve@excurion.app',
    role: 'student',
    title: 'Undergraduate, Biology',
    timezone: 'Asia/Seoul',
    createdAt: '2025-06-25T08:00:00.000Z',
  },
  {
    id: 'u-9',
    name: 'Shuri',
    email: 'shuri@excurion.app',
    role: 'teacher',
    title: 'Chemistry Instructor',
    timezone: 'Asia/Kolkata',
    createdAt: '2024-11-30T08:00:00.000Z',
  },
  {
    id: 'u-10',
    name: 'Clint Barton',
    email: 'clint@excurion.app',
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