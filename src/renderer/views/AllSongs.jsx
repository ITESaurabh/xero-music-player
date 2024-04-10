import React from 'react';
import { Box, Typography, Paper, AppBar, Toolbar, useMediaQuery } from '@mui/material';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

// function HideOnScroll({ children }) {
//   const trigger = useScrollTrigger();
//   console.log(trigger);
//   return (
//     <Slide appear={false} direction="down" in={!trigger}>
//       {children}
//     </Slide>
//   );
// }

const AllSongs = () => {
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  var numberArray = new Array(80).fill(0);
  const trigger1 = useScrollTrigger();
  console.log(trigger1, 'awdaw');
  return (
    <>
      {/* <HideOnScroll {...props}> */}
      <AppBar
        position="sticky"
        color="transparent"
        sx={{ backgroundColor: '#323135' }}
        elevation={0}
      >
        <Toolbar sx={{ py: '1.5rem', px: '2rem' }} disableGutters>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Roboto',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: 'normal',
            }}
          >
            All Songs
          </Typography>
        </Toolbar>
      </AppBar>
      {/* </HideOnScroll> */}
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

export default AllSongs;
