import { Button } from '@mui/material'
import React from 'react'

export default function IdeasList() {
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
  } as const;
  const listStyle = {
    minHeight: 500,
    border: '1px dashed white',
    margin: '20px 0px'
  };
  const addNewButtonStyle = {
    width: 200,
    float: 'right'
  } as const;

  return (
    <div style={contentStyle}>
      <div style={listStyle}>
        List items
      </div>
      <div>
        <Button style={addNewButtonStyle} variant="contained">Add new Idea</Button>
      </div>
    </div>
  )
}
