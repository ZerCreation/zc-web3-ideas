import { ethers } from "ethers";
import { ContractSignerProps } from "./ContractSignerProps";

export interface IdeasListProps extends ContractSignerProps {
  provider: ethers.providers.Web3Provider | undefined;
}