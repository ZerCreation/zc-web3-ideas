import { ContractNetwork } from "../utils/ContractNetworks";
import { ProviderProps } from "./ProviderProps";

export interface AccountInfoProps extends ProviderProps {
  connectCallback: (address: string, contractNetwork: ContractNetwork | undefined) => void;
}