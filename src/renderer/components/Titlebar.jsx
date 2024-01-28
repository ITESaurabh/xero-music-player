import React from 'react';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { AppBar, Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { sendMessageToNode } from '../../main/utils/renProcess';
import { useNavigate } from 'react-router-dom';
import {
  OS_WINDOWS,
  OS_MAC,
  OS_LINUX,
  APP_NAME,
  APP_VERSION,
  APP_EDITION,
} from '../../config/constants';
import Image from 'mui-image';
// import { ReactComponent as Logo } from '../../assets/logo/logo.svg';
import arrowleftIcon from '@iconify/icons-fluent/arrow-left-20-filled';
import menuIcon from '@iconify/icons-fluent/line-horizontal-3-20-filled';
import AppIcon from 'svg-react-loader?name=AppIcon!../../assets/logo/logo.svg';
import { Icon } from '@iconify/react';
const os = require('os');

const Titlebar = () => {
  const currOs = os.type();
  const navigate = useNavigate();
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  const theme = useTheme();
  console.log(theme.palette.mode);
  return (
    <>
      <Box
        className={
          currOs === OS_WINDOWS ? 'title-bar title-bar_windows' : 'title-bar title-bar_unix'
        }
        sx={{ bgcolor: theme.palette.mode === 'light' ? '#f4f1f9' : '#201e23', height: '32px' }}
      >
        <div className="tb-controls">
          {currOs === OS_LINUX && (
            <div className="traffic-light">
              <div onClick={() => sendMessageToNode('closeWindow')} className="close-unix">
                close
              </div>
              <div onClick={() => sendMessageToNode('minimize')} className="mini-unix">
                minimise
              </div>
              <div onClick={() => sendMessageToNode('maximize')} className="res-unix">
                resize
              </div>
            </div>
          )}

          <Stack
            display={'flex'}
            alignItems={'center'}
            direction={'row'}
            sx={{ '-webkit-app-region': 'no-drag' }}
            // spacing={'0.75rem'}
            ml={'0.5rem'}
          >
            <Button sx={{ minWidth: '2rem', borderRadius: '0.4rem' }} size="small">
              <Icon icon={arrowleftIcon} height="1.2em" />
            </Button>
            {isPhone && (
              <Button sx={{ minWidth: '2rem', borderRadius: '0.4rem' }} size="small">
                <Icon icon={menuIcon} height="1.2em" />
              </Button>
            )}
          </Stack>
        </div>
        <Stack display={'flex'} alignItems={'center'} direction={'row'} spacing={'0.5rem'} ml={1}>
          <AppIcon />
          <Typography
            sx={{
              color:
                theme.palette.mode === 'light'
                  ? 'var(--M3-sys-light-primary, #9B2E99)'
                  : 'var(--M3-sys-dark-primary, #FFAAF4)',
              fontFamily: 'Roboto',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: 'normal',
            }}
          >
            {APP_NAME}
          </Typography>
          <Typography
            sx={{
              color:
                theme.palette.mode === 'light'
                  ? 'var(--Light-Fill-Color-Text-Secondary, rgba(0, 0, 0, 0.61))'
                  : theme.palette.text,
              fontFamily: 'Roboto',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '16px',
            }}
          >
            {APP_EDITION}
          </Typography>
        </Stack>
      </Box>
    </>
  );
  //   return (
  //     <>
  //       <Box
  //         className={
  //           currOs === OS_WINDOWS ? 'title-bar title-bar_windows' : 'title-bar title-bar_unix'
  //         }
  //         sx={{ bgcolor: '#f4f1f9' }}
  //       >
  //         <div className="tb-controls">
  //           {currOs === OS_LINUX && (
  //             <div className="traffic-light">
  //               <div onClick={() => sendMessageToNode('closeWindow')} className="close-unix">
  //                 close
  //               </div>
  //               <div onClick={() => sendMessageToNode('minimize')} className="mini-unix">
  //                 minimise
  //               </div>
  //               <div onClick={() => sendMessageToNode('maximize')} className="res-unix">
  //                 resize
  //               </div>
  //             </div>
  //           )}
  //           <Box
  //             className={currOs === OS_MAC ? 'mac_back' : 'tb-cntrl_windows'}
  //             sx={{ visibility: window.history.length === 1 ? 'hidden' : 'inherit' }}
  //             onClick={() => navigate(-1)}
  //           >
  //             <Button
  //               color={currOs === OS_MAC || currOs === OS_LINUX ? 'primary' : 'inherit'}
  //               sx={{ minWidth: currOs === OS_MAC || currOs === OS_LINUX ? 'inherit' : null }}
  //               variant={currOs === OS_MAC || currOs === OS_LINUX ? 'contained' : 'text'}
  //             >
  //               {currOs === OS_MAC || currOs === OS_LINUX ? (
  //                 <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 15 }} />
  //               ) : (
  //                 <ArrowBackOutlinedIcon sx={{ fontSize: 20 }} />
  //               )}
  //             </Button>
  //           </Box>
  //         </div>
  //       </Box>
  //     </>
  //   );
};

export default Titlebar;
