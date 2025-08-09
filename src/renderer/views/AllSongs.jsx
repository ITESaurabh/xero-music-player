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
} from '@mui/material';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import filterIcon from '@iconify/icons-fluent/filter-24-filled';
import { Icon } from '@iconify/react';
import PageToolbar from '../components/PageToolbar';
import { Link } from 'react-router-dom';
import { useIpc } from '../state/ipc';
import { store } from '../utils/store';

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
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
        <Table>
          <TableBody>
            {songs.map((song, index) => (
              <StyledTableRow
                key={song.Id || index}
                onClick={() =>
                  dispatch({
                    type: 'SET_CURR_TRACK',
                    payload: song,
                  })
                }
              >
                <StyledTableCell component="th" scope="row">
                  {song.Title}
                </StyledTableCell>
                <StyledTableCell align="right">{song.ArtistName || ''}</StyledTableCell>
                {!isPhone && (
                  <>
                    <StyledTableCell align="right">
                      <CustomButton component={Link} to="/main_window/artists">
                        {song.AlbumTitle || ''}
                      </CustomButton>
                    </StyledTableCell>
                    <StyledTableCell align="right">{song.Year || ''}</StyledTableCell>
                    <StyledTableCell align="right">{song.GenreName || ''}</StyledTableCell>
                  </>
                )}
                <StyledTableCell align="right">
                  {song.Duration ? song.Duration : ''}
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
