import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter your email',
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled input', value: 'Disabled' },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <Input id="email" type="email" {...args} />
    </div>
  ),
}

export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Input {...args} />
      <p className="text-xs text-muted-foreground">We will never share your email.</p>
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Search" {...args} />
    </div>
  ),
}

export const Tight: Story = {
  render: (args) => (
    <div className="flex w-80 gap-1">
      <Input placeholder="First name" {...args} />
      <Input placeholder="Last name" {...args} />
    </div>
  ),
}

export const FormRow: Story = {
  render: (args) => (
    <div className="grid w-80 gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="fname">
          Full name
        </label>
        <Input id="fname" placeholder="Ada Lovelace" {...args} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="pw">
          Password
        </label>
        <Input id="pw" type="password" placeholder="••••••••" {...args} />
      </div>
      <Button className="w-full">Sign in</Button>
    </div>
  ),
}