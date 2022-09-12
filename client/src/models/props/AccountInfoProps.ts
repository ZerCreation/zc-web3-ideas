import { ProviderProps } from "./ProviderProps";

export interface AccountInfoProps extends ProviderProps {
  connectCallback: (address: string) => void;
}