import { Box, Typography, TextField, Button } from '@mui/material'
import React, { useState } from 'react'
import { NewCommentModalProps } from '../models/props/NewCommentModalProps';

export default function NewCommentModal({ ideaTitle, addCommentCallback }: NewCommentModalProps) {
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
    description?: string;
  }

  const [formData, setFormData] = useState<FormValues>({});

  async function submitComment(e: React.SyntheticEvent) {
    if (!formData.description) {
      return;
    }

    e.preventDefault();
    setFormData({});
    addCommentCallback(formData.description);
  }

  function onFormFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add new comment
        </Typography>
        <form onSubmit={submitComment} style={formStyle}>
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
    </>
  )
}
