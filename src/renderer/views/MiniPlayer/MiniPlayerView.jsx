import React, { useContext, useEffect, useRef, useState } from 'react';
import { useIpc } from '../../state/ipc';
import { Box, Container, IconButton, Slider, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { store } from '../../utils/store';
import { Icon } from '@iconify/react';
import dismiss12Filled from '@iconify/icons-fluent/dismiss-12-filled';
import subtract12Filled from '@iconify/icons-fluent/subtract-12-filled';
import rewind16Filled from '@iconify/icons-fluent/rewind-16-filled';
import play16Filled from '@iconify/icons-fluent/play-16-filled';
import pause16Filled from '@iconify/icons-fluent/pause-16-filled';
import fastForward16Filled from '@iconify/icons-fluent/fast-forward-16-filled';
import speaker132Regular from '@iconify/icons-fluent/speaker-1-32-regular';
import speaker232Regular from '@iconify/icons-fluent/speaker-2-32-regular';
import speakerMute32Filled from '@iconify/icons-fluent/speaker-mute-32-filled';
import { APP_NAME, DEFAULT_AA } from '../../../config/constants';
import Image from 'mui-image';
import { ArrayBuff2ImgBuff } from '../../../main/utils/misc';
import Marquee from 'react-fast-marquee';
import { formatTime } from '../../utils/misc';
import { getVolumeLevel, setVolumeLevel } from '../../utils/LocStoreUtil';
var jsmediatags = require('jsmediatags');

const parseMusic = async musicPath => {
  return await new Promise((resolve, reject) => {
    let music = {
      fileInfo: {
        tagType: '', // ID3 = mp3 || APE = wav || OGG = ogg || FLAC = flac || M4A = m4a
        path: musicPath, // Explicit path
      },
      tags: {
        title: '',
        artist: '',
        album: '',
        track: '',
        genre: '',
        year: '',
        albumArt: '',
      },
    };

    jsmediatags.read(musicPath, {
      onSuccess: function (tag) {
        let { type, tags } = tag;
        // console.log('MUSC:', music, tags);
        music.fileInfo.tagType = type;
        music.tags.title = tags.title;
        music.tags.artist = tags.artist;
        music.tags.album = tags.album;
        music.tags.track = tags.track;
        music.tags.genre = tags.genre;
        music.tags.year = tags.year;
        if (tag && tags.picture && tags.picture.data) {
          tags.picture.type = tags.picture.type ? tags.picture.type.replace(/image\//g, '') : 'jpg';
          const base64Img = ArrayBuff2ImgBuff(tags.picture);
          music.tags.albumArt = String(base64Img);
        }
        resolve(music);
      },
      onError: function (error) {
        reject(error);
      },
    });
  });
};
const maxCharacters = 20;
const initialMeta = {
  title: 'Unknown Title',
  artist: 'Unknown Artist',
  album: 'Unknown Album',
  albumArt: DEFAULT_AA,
};
export default function MiniPlayerView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  let defaultVol = getVolumeLevel();
  const [volume, setVolume] = useState(defaultVol);
  const { state, dispatch } = useContext(store);
  const { path, isPlaying } = state;
  const { sendMessageToMainProcess } = useIpc();
  const [songMeta, setSongMeta] = useState(initialMeta);
  const [position, setPosition] = useState(0);
  const [muteVolume, setMuteVolume] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const audioRef = useRef();
  const progressBarRef = useRef();

  useEffect(() => {
    if (audioRef) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = muteVolume;
    }
  }, [volume, audioRef, muteVolume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const audioElement = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setPosition(audioElement.currentTime);
      }
      if (audioElement.currentTime === audioElement.duration) {
        setPosition(0);
        dispatch({ type: 'SET_IS_PLAYING', payload: false });
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isSeeking, audioRef]);

  const handleSliderChange = (event, newValue) => {
    setPosition(newValue);
  };
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    const audioElement = audioRef.current;
    audioElement.currentTime = newValue;
    setIsSeeking(false);
  };

  useEffect(() => {
    if (path) {
      const audioElement = audioRef.current;
      audioElement.src = path;

      const res = parseMusic(path);

      res
        .then(({ tags }) => {
          console.log(tags);

          if (tags) {
            setSongMeta({
              title: tags.title ? tags.title : initialMeta.title,
              artist: tags.artist ? tags.artist : initialMeta.artist,
              album: tags.album ? tags.album : initialMeta.album,
              albumArt: tags.albumArt ? tags.albumArt : initialMeta.albumArt,
            });
          } else {
            setSongMeta(initialMeta);
          }
        })
        .catch(err => {
          console.log(err);
          setSongMeta(initialMeta);
        });
      dispatch({ type: 'SET_IS_PLAYING', payload: true });
    }
  }, [path]);

  return (
    <Container
      justifyContent="space-between"
      alignItems="center"
      disableGutters
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
      className="play-area"
    >
      <Grid item className="canva">
        <Box
          sx={{
            display: 'flex',
            // backgroundColor: 'red',
            padding: theme.spacing(1, 2),
            justifyContent: 'space-between',
            alignItems: 'center',
            '-webkit-app-region': 'drag',
          }}
        >
          <Typography fontSize={'0.875rem'} color={theme.palette.primary.main} fontWeight={500}>
            {APP_NAME}
          </Typography>
          <Box
            display={'flex'}
            sx={{
              '-webkit-app-region': 'none',
            }}
            gap={'0.6rem'}
          >
            <IconButton
              aria-label="minimize"
              onClick={() => sendMessageToMainProcess('minimize')}
              sx={{
                backgroundColor: isDark ? 'black' : '#d9d9d9',
              }}
            >
              <Icon icon={subtract12Filled} fontSize={12} />
            </IconButton>
            <IconButton
              onClick={() => sendMessageToMainProcess('closeWindow')}
              sx={{
                transition: 'background-color 0.2s ease-in-out',
                ':hover': {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.common.white,
                },
                backgroundColor: isDark ? 'black' : '#d9d9d9',
              }}
              aria-label="close"
            >
              <Icon icon={dismiss12Filled} fontSize={12} />
            </IconButton>
          </Box>
        </Box>
        <Box display={'flex'} alignItems={'center'} paddingX={2} marginBottom={1}>
          <Box sx={{ width: 'inherit' }}>
            <Image
              id={songMeta.album}
              src={songMeta.albumArt}
              className="no-select no-drag"
              height={150}
              width={150}
              showLoading
              sx={{
                borderRadius: '0.4375rem',
              }}
              fit="contain"
            />
          </Box>
          <Box
            sx={{
              ml: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '12.8rem' }}>
              {songMeta.title?.length <= maxCharacters ? (
                <Typography variant="h5" noWrap>
                  {songMeta.title}
                </Typography>
              ) : (
                <Marquee pauseOnHover speed={15} direction="left" delay={5}>
                  <Typography variant="h5" pr={4} noWrap>
                    {songMeta.title}
                  </Typography>
                </Marquee>
              )}
              {songMeta.artist?.length <= 25 ? (
                <Typography variant="body2" color="text.secondary" fontWeight={400} noWrap>
                  {songMeta.artist}
                </Typography>
              ) : (
                <Marquee pauseOnHover speed={15} direction="left" delay={5}>
                  <Typography variant="body2" color="text.secondary" pr={4} fontWeight={400} noWrap>
                    {songMeta.artist}
                  </Typography>
                </Marquee>
              )}
              {songMeta.album?.length <= maxCharacters ? (
                <Typography variant="h6" lineHeight={'inherit'} fontWeight={400} noWrap>
                  {songMeta.album}
                </Typography>
              ) : (
                <Marquee pauseOnHover speed={15} direction="left" delay={5}>
                  <Typography variant="h6" lineHeight={'inherit'} pr={4} fontWeight={400} noWrap>
                    {songMeta.album}
                  </Typography>
                </Marquee>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                mt: 1,
              }}
            >
              <IconButton
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
                onClick={() => {
                  const audioElement = audioRef.current;
                  audioElement.currentTime = audioElement.currentTime - 15;
                  setIsSeeking(false);
                }}
              >
                <Icon icon={rewind16Filled} fontSize={18} />
              </IconButton>
              <IconButton
                onClick={() => dispatch({ type: 'SET_IS_PLAYING', payload: !isPlaying })}
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
              >
                <Icon icon={isPlaying ? pause16Filled : play16Filled} fontSize={30} />
              </IconButton>
              <IconButton
                onClick={() => {
                  const audioElement = audioRef.current;
                  audioElement.currentTime = audioElement.currentTime + 15;
                  setIsSeeking(false);
                }}
                aria-label="next song"
                sx={{ backgroundColor: isDark ? 'black' : '#d9d9d9' }}
              >
                <Icon icon={fastForward16Filled} fontSize={18} />
              </IconButton>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              <Box mr={1} display={'flex'} alignItems={'center'}>
                <IconButton size="small" onClick={() => setMuteVolume(prev => !prev)}>
                  {volume === 0 || muteVolume ? (
                    <Icon icon={speakerMute32Filled} width={20} />
                  ) : volume < 40 ? (
                    <Icon icon={speaker132Regular} width={20} />
                  ) : (
                    <Icon icon={speaker232Regular} width={20} />
                  )}
                </IconButton>
              </Box>
              <Slider
                size="small"
                value={volume}
                min={0}
                max={100}
                onChange={handleVolumeChange}
                onChangeCommitted={(event, newValue) => {
                  setVolumeLevel(newValue);
                }}
                sx={{
                  color:
                    theme.palette.mode === 'dark'
                      ? volume >= 60
                        ? theme.palette.error.main
                        : '#fff'
                      : volume >= 60
                      ? theme.palette.error.main
                      : '#6b6b6b',

                  // '#6b6b6b',
                  '& .MuiSlider-track': {
                    border: 'none',
                  },
                  transition: 'color 0.2s ease-in-out',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
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
              <Typography className="no-select no-drag" fontSize={'0.75rem'} ml={2}>
                {`${volume}%`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid item height={'3rem'} alignItems={'center'} display={'flex'} marginX={2}>
        <Typography className="no-select no-drag" fontSize={'0.75rem'} mr={2}>
          {formatTime(position)}
        </Typography>
        <Slider
          size="small"
          ref={progressBarRef}
          value={position}
          min={0}
          max={audioRef.current?.duration || 0}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderChangeCommitted}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          onTouchStart={() => setIsSeeking(true)}
          onTouchEnd={() => setIsSeeking(false)}
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : '#6b6b6b',
            '& .MuiSlider-track': {
              border: 'none',
            },
            height: 4,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
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
                width: 16,
                height: 16,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
          }}
        />
        <Typography className="no-select no-drag" fontSize={'0.75rem'} ml={2}>
          {formatTime(audioRef.current?.duration)}
        </Typography>
      </Grid>
      <audio id="audio" ref={audioRef} style={{ marginBlock: 15 }}></audio>
    </Container>
  );
}
