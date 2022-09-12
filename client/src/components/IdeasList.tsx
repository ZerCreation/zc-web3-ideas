import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react'
import { Idea } from '../models/props/contract/Idea';
import { IdeasListProps } from '../models/props/IdeasListProps';

export default function IdeasList({ contractSigner }: IdeasListProps) {
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
  } as const;
  const listStyle = {
    minHeight: 500,
    border: '1px dashed white',
    margin: '20px 0px'
  };

  const [ideasSigner, setIdeasSigner] = useState<ethers.Contract>();
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    if (contractSigner === undefined) return;
    setIdeasSigner(contractSigner);

    contractSigner.on('NewIdeaCreated', async function (...args) {
      // if (isOldEvent(args)) return;

      setIdeas(await contractSigner.getAllIdeas());
    });
  }, [contractSigner]);

  return (
    <div style={contentStyle}>
      <div style={listStyle}>
        List items
        <table>
          <tbody>
            {ideas.filter(idea => !!idea.title).map(idea =>
              <tr key={idea.id}>
                <td>{idea.id.toString()} | </td>
                <td>{idea.title} | </td>
                <td>{idea.author}</td>
              </tr>)}
            </tbody>
        </table>
      </div>
    </div>
  )
}
