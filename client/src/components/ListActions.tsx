import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { ListActionsProps } from '../models/props/ListActionsProps';

export default function ListActions({ contractSigner, address, ipfsClient }: ListActionsProps) {
  const addNewButtonStyle = {
    width: 200,
    float: 'right'
  } as const;
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 620,
    bgcolor: 'black',
    border: '1px solid white',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };
  const formStyle = {
    height: 520,
    display: 'flex',
    marginTop: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  } as const;
  const submitButtonStyle = {
    width: 100,
    float: 'right'
  } as const;

  interface FormValues {
    title?: string;
    description?: string;
}

  const [ideasSigner, setIdeasSigner] = useState<ethers.Contract>();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [formData, setFormData] = useState<FormValues>({});

  useEffect(() => {
    if (contractSigner === undefined) return;
    setIdeasSigner(contractSigner);
  }, [contractSigner]);

  function onFormFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function submitIdea(e: React.SyntheticEvent) {
    if (!formData.title || !formData.description) {
      return;
    }

    e.preventDefault();
    const descriptionFile = await ipfsClient?.add(formData.description);
    await ideasSigner?.createIdea(formData.title, descriptionFile?.path);
    setModalVisibility(false);
    setFormData({});
  }

  return (
    <div>
      <Button
        onClick={() => setModalVisibility(true)}
        disabled={!address}
        style={addNewButtonStyle}
        variant="contained"
      >
        Add new Idea
      </Button>
      <Modal
        open={modalVisibility}
        onClose={() => setModalVisibility(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Describe new idea
          </Typography>
          <form onSubmit={submitIdea} style={formStyle}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={onFormFieldChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={onFormFieldChange}
              required
              multiline
              rows={16}
            />
            <div>
              <Button type="submit" variant="contained" style={submitButtonStyle}>Add</Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  )
}
