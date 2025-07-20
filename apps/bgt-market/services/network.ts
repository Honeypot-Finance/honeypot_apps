import { Network } from '@honeypot/shared';

// Re-export everything from the shared SDK
export { Network, networks, networksMap } from '@honeypot/shared';

export const LiquidityBootstrapPoolFactoryAddress =
  '0xe2957CeAe8d267C493ad41e5CF7BBc274B969711';

class NetworkManager {
  private static instance: NetworkManager;
  private selectedNetwork: Network | null = null;

  private constructor() {}

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  public getSelectedNetwork(): Network | null {
    return this.selectedNetwork;
  }

  public setSelectedNetwork(network: Network): void {
    this.selectedNetwork = network;
  }
}

export default NetworkManager;
