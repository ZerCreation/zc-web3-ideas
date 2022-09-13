import { Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Idea } from '../models/props/contract/Idea';
import { IdeasListProps } from '../models/props/IdeasListProps';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function IdeasList({ contractSigner, provider, address }: IdeasListProps) {
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
  } as const;
  const listStyle = {
    minHeight: 500,
    border: '1px dashed white',
    margin: '20px 0px'
  };

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasViewItems, setIdeasViewItems] = useState<JSX.Element[]>([]);

  useEffect(() => {
    async function initialize() {
      const startBlockNumber = await provider?.getBlockNumber() ?? 0;
      function isOldEvent(args: any[]) {
        const event = args[args.length - 1];
        if (event.blockNumber <= startBlockNumber) {
          return true;
        }

        return false;
      }

      if (!contractSigner) return;
      setIdeas(await contractSigner.getAllIdeas());

      contractSigner.on('NewIdeaCreated', async function (...args) {
        if (isOldEvent(args)) return;

        console.log('new');
        setIdeas(await contractSigner.getAllIdeas());
      });
    }

    if (!address || !provider) return;
    initialize();
  }, [address, provider, contractSigner]);

  useEffect(() => {
    setIdeasViewItems(ideas.filter(idea => !!idea.title)
      .map(idea => (
        <Accordion key={idea.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id={`panel-header-${idea.id}`}
          >
            <Typography>[{idea.id.toString()}] {idea.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{idea.author}: {idea.descriptionHash}</Typography>
          </AccordionDetails>
        </Accordion>)));
  }, [ideas]);

  return (
    <div style={contentStyle}>
      <div style={listStyle}>
        {ideasViewItems.map(ideaViewItem => ideaViewItem)}
      </div>
    </div>
  )
}
