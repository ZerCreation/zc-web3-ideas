import { Accordion, AccordionSummary, Typography, AccordionDetails, Button, Tooltip, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Idea } from '../models/contract/Idea';
import { IdeasListProps } from '../models/props/IdeasListProps';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/CheckBox';
import CancelIcon from '@mui/icons-material/CloseRounded';
import PendingIcon from '@mui/icons-material/Pending';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import { VoteResult } from '../models/contract/VoteResult';
import { ethers } from 'ethers';
import NewCommentModal from './NewCommentModal';

export default function IdeasList({ contractSigner, provider, address, ipfsClient }: IdeasListProps) {
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
  const [modalVisibility, setModalVisibility] = useState(false);
  const [ideaUnderComment, setIdeaUnderComment] = useState<Idea>();

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
      await fetchAllIdeas(contractSigner);

      contractSigner.on('NewIdeaCreated', async function (...args) {
        if (isOldEvent(args)) return;

        await fetchAllIdeas(contractSigner);
      });

      contractSigner.on('IdeaDeleted', async function (...args) {
        if (isOldEvent(args)) return;

        await fetchAllIdeas(contractSigner);
      });

      contractSigner.on('UserVotePerformed', async function (...args) {
        if (isOldEvent(args)) return;

        await fetchAllIdeas(contractSigner);
      });

      contractSigner.on("CommentAdded", async function (...args) {
        if (isOldEvent(args)) return;

        await fetchAllIdeas(contractSigner);
      });

      async function fetchAllIdeas(contractSigner: ethers.Contract) {
        const allIdeas = await contractSigner.getAllIdeas();
        const allIdeasDecoded: Idea[] = [];
        for await (const idea of allIdeas.filter((idea: Idea) => !!idea.title)) {
          const ideaComments = [];
          for await (const comment of idea.comments) {
            if (!comment.descriptionHash) continue;
            ideaComments.push({
              ...comment,
              description: await decodeIpfsText(comment.descriptionHash)
            });
          }

          allIdeasDecoded.push({
            ...idea,
            description: await decodeIpfsText(idea.descriptionHash),
            comments: ideaComments
          });
        }
        setIdeas(allIdeasDecoded);
      }

      async function decodeIpfsText(hash: string) {
        if (ipfsClient == null) return null;
  
        const catResults = ipfsClient.cat(hash);
        for await (const item of catResults) {
          return String.fromCharCode.apply(null, item as unknown as number[]);
        }
      }
    }

    if (!address || !provider) return;
    initialize();
  }, [address, provider, contractSigner, ipfsClient]);

  useEffect(() => {
    setIdeasViewItems(
      ideas.map(idea => (
        <Accordion key={idea.id} style={{ padding: '0px 5px' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id={`panel-header-${idea.id}`}
          >
            <Typography style={{ minWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <span style={{ marginRight: 20 }}>
                    {showUserVoteResult(idea.userVote, idea.canVoteForIdea)}
                  </span>
                  [{idea.id.toString()}] {idea.title}
                </span>
                <div>
                  <span style={{ lineHeight: 2.5 }}>({showCutAddress(idea.author)})</span>
                </div>
              </div>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0px 20px', lineHeight: 2.5 }}>
              <div style={{ textAlign: 'left' }}>
                <Typography>Date: {formatDate(idea.createdOn)}</Typography>
                <Typography>Author: {idea.author}</Typography>
                <Typography>
                  {idea.approvedCount.toString()}<CheckIcon style={{ fontSize: 20, marginBottom: -5 }} />
                  &nbsp;/&nbsp;
                  {idea.rejectedCount.toString()}<CancelIcon style={{ fontSize: 20, marginBottom: -5 }} />
                </Typography>
                <Typography>Description: {idea.description}</Typography>
                <Typography>
                  Comments:
                  {!!idea.comments
                    ? <ul>{idea.comments.filter(comment => !!comment.descriptionHash).map((comment, idx) =>
                      <li key={idx}>
                        {comment.description}
                        | {comment.author}
                        | {new Date(+ethers.utils.formatUnits(comment.createdOn, 0) * 1000).toLocaleString()}
                        <Button
                          onClick={() => deleteComment(comment.id)}
                          variant='outlined'
                          color='error'
                        >
                          <DeleteIcon />
                        </Button>
                      </li>
                    )}</ul>
                    : null
                  }
                </Typography>
              </div>
              <div>
                {/* <Button disabled={!idea.canChange} variant='outlined'><EditIcon /></Button> */}
                <Button variant='outlined' onClick={() => showCommentModal(idea)}><AddIcon /> Add comment</Button>
                <Button
                  onClick={() => deleteIdea(idea.id, idea.descriptionHash)}
                  disabled={!idea.canChange}
                  variant='outlined'
                  color='error'
                  style={{ marginLeft: 10 }}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 30 }}>
              <Button disabled={!idea.canVoteForIdea} variant='outlined' color='error' onClick={() => rejectIdea(idea.id)}>Vote against</Button>
              <Button disabled={!idea.canVoteForIdea} variant='outlined' color='success' onClick={() => approveIdea(idea.id)}>Vote for</Button>
            </div>
          </AccordionDetails>
        </Accordion>)));

    function formatDate(date: number): React.ReactNode {
      return new Date(+ethers.utils.formatUnits(date, 0) * 1000).toLocaleString();
    }

    function showUserVoteResult(userVoteResult: VoteResult, canUserVote: boolean) {
      if (!canUserVote) {
        return <Tooltip title="Your idea" placement="top-start"><ArrowIcon /></Tooltip>;
      }

      switch (userVoteResult) {
        case VoteResult.Pending:
          return <Tooltip title="Idea vote Pending for you" placement="top-start"><PendingIcon /></Tooltip>;
        case VoteResult.Approved:
          return <Tooltip title="Idea Approved by you" placement="top-start"><CheckIcon color='success' /></Tooltip>;
        case VoteResult.Rejected:
          return <Tooltip title="Idea Rejected by you" placement="top-start"><CancelIcon color='error' /></Tooltip>;
        default:
          return null;
      }
    }

    async function approveIdea(ideaId: number) {
      await voteForIdea(ideaId, 1);
    }

    async function rejectIdea(ideaId: number) {
      await voteForIdea(ideaId, 2);
    }

    async function voteForIdea(ideaId: number, voteResult: number) {
      sendTransaction(async () => await contractSigner?.voteForIdea(ideaId, voteResult));
    }

    async function deleteIdea(ideaId: number, descriptionHash: string) {
      if (ipfsClient == null) return null;

      await ipfsClient.pin.rm(descriptionHash);
      sendTransaction(async () => await contractSigner?.deleteIdea(ideaId));
    }

    async function sendTransaction(func: (() => void)) {
      try {
        await func();
      } catch (error: any) {
        alert(!!error.data ? error.data.message : error.message);
      }
    }

    function showCutAddress(address: string): React.ReactNode {
      return address.slice(0, 4) + '...' + address.slice(38);
    }

    async function deleteComment(commentId: number) {
      // sendTransaction(async () => await contractSigner?.deleteComment(commentId));
    }
  }, [ideas, contractSigner]);

  function showCommentModal(idea: Idea) {
    setIdeaUnderComment(idea);
    setModalVisibility(true);
  }

  async function onAddCommentCallback(description: string) {
    if (!ipfsClient) return;
    setModalVisibility(false);

    const descriptionFile = await ipfsClient.add(description);
    await contractSigner?.addComment(ideaUnderComment?.id, descriptionFile?.path);
    setModalVisibility(false);
  }

  return (
    <div style={contentStyle}>
      <div style={listStyle}>
        {ideasViewItems.map(ideaViewItem => ideaViewItem)}
      </div>

      <Modal
        open={modalVisibility}
        onClose={() => setModalVisibility(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <NewCommentModal ideaTitle={ideaUnderComment?.title} addCommentCallback={onAddCommentCallback} />
      </Modal>
    </div>
  )
}
