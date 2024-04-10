import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({ open, toggleDrawer }) {
  return (
    <Box
      component={open ? Paper : 'div'}
      sx={{ borderRadius: 100, display: 'flex', alignItems: 'center', px: 1, mt: 1, mb: 2 }}
    >
      <IconButton sx={{ pl: '10px' }} aria-label="menu" onClick={toggleDrawer}>
        <MenuIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        inputProps={{ 'aria-label': 'search' }}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Box>
  );
}
