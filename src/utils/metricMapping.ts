import { MetricValues } from '../types/api';
import { formatBytes } from '../components/MetricBar';

interface MetricBarConfig {
  label: string;
  value: number;
  max: number;
  unit: string;
  showBar: boolean;
  formatValue?: (v: number) => string;
}

export function getMetricBarProps(
  metricType: string,
  mv: MetricValues,
): MetricBarConfig | null {
  switch (metricType) {
    case 'CPU_PERCENT':
      return mv.cpu_percent != null
        ? { label: 'CPU', value: mv.cpu_percent, max: 100, unit: '%', showBar: true }
        : null;

    case 'MEMORY_PERCENT':
      return mv.memory_percent != null
        ? { label: 'Memory', value: mv.memory_percent, max: 100, unit: '%', showBar: true }
        : null;

    case 'MEMORY_USAGE':
      return mv.memory_usage != null && mv.memory_limit != null && mv.memory_limit > 0
        ? {
            label: 'Memory (absolute)',
            value: mv.memory_usage,
            max: mv.memory_limit,
            unit: '',
            showBar: true,
            formatValue: (v) => `${formatBytes(v)} / ${formatBytes(mv.memory_limit!)}`,
          }
        : null;

    case 'MEMORY_LIMIT':
      return mv.memory_limit != null
        ? { label: 'Memory Limit', value: mv.memory_limit, max: mv.memory_limit, unit: '', showBar: false, formatValue: formatBytes }
        : null;

    case 'NETWORK_INPUT':
      return mv.network_input != null
        ? { label: 'Network In', value: mv.network_input, max: 0, unit: '', showBar: false, formatValue: formatBytes }
        : null;

    case 'NETWORK_OUTPUT':
      return mv.network_output != null
        ? { label: 'Network Out', value: mv.network_output, max: 0, unit: '', showBar: false, formatValue: formatBytes }
        : null;

    case 'BLOCK_READ':
      return mv.block_read != null
        ? { label: 'Block Read', value: mv.block_read, max: 0, unit: '', showBar: false, formatValue: formatBytes }
        : null;

    case 'BLOCK_WRITE':
      return mv.block_write != null
        ? { label: 'Block Write', value: mv.block_write, max: 0, unit: '', showBar: false, formatValue: formatBytes }
        : null;

    default:
      return null;
  }
}
