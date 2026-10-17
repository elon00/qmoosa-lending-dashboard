export interface MarketData {
  symbol: string;
  supplyApyBps: number;
  borrowApyBps: number;
  totalSuppliedUsd: bigint;
  totalBorrowedUsd: bigint;
  utilizationBps: number;
}

export interface DashboardState {
  connectedWallet: string | null;
  chainId: number;
  totalCollateralUsd: bigint;
  totalDebtUsd: bigint;
  availableBorrowUsd: bigint;
  healthFactor: number; // 10000 = 1.0000
  markets: MarketData[];
}

export class DashboardStore {
  private state: DashboardState;

  constructor() {
    this.state = {
      connectedWallet: null,
      chainId: 31337,
      totalCollateralUsd: 0n,
      totalDebtUsd: 0n,
      availableBorrowUsd: 0n,
      healthFactor: 1_000_000,
      markets: [
        {
          symbol: "ETH",
          supplyApyBps: 320,  // 3.20%
          borrowApyBps: 550,  // 5.50%
          totalSuppliedUsd: 25_000_000n,
          totalBorrowedUsd: 14_000_000n,
          utilizationBps: 5600
        },
        {
          symbol: "USDC",
          supplyApyBps: 510,  // 5.10%
          borrowApyBps: 780,  // 7.80%
          totalSuppliedUsd: 40_000_000n,
          totalBorrowedUsd: 32_000_000n,
          utilizationBps: 8000
        }
      ]
    };
  }

  public getState(): DashboardState {
    return { ...this.state };
  }

  public connectWallet(address: string): void {
    if (!address || address.length < 10) {
      throw new Error("Invalid wallet address");
    }
    this.state.connectedWallet = address;
  }

  public disconnectWallet(): void {
    this.state.connectedWallet = null;
    this.state.totalCollateralUsd = 0n;
    this.state.totalDebtUsd = 0n;
    this.state.healthFactor = 1_000_000;
  }

  public updateAccountTelemetry(collateralUsd: bigint, debtUsd: bigint, hfBps: number): void {
    this.state.totalCollateralUsd = collateralUsd;
    this.state.totalDebtUsd = debtUsd;
    this.state.healthFactor = hfBps;
  }

  public getHealthStatus(): "SAFE" | "MODERATE" | "CRITICAL" | "LIQUIDATABLE" {
    if (this.state.healthFactor < 10_000) return "LIQUIDATABLE";
    if (this.state.healthFactor < 12_000) return "CRITICAL";
    if (this.state.healthFactor < 16_000) return "MODERATE";
    return "SAFE";
  }
}
