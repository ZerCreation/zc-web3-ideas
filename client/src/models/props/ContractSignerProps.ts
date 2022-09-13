import { ethers } from "ethers";

export interface ContractSignerProps {
  contractSigner: ethers.Contract | undefined;
  address: string;
}