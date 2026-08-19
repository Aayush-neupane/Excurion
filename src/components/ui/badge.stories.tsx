import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}



export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Failed' },
}

export const Success: Story = {
  args: { variant: 'success', children: 'Completed' },
}

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
}

export const Glass: Story = {
  args: { variant: 'glass' },
}