import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserAvatar } from './UserAvatar'

const meta: Meta<typeof UserAvatar> = {
  title: 'Common/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  args: {
    name: 'Ada Lovelace',
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof UserAvatar>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/96?img=47',
  },
}

export const Large: Story = {
  args: { className: 'h-16 w-16 text-lg' },
}

export const Small: Story = {
  args: { className: 'h-6 w-6 text-xs' },
}

export const Row: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <UserAvatar name="Ada Lovelace" className="h-10 w-10 ring-2 ring-background" />
      <UserAvatar name="Grace Hopper" className="h-10 w-10 ring-2 ring-background" />
      <UserAvatar name="Alan Turing" className="h-10 w-10 ring-2 ring-background" />
      <UserAvatar name="Katherine Johnson" className="h-10 w-10 ring-2 ring-background" />
      <UserAvatar name="Linus Torvalds" className="h-10 w-10 ring-2 ring-background" />
    </div>
  ),
}