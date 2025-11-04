import { Pool, Position } from '@cryptoalgebra/sdk';

export interface FormattedPosition {
    id: number;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number;
    apr: number;
    position?: Position;
    poolEntity?: Pool;
}