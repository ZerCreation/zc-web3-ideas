import { ethers } from "ethers";

export interface ProviderProps {
  provider: ethers.providers.Web3Provider | undefined;
}