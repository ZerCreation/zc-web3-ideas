// @ts-ignore
import { IPFSHTTPClient } from 'ipfs-http-client';
import { ContractSignerProps } from "./ContractSignerProps";

export interface ListActionsProps extends ContractSignerProps {
  ipfsClient: IPFSHTTPClient | undefined;
}