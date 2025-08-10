import React, { useContext } from 'react';
import {
  Table,
  Container,
  styled,
  TableCell,
  TableBody,
  TableRow,
  tableCellClasses,
  Button,
  useMediaQuery,
  ButtonBase,
  ListItemButton,
} from '@mui/material';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import filterIcon from '@iconify/icons-fluent/filter-24-filled';
import { Icon } from '@iconify/react';
import PageToolbar from '../components/PageToolbar';
import { Link } from 'react-router-dom';
import { useIpc } from '../state/ipc';
import { store } from '../utils/store';
import { Typography } from '@mui/material';
import { QUERY_KEYS } from '../constants/queryKeys';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const CustomButton = styled(ButtonBase)(({ theme }) => ({
  padding: 5,
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.1s ease-in-out',
  [':hover']: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: selected ? undefined : theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const AllSongs = () => {
  const trigger1 = useScrollTrigger();
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  const [songs, setSongs] = React.useState([]);
  const { invokeEventToMainProcess } = useIpc();
  const { state, dispatch } = useContext(store);

  React.useEffect(() => {
    invokeEventToMainProcess('get-all-songs')
      .then(setSongs)
      .catch(err => console.error('Error fetching songs:', err));
  }, []);

  return (
    <>
      <PageToolbar
        title="All Songs"
        action={
          <Button variant="contained" startIcon={<Icon icon={filterIcon} />}>
            Filter
          </Button>
        }
      />
      <Container maxWidth="xl">
        <Table size="small">
          <TableBody>
            {songs.map((song, index) => (
              <StyledTableRow
                component={ListItemButton}
                key={song.Id || index}
                onClick={() =>
                  dispatch({
                    type: 'SET_CURR_TRACK',
                    payload: song,
                  })
                }
                selected={state.track?.Id === song.Id}
              >
                <StyledTableCell component="th" scope="row">
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 180 }}
                  >
                    {song.Title}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 140 }}
                  >
                    {song.ArtistName || ''}
                  </Typography>
                </StyledTableCell>
                {!isPhone && (
                  <>
                    <StyledTableCell align="right">
                      <CustomButton
                        component={Link}
                        to="/main_window/artists"
                        onClick={e => e.stopPropagation()}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 140 }}
                        >
                          {song.AlbumTitle || ''}
                        </Typography>
                      </CustomButton>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 80 }}
                      >
                        {song.Year || ''}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 100 }}
                      >
                        {song.GenreName || ''}
                      </Typography>
                    </StyledTableCell>
                  </>
                )}
                <StyledTableCell align="right">
                  <Typography
                    noWrap
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 60 }}
                  >
                    {song.Duration ? song.Duration : ''}
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
};

export default AllSongs;
