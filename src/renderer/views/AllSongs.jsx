import React from 'react';
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
  console.log(trigger1, 'awdaw');
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
            {Array.from({ length: 50 }).map((item, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell component="th" scope="row">
                  1x1 (feat. Nova Twins)
                </StyledTableCell>
                <StyledTableCell align="right">Bring Me The Horizon & Nova Twins</StyledTableCell>
                {!isPhone && (
                  <>
                    <StyledTableCell align="right">
                      <CustomButton component={Link} to="/main_window/artists">
                        POST HUMAN: SURVIVAL HORROR
                      </CustomButton>
                    </StyledTableCell>
                    <StyledTableCell align="right">2020</StyledTableCell>
                    <StyledTableCell align="right">Rock</StyledTableCell>
                  </>
                )}
                <StyledTableCell align="right">03:29</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
};

export default AllSongs;
