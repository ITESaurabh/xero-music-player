import React from 'react';
import {
  Container,
  Button,
  Accordion,
  Fade,
  AccordionSummary,
  Typography,
  AccordionDetails,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Stack,
} from '@mui/material';
import { Icon } from '@iconify/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageToolbar from '../components/PageToolbar';
import foldersIcon from '@iconify/icons-fluent/folder-24-regular';
import syncIcon from '@iconify/icons-fluent/arrow-sync-24-regular';
import addFolderIcon from '@iconify/icons-fluent/folder-add-24-regular';
import { useIpc } from '../state/ipc';
import { sendMessageToNode } from '../../main/utils/renProcess';

const Settings = () => {
  const [expanded, setExpanded] = React.useState(false);
  const [folders, setFolders] = React.useState([]);
  const { invokeEventToMainProcess } = useIpc();

  React.useEffect(() => {
    invokeEventToMainProcess('get-music-folders')
      .then(setFolders)
      .catch(err => {
        console.error('Error fetching music folders:', err);
      });
    // console.log(sendMessageToNode('get-music-folders'));
  }, []);

  const handleExpansion = () => {
    setExpanded(prevExpanded => !prevExpanded);
  };
  return (
    <>
      <PageToolbar title="Settings" />
      <Container maxWidth="xl">
        <List
          subheader={
            <ListSubheader color="inherit" sx={{ bgcolor: 'inherit' }}>
              Library
            </ListSubheader>
          }
        >
          <ListItem component={Stack} direction="row" spacing={2}>
            <Button
              startIcon={<Icon icon={syncIcon} height={'1.5rem'} />}
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                invokeEventToMainProcess('scan-media')
                  .then((data) => {
                    console.log("Media scan completed:", data);
                    
                    invokeEventToMainProcess('get-music-folders').then(setFolders);
                  })
                  .catch(err => {
                    console.error('Error rescanning media:', err);
                  });
              }}
            >
              Rescan Media
            </Button>
            <Button
              startIcon={<Icon icon={syncIcon} height={'1.5rem'} />}
              variant="outlined"
              color="warning"
              fullWidth
            >
              Full Rescan
            </Button>
          </ListItem>
          <ListItem disableGutters>
            <Accordion
              expanded={expanded}
              slots={{ transition: Fade }}
              slotProps={{ transition: { timeout: 400 } }}
              sx={{
                '& .MuiAccordion-region': { height: expanded ? 'auto' : 0 },
                '& .MuiAccordionDetails-root': { display: expanded ? 'block' : 'none' },
                backgroundColor: 'background.default',
                width: '100%',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon onClick={handleExpansion} />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Box
                  component={Stack}
                  onClick={handleExpansion}
                  alignItems={'center'}
                  direction={'row'}
                  width={'100%'}
                  //   sx={{ backgroundColor: 'red' }}
                >
                  {' '}
                  <ListItemIcon sx={{ mr: -2 }}>
                    <Icon icon={foldersIcon} height={'1.5rem'} />
                  </ListItemIcon>
                  <ListItemText primary="Music Folders" />
                </Box>
                <Button
                  startIcon={<Icon icon={addFolderIcon} height={'1.2rem'} />}
                  variant="contained"
                  disableElevation
                  size="small"
                  fullWidth
                  onClick={() =>
                    invokeEventToMainProcess('add-music-folder')
                      .then(res => {
                        invokeEventToMainProcess('get-music-folders').then(setFolders);
                      })
                      .catch(err => {
                        console.error('Error adding music folder:', err);
                      })
                  }
                  sx={{ mr: 2, maxWidth: 150 }}
                >
                  Add Folder
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                {folders.length === 0 ? (
                  <Typography>No items</Typography>
                ) : (
                  <>
                    {folders.map(folder => (
                      <ListItem
                        key={folder.Id}
                        secondaryAction={
                          <Button
                            color="error"
                            variant="contained"
                            size="small"
                            disableElevation
                            onClick={() => {
                              invokeEventToMainProcess('remove-music-folder', {
                                Id: folder.Id,
                              }).then(() =>
                                invokeEventToMainProcess('get-music-folders').then(setFolders)
                              );
                            }}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText disableGutters primary={folder.Uri} />
                      </ListItem>
                    ))}
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </ListItem>
        </List>
      </Container>
    </>
  );
};

export default Settings;
