import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Common/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <TooltipProvider delayDuration={100}>
          <div className="rounded-lg border border-border bg-card p-6">
            <Story />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    ),
  ],
}