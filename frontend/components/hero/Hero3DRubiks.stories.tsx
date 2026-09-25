import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Hero3DRubiks } from './Hero3DRubiks';

const meta: Meta<typeof Hero3DRubiks> = {
  title: '3D/Hero3DRubiks',
  component: Hero3DRubiks,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    showPerf: true,
  }
};

export default meta;
type Story = StoryObj<typeof Hero3DRubiks>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', background: '#09090b' }}>
        <Story />
      </div>
    ),
  ],
};
