import React, { useEffect, useState } from 'react'
import { ethers } from "ethers";
import { Button } from '@mui/material';

declare let window: any;

export default function AccountInfo() {
  type Web3Provider = ethers.providers.Web3Provider;

  const [provider, setProvider] = useState<Web3Provider>({} as Web3Provider);
  const [address, setAddress] = useState('');

  const accountStyle = {
    textAlign: 'right'
  } as const;

  useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, []);

  async function connect() {
    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0]);
  }

  async function disconnect() {
    setAddress('');
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
