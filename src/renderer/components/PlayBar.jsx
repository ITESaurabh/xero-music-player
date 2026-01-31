import React, { useContext, useRef, useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import { Icon } from '@iconify/react';
import { Card, Hidden, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import DiscordIcon from 'svg-react-loader?name=DiscordIcon!../../img/discord-logo.svg';
import { RepeatRounded, ShuffleRounded } from '@mui/icons-material';
import ShuffleOnRoundedIcon from '@mui/icons-material/ShuffleOnRounded';
import RepeatOneOnRoundedIcon from '@mui/icons-material/RepeatOneOnRounded';
import RepeatOnRoundedIcon from '@mui/icons-material/RepeatOnRounded';
import { store } from '../utils/store';
import { getVolumeLevel, setVolumeLevel } from '../utils/LocStoreUtil';
var jsmediatags = require('jsmediatags');
import speaker132Regular from '@iconify/icons-fluent/speaker-1-32-regular';
import speaker232Regular from '@iconify/icons-fluent/speaker-2-32-regular';
import speakerMute32Filled from '@iconify/icons-fluent/speaker-mute-32-filled';
import Image from 'mui-image';
import { DEFAULT_AA } from '../../config/constants';

const CoverImage = styled(Box)(({ theme }) => ({
  width: 140,
  height: 140,
  margin: 10,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    width: 90,
    height: 90,
  },
}));

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const initialMeta = {
  title: 'Unknown Title',
  artist: 'Unknown Artist',
  album: 'Unknown Album',
  albumArt: DEFAULT_AA,
};

export default function PlayBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [songPath, setSongPath] = useState(null);
  const audioRef = useRef();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [muteVolume, setMuteVolume] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [songMeta, setSongMeta] = useState(initialMeta);
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  const { state, dispatch } = useContext(store);
  let defaultVol = getVolumeLevel();
  const [volume, setVolume] = useState(defaultVol);
  const [lastVolume, setLastVolume] = useState(defaultVol > 0 ? defaultVol : 30);

  useEffect(() => {
    // Only set songPath and paused if queue is ready and track is valid
    if (Array.isArray(state?.queue) && state.queue.length > 0 && state?.track && state?.track.Uri) {
      setSongPath(state.track.Uri);
      setPaused(false);
    } else {
      setSongPath(null);
      setPaused(true);
    }
  }, [state?.track, state?.queue]);

  useEffect(() => {
    // Only interact with audio if queue is ready and track is valid
    if (audioRef.current && songPath && Array.isArray(state?.queue) && state.queue.length > 0) {
      // Convert file path to file:// URL for proper audio loading
      const fileUrl = `file://${songPath.replace(/\\/g, '/')}`;
      audioRef.current.src = fileUrl;
      audioRef.current.volume = defaultVol / 100;
      // Fetch metadata
      jsmediatags.read(songPath, {
        onSuccess: function (tag) {
          const { tags } = tag;
          setSongMeta({
            title: tags.title || initialMeta.title,
            artist: tags.artist || initialMeta.artist,
            album: tags.album || initialMeta.album,
            albumArt:
              tags.picture && tags.picture.data
                ? (() => {
                    const base64String = Buffer.from(tags.picture.data).toString('base64');
                    return `data:image/${tags.picture.type || 'jpg'};base64,${base64String}`;
                  })()
                : DEFAULT_AA,
          });
        },
        onError: function () {
          setSongMeta(initialMeta);
        },
      });
      // Play only after loadedmetadata
      const handleLoadedMetadata = () => {
        if (!paused) {
          audioRef.current.play().catch(() => {});
        }
      };
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      return () => {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [songPath, state?.queue, paused]);

  useEffect(() => {
    if (!songPath) {
      setPosition(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.src = '';
      }
      setSongMeta(initialMeta);
      setPaused(true);
    }
  }, [songPath]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muteVolume ? 0 : volume / 100;
      audioRef.current.muted = muteVolume;
    }
  }, [volume, muteVolume]);

  const handleVolumeChange = (_, value) => {
    setVolume(value);
    setVolumeLevel(value);
    if (value === 0) {
      setMuteVolume(true);
    } else {
      setMuteVolume(false);
      setLastVolume(value);
    }
  };

  const handleMuteClick = () => {
    if (muteVolume) {
      setMuteVolume(false);
      setVolume(lastVolume > 0 ? lastVolume : 30);
      setVolumeLevel(lastVolume > 0 ? lastVolume : 30);
    } else {
      setMuteVolume(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (!isSeeking) setPosition(audio.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef, isSeeking, state?.track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setPosition(0);
        if (state.queue && state.queue.length > 0) {
          if (state.repeatMode === 'one') {
            // Repeat the current track
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else if (state.queueIndex < state.queue.length - 1) {
            dispatch({ type: 'NEXT_TRACK' });
          } else if (state.repeatMode === 'all') {
            dispatch({ type: 'NEXT_TRACK' });
          } else {
            setPaused(true);
          }
        }
      };
    }
  }, [state.queue, state.queueIndex, state.repeatMode, dispatch]);

  const handleShuffle = () => {
    dispatch({ type: 'SET_SHUFFLE', payload: !state.isShuffle });
  };
  const handleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode });
  };

  function formatDuration(value) {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }
  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const lightIconColor =
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  // Long press logic for skip buttons
  const longPressTimeout = useRef();
  const longPressInterval = useRef();
  const handlePrevPress = () => {
    dispatch({ type: 'PREV_TRACK' });
  };
  const handleNextPress = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };
  const handlePrevLongPress = () => {
    handlePrevLongPressAction();
    longPressInterval.current = setInterval(handlePrevLongPressAction, 500);
  };
  const handleNextLongPress = () => {
    handleNextLongPressAction();
    longPressInterval.current = setInterval(handleNextLongPressAction, 500);
  };
  const handlePrevLongPressAction = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      setIsSeeking(false);
    }
  };
  const handleNextLongPressAction = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
      setIsSeeking(false);
    }
  };

  const clearLongPress = callback => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
    if (callback) callback();
  };

  const prevButtonEvents = {
    onMouseDown: () => {
      longPressTimeout.current = setTimeout(handlePrevLongPress, 500);
    },
    onMouseUp: () => {
      clearLongPress(handlePrevPress);
    },
    onMouseLeave: () => {
      clearLongPress();
    },
    onTouchStart: () => {
      longPressTimeout.current = setTimeout(handlePrevLongPress, 500);
    },
    onTouchEnd: () => {
      clearLongPress(handlePrevPress);
    },
  };
  const nextButtonEvents = {
    onMouseDown: () => {
      longPressTimeout.current = setTimeout(handleNextLongPress, 500);
    },
    onMouseUp: () => {
      clearLongPress(handleNextPress);
    },
    onMouseLeave: () => {
      clearLongPress();
    },
    onTouchStart: () => {
      longPressTimeout.current = setTimeout(handleNextLongPress, 500);
    },
    onTouchEnd: () => {
      clearLongPress(handleNextPress);
    },
  };

  if (!state?.track) {
    return null;
  }
  return (
    <Box sx={{ px: isPhone ? 0 : '1.5rem', flex: 1 }}>
      <Grid
        container
        sx={{
          backdropFilter: 'blur(40px)',
          width: '100%',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
        }}
        elevation={3}
        component={Card}
      >
        <Grid xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <CoverImage>
              <Image
                id={songMeta.title}
                src={songMeta.albumArt}
                className="no-select no-drag"
                showLoading
                sx={{
                  borderRadius: '0.4375rem',
                }}
                fit="contain"
              />
            </CoverImage>
            <Box sx={{ ml: 0.5, minWidth: 0, overflow: 'auto' }}>
              <Typography
                variant="h6"
                component="h6"
                noWrap={!isPhone}
                className="no-select no-drag"
              >
                <b>{state?.track?.Title}</b>
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
                noWrap={!isPhone}
                className="no-select no-drag"
              >
                {songMeta.artist}
              </Typography>
              <Typography noWrap={!isPhone} className="no-select no-drag">
                {songMeta.album}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid justifyContent="center" alignContent="center" xs={12} md={5}>
          <Box marginInline={3} mt={isPhone ? 0 : 2}>
            <Slider
              aria-label="time-indicator"
              size="small"
              value={position}
              min={0}
              step={1}
              max={duration}
              onChange={(_, value) => setPosition(value)}
              onChangeCommitted={(_, value) => {
                audioRef.current.currentTime = value;
                setIsSeeking(false);
              }}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={() => setIsSeeking(false)}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-track': {
                  border: 'none',
                },
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                  backgroundColor: theme.palette.text.primary,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${
                      theme.palette.mode === 'dark' ? 'rgb(255 255 255 / 16%)' : 'rgb(0 0 0 / 16%)'
                    }`,
                  },
                  '&.Mui-active': {
                    width: 20,
                    height: 20,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: -2,
              }}
            >
              <TinyText>{formatDuration(position)}</TinyText>
              <TinyText>-{formatDuration(duration - position)}</TinyText>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
              }}
            >
              <IconButton
                aria-label="previous song"
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
                {...prevButtonEvents}
              >
                <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />
              </IconButton>
              <IconButton
                aria-label={paused ? 'play' : 'pause'}
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <PlayArrowRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
                ) : (
                  <PauseRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
                )}
              </IconButton>
              <IconButton
                aria-label="next song"
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
                {...nextButtonEvents}
              >
                <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />
              </IconButton>
            </Box>
            <Stack
              spacing={2}
              direction="row"
              sx={{ mt: 1, mb: isPhone ? 0 : 1, px: 1, width: '60%', marginInline: 'auto' }}
              alignItems="center"
            >
              <IconButton size="small" onClick={handleMuteClick}>
                {volume === 0 || muteVolume ? (
                  <Icon icon={speakerMute32Filled} width={20} />
                ) : volume < 40 ? (
                  <Icon icon={speaker132Regular} width={20} />
                ) : (
                  <Icon icon={speaker232Regular} width={20} />
                )}
              </IconButton>
              <Slider
                aria-label="Volume"
                value={muteVolume ? 0 : volume}
                min={0}
                max={100}
                onChange={handleVolumeChange}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-track': {
                    border: 'none',
                  },
                  transition: 'color 0.2s ease-in-out',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                    backgroundColor: theme.palette.text.primary,
                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                    '&:before': {
                      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                    },
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: `0px 0px 0px 8px ${
                        theme.palette.mode === 'dark'
                          ? 'rgb(255 255 255 / 16%)'
                          : 'rgb(0 0 0 / 16%)'
                      }`,
                    },
                    '&.Mui-active': {
                      width: 16,
                      height: 16,
                    },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.28,
                  },
                }}
              />
              <Typography
                fontSize={'0.75rem'}
                ml={2}
                className="no-select no-drag"
              >{`${volume}%`}</Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid xs={12} md={1} direction="row">
          <Box m={1}>
            <IconButton onClick={handleShuffle} aria-label="shuffle">
              {state.isShuffle ? <ShuffleOnRoundedIcon /> : <ShuffleRounded />}
            </IconButton>
            <IconButton onClick={handleRepeat} aria-label="repeat">
              {state.repeatMode === 'off' ? (
                <RepeatRounded />
              ) : state.repeatMode === 'all' ? (
                <RepeatOnRoundedIcon />
              ) : (
                <RepeatOneOnRoundedIcon />
              )}
            </IconButton>
            <IconButton onClick={() => null} aria-label="discord visibility">
              <DiscordIcon style={{ width: 25, height: 25 }} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Box>
  );
}
