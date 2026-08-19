import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConnectionBadge } from './ConnectionBadge'

const meta: Meta<typeof ConnectionBadge> = {
  title: 'Common/ConnectionBadge',
  component: ConnectionBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ConnectionBadge>

export const Excellent: Story = {
  args: { quality: 'excellent' },
}

export const Good: Story = {
  args: { quality: 'good' },
}

export const Fair: Story = {
  args: { quality: 'fair' },
}

export const Poor: Story = {
  args: { quality: 'poor' },
}

export const Compact: Story = {
  args: { quality: 'excellent', compact: true },
}

export const Row: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ConnectionBadge quality="excellent" />
      <ConnectionBadge quality="good" />
      <ConnectionBadge quality="fair" />
      <ConnectionBadge quality="poor" />
    </div>
  ),
}