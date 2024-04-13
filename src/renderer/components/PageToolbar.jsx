import React from 'react';
import { Typography, AppBar, Toolbar, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

function PageToolbar({ title, action }) {
  const theme = useTheme();
  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#323135' : theme.palette.background.paper,
      }}
      elevation={0}
    >
      <Toolbar sx={{ py: '1.5rem', px: '2rem', justifyContent: 'space-between' }} disableGutters>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 'normal',
          }}
        >
          {title}
        </Typography>
        <>{action ? action : null}</>
      </Toolbar>
    </AppBar>
  );
}

PageToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
};

export default PageToolbar;
