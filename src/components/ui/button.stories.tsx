import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, CalendarPlus, Mic, MicOff } from 'lucide-react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  parameters: {
    a11y: {
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Link: Story = {
  args: { variant: 'link' },
}

export const Glass: Story = {
  args: { variant: 'glass' },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const Icon: Story = {
  args: { size: 'icon', 'aria-label': 'Toggle microphone' },
  render: (args) => (
    <Button {...args}>
      <Mic className="h-4 w-4" />
    </Button>
  ),
}

export const IconWithLabel: Story = {
  args: { children: 'Join meeting' },
  render: (args) => (
    <Button {...args}>
      <CalendarPlus className="mr-2 h-4 w-4" />
      {args.children}
    </Button>
  ),
}

export const IconOnlyRight: Story = {
  args: { children: 'Continue' },
  render: (args) => (
    <Button {...args}>
      {args.children}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Active: Story = {
  args: { 'aria-pressed': true },
  render: (args) => (
    <Button {...args}>
      <MicOff className="mr-2 h-4 w-4" />
      Muted
    </Button>
  ),
}