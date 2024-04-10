import React from 'react';
import { Box, Typography, Paper, AppBar, Toolbar, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
const Albums = () => {
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  var numberArray = new Array(50).fill(0);

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        sx={{ backgroundColor: '#323135' }}
        elevation={0}
      >
        <Toolbar sx={{ py: '2.2rem', px: '2rem' }} disableGutters>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: 'normal',
            }}
          >
            My Albums
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2} xs={12}>
        <Grid xs={12} ml={isPhone ? '1.5rem' : '2rem'}>
          <Box display="flex" flexWrap="wrap">
            {numberArray.map((item, index) => (
              <Box m={0.8} className="lib-art-cont" key={index}>
                <Paper sx={{ height: '150px', width: '160px', backgroundColor: 'black' }}>
                  Art {index}
                </Paper>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Albums;
