import React, { useState } from 'react'
import { Button } from '@mui/material';
import { AccountInfoProps } from '../models/props/AccountInfoProps';
import { ContractNetworks } from '../models/utils/ContractNetworks';
import WEB3IDEAS from "../contracts/Web3Ideas.json";

declare let window: any;

export default function AccountInfo({ provider, connectCallback }: AccountInfoProps) {
  const accountStyle = {
    textAlign: 'right'
  } as const;

  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState<number | undefined>(undefined);

  async function connect() {
    if (provider === undefined) return;

    window.ethereum.on('accountsChanged', function() {
      window.location.reload();
      connectCallback('', undefined);
    });
    window.ethereum.on('networkChanged', () => {
      window.location.reload();
    });

    const networks = (WEB3IDEAS.networks as ContractNetworks);
    const contractNetwork = networks[provider.network.chainId];
    if (contractNetwork === undefined) {
      alert('This network is not supported. Please change it in your wallet.');
      return;
    }

    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0]);
    connectCallback(accounts[0], contractNetwork);
    setChainId(provider?.network.chainId);
  }

  async function disconnect() {
    setAddress('');
    connectCallback('', undefined);
  }

  return (
    <div style={accountStyle}>
      {!!address
        ? <span>[{address}:{chainId}] <Button onClick={disconnect} variant="outlined">Disconnect</Button></span>
        : <Button onClick={connect} variant="contained">Connect</Button>
      }
    </div>
  )
}
