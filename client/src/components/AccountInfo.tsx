import React, { useState } from 'react'
import { Button } from '@mui/material';
import { AccountInfoProps } from '../models/props/AccountInfoProps';

declare let window: any;

export default function AccountInfo({ provider, connectCallback }: AccountInfoProps) {
  const accountStyle = {
    textAlign: 'right'
  } as const;

  const [address, setAddress] = useState('');

  async function connect() {
    const accounts = await provider?.send("eth_requestAccounts", []);
    setAddress(accounts[0]);
    connectCallback(accounts[0]);

    window.ethereum.on('accountsChanged', function() {
      window.location.reload();
      connectCallback('');
    });
  }

  async function disconnect() {
    setAddress('');
    connectCallback('');
  }

  return (
    <div style={accountStyle}>
      {!!address
        ? <span>{address}<Button onClick={disconnect} variant="outlined">Disconnect</Button></span>
        : <Button onClick={connect} variant="contained">Connect</Button>
      }
    </div>
  )
}
