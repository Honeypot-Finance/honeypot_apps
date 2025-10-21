import { Network } from '@honeypot/shared/config/chains/chain';
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
