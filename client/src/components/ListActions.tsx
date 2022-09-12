import { Button } from '@mui/material'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { ListActionsProps } from '../models/props/ListActionsProps';

export default function ListActions({ contractSigner }: ListActionsProps) {
  const addNewButtonStyle = {
    width: 200,
    float: 'right'
  } as const;

  const [ideasSigner, setIdeasSigner] = useState<ethers.Contract>();

  useEffect(() => {
    if (contractSigner === undefined) return;
    setIdeasSigner(contractSigner);
  }, [contractSigner]);

  async function addNewIdea() {
    await ideasSigner?.createIdea('title', 'descHash');
  }

  return (
    <div>
      <Button
        onClick={addNewIdea}
        disabled={!ideasSigner}
        style={addNewButtonStyle}
        variant="contained"
      >Add new Idea</Button>
    </div>
  )
}
