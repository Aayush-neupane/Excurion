import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarX, Inbox, VideoOff } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState, Spinner } from './LoadingState'

const meta: Meta<typeof EmptyState> = {
  title: 'Common/States',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Empty: Story = {
  args: {
    icon: Inbox,
    title: 'No meetings scheduled',
    description: 'Your upcoming meetings will appear here. Create one to get started.',
  },
}

export const EmptyWithAction: Story = {
  args: {
    icon: CalendarX,
    title: 'Nothing on the calendar',
    description: 'Plan your next session in a few clicks.',
    actionLabel: 'Schedule a meeting',
  },
}

export const EmptyWithChildren: Story = {
  args: {
    icon: VideoOff,
    title: 'Camera is off',
    description: 'Turn on your camera to share video with the class.',
  },
}

export const ErrorStateStory: StoryObj<typeof ErrorState> = {
  name: 'Error state',
  render: (args) => (
    <ErrorState
      {...args}
      title="Could not load meetings"
      description="We hit a snag fetching your schedule. Check your connection and try again."
    />
  ),
}

export const ErrorWithRetryStory: StoryObj<typeof ErrorState> = {
  name: 'Error state with retry',
  render: (args) => (
    <ErrorState {...args} title="Failed to connect" onRetry={() => alert('Retrying…')} />
  ),
}

export const LoadingStateStory: StoryObj<typeof LoadingState> = {
  name: 'Loading state',
  render: () => <LoadingState label="Joining meeting…" />,
}

export const SpinnerStory: StoryObj<typeof Spinner> = {
  name: 'Spinner',
  render: () => (
    <div className="flex h-20 items-center justify-center">
      <Spinner className="h-6 w-6 text-primary" />
    </div>
  ),
}