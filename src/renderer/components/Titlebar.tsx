import { memo, useContext } from 'react';
import {
  Box,
  Button,
  styled,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import ButtonBase, { ButtonBaseProps } from '@mui/material/ButtonBase';
import { sendMessageToNode } from '../../main/utils/renProcess';
import { OS_WINDOWS, OS_LINUX, APP_NAME, APP_EDITION, OS_MAC } from '../../config/constants';
import arrowleftIcon from '@iconify/icons-fluent/arrow-left-20-filled';
import minimizeIcon from '@iconify/icons-fluent/minimize-16-regular';
import maximizeIcon from '@iconify/icons-fluent/maximize-16-regular';
import restoreIcon from '@iconify/icons-fluent/square-multiple-16-regular';
import closeIcon from '@iconify/icons-fluent/dismiss-16-regular';
import menuIcon from '@iconify/icons-fluent/line-horizontal-3-20-filled';
import AppIcon from 'svg-react-loader?name=AppIcon!../../img/logo.svg';
import { Icon } from '@iconify/react';
import { store } from '../utils/store';
import MainDrawer from './MainDrawer';

import os from 'os';

interface NavButtonsProps extends ButtonBaseProps {
  closeButton?: boolean;
}

const NavButtons = styled(ButtonBase, {
  shouldForwardProp: prop => prop !== 'closeButton',
})<NavButtonsProps>(({ theme, closeButton }) => ({
  height: '100%',
  width: '46px',
  transition: 'background-color 0.1s ease-in-out',
  cursor: 'default',
  '&:hover': {
    backgroundColor: closeButton
      ? theme.palette.error.main
      : theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
  },
}));

const Titlebar = memo(() => {
  const currOs = os.type();
  const isPhone = useMediaQuery(({ breakpoints }: Theme) => breakpoints.down('md'));
  const theme = useTheme();
  const { state, dispatch } = useContext(store);

  const toggleDrawer = () => {
    dispatch({ type: 'SET_MENU_EXPANDED', payload: !state.isMenuExpanded });
  };

  return (
    <>
      {isPhone && (
        <Drawer
          open={state.isMenuExpanded}
          PaperProps={{
            style: {
              paddingTop: '32px',
              width: '100%',
              maxWidth: 320,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.common.black
                  : theme.palette.common.white,
              overflow: 'hidden',
              borderRight: 'none',
            },
          }}
          onClose={() => dispatch({ type: 'SET_MENU_EXPANDED', payload: false })}
        >
          <MainDrawer tempDrawer />
        </Drawer>
      )}
      <Box
        className={
          currOs === OS_WINDOWS ? 'title-bar title-bar_windows' : 'title-bar title-bar_unix'
        }
        sx={{
          bgcolor: theme.palette.mode === 'light' ? '#f4f1f9' : '#201e23',
          height: '32px',
          pl: currOs === OS_MAC ? 8.5 : 0,
        }}
      >
        <div className="tb-controls">
          {currOs === OS_LINUX && (
            <div className="traffic-light">
              <div onClick={() => sendMessageToNode('closeWindow', null)} className="close-unix">
                close
              </div>
              <div onClick={() => sendMessageToNode('minimize', null)} className="mini-unix">
                minimise
              </div>
              <div onClick={() => sendMessageToNode('maximize', null)} className="res-unix">
                resize
              </div>
            </div>
          )}

          <Stack
            display={'flex'}
            alignItems={'center'}
            direction={'row'}
            sx={{ '-webkit-app-region': 'no-drag' }}
            ml={'0.5rem'}
          >
            <Button sx={{ minWidth: '2.5rem', borderRadius: '0.4rem' }} size="small">
              <Icon icon={arrowleftIcon} height="1.4em" />
            </Button>
            {isPhone && (
              <Button
                onClick={toggleDrawer}
                sx={{ minWidth: '2.5rem', borderRadius: '0.4rem' }}
                size="small"
              >
                <Icon icon={menuIcon} height="1.4em" />
              </Button>
            )}
          </Stack>
        </div>
        <Stack display={'flex'} alignItems={'center'} direction={'row'} spacing={'0.5rem'} ml={1}>
          <AppIcon width={18} height={18} />
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
                  : theme.palette.text.secondary,
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
        <Box flexGrow={1} />
        {currOs === OS_WINDOWS && (
          <Box sx={{ '-webkit-app-region': 'no-drag', height: '100%' }}>
            <NavButtons onClick={() => sendMessageToNode('minimize', null)}>
              <Icon icon={minimizeIcon} />
            </NavButtons>
            <NavButtons onClick={() => sendMessageToNode('maximize', null)}>
              <Icon icon={state.isMaximized ? restoreIcon : maximizeIcon} />
            </NavButtons>
            <NavButtons closeButton onClick={() => sendMessageToNode('closeWindow', null)}>
              <Icon icon={closeIcon} />
            </NavButtons>
          </Box>
        )}
      </Box>
    </>
  );
});

Titlebar.displayName = 'Titlebar';

export default Titlebar;
