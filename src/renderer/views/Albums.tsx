import React from 'react';
import { Box, Paper, Theme, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import PageToolbar from '../components/PageToolbar';

const Albums: React.FC = () => {
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const numberArray = new Array(50).fill(0) as number[];

  return (
    <>
      <PageToolbar title="My Albums" />
      <Grid container spacing={2} xs={12}>
        <Grid xs={12} ml={isPhone ? '1.5rem' : '2rem'}>
          <Box display="flex" flexWrap="wrap">
            {numberArray.map((_, index) => (
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
