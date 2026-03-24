export type OHLCData = [number, number, number, number, number];

export type Period =
  | "daily"
  | "weekly"
  | "monthly"
  | "3months"
  | "6months"
  | "yearly"
  | "max";

export interface CandlestickChartProps {
  data?: OHLCData[];
  coinId: string;
  height?: number;
  children?: React.ReactNode;
  initialPeriod?: Period;
}
