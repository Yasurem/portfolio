export type MathFunction = (x: number) => number;

export interface MathEquationDef {
  name: string;
  func: MathFunction;
  derivative: MathFunction;
  range: [number, number];
  color: string;
  showTangent: boolean;
}

export const equations: MathEquationDef[] = [
  {
    name: 'Gradient Descent',
    func: (x) => (x * x) / 10,
    derivative: (x) => x / 5,
    range: [-8, 8],
    color: 'var(--color-primary)',
    showTangent: true
  },
  {
    name: 'Sigmoid',
    func: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const f = 1 / (1 + Math.exp(-x));
      return f * (1 - f);
    },
    range: [-6, 6],
    color: 'var(--color-sand-peach)',
    showTangent: true
  },
  {
    name: 'Tanh',
    func: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.pow(Math.tanh(x), 2),
    range: [-6, 6],
    color: 'var(--color-lofi)',
    showTangent: true
  },
  {
    name: 'ReLU',
    func: (x) => Math.max(0, x),
    derivative: (x) => x > 0 ? 1 : 0,
    range: [-6, 6],
    color: 'var(--color-primary)',
    showTangent: false
  },
  {
    name: 'Swish',
    func: (x) => x / (1 + Math.exp(-x)),
    derivative: (x) => {
      const exp_nx = Math.exp(-x);
      return (1 + exp_nx + x * exp_nx) / Math.pow(1 + exp_nx, 2);
    },
    range: [-6, 6],
    color: 'var(--color-sand-peach)',
    showTangent: true
  },
  {
    name: 'Gaussian',
    func: (x) => 5 * Math.exp(-(x * x) / 8),
    derivative: (x) => 5 * Math.exp(-(x * x) / 8) * (-x / 4),
    range: [-8, 8],
    color: 'var(--color-lofi)',
    showTangent: false
  },
  {
    name: 'Damped Convergence',
    func: (x) => Math.sin(x) * Math.exp(-0.15 * x),
    derivative: (x) => Math.exp(-0.15 * x) * (Math.cos(x) - 0.15 * Math.sin(x)),
    range: [-2, 12],
    color: 'var(--color-primary)',
    showTangent: true
  }
];
