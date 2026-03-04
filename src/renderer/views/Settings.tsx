import React, { useContext } from 'react';
import {
  Container,
  Button,
  Accordion,
  Fade,
  AccordionSummary,
  CircularProgress,
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
import { store } from '../utils/store';
import { motion } from 'motion/react';

interface MusicFolder {
  Id: string | number;
  Uri: string;
}

const Settings: React.FC = () => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [folders, setFolders] = React.useState<MusicFolder[]>([]);
  const { invokeEventToMainProcess } = useIpc();
  const { state } = useContext(store);
  const { isScanningLibrary } = state;

  React.useEffect(() => {
    invokeEventToMainProcess('get-music-folders')
      .then((data: unknown) => setFolders(data as MusicFolder[]))
      .catch((err: unknown) => {
        console.error('Error fetching music folders:', err);
      });
  }, []);

  const handleExpansion = (): void => {
    setExpanded(prevExpanded => !prevExpanded);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
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
              startIcon={
                isScanningLibrary
                  ? <CircularProgress size={16} color="inherit" />
                  : <Icon icon={syncIcon} height={'1.5rem'} />
              }
              variant="outlined"
              color="primary"
              fullWidth
              disabled={isScanningLibrary}
              onClick={() => {
                invokeEventToMainProcess('scan-media', undefined)
                  .then((data: unknown) => {
                    console.log('Media scan completed:', data);
                    invokeEventToMainProcess('get-music-folders', undefined).then((d: unknown) =>
                      setFolders(d as MusicFolder[])
                    );
                  })
                  .catch((err: unknown) => {
                    console.error('Error rescanning media:', err);
                  });
              }}
            >
              {isScanningLibrary ? 'Scanning…' : 'Rescan Media'}
            </Button>
            <Button
              startIcon={
                isScanningLibrary
                  ? <CircularProgress size={16} color="inherit" />
                  : <Icon icon={syncIcon} height={'1.5rem'} />
              }
              variant="outlined"
              color="warning"
              fullWidth
              disabled={isScanningLibrary}
              onClick={() => {
                invokeEventToMainProcess('full-rescan', undefined)
                  .then((data: unknown) => {
                    console.log('Full rescan completed:', data);
                    invokeEventToMainProcess('get-music-folders', undefined).then((d: unknown) =>
                      setFolders(d as MusicFolder[])
                    );
                  })
                  .catch((err: unknown) => {
                    console.error('Error during full rescan:', err);
                  });
              }}
            >
              {isScanningLibrary ? 'Scanning…' : 'Full Rescan'}
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
                    invokeEventToMainProcess('add-music-folder', undefined)
                      .then(() => {
                        invokeEventToMainProcess('get-music-folders', undefined).then((d: unknown) =>
                          setFolders(d as MusicFolder[])
                        );
                      })
                      .catch((err: unknown) => {
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
                                invokeEventToMainProcess('get-music-folders', undefined).then((d: unknown) =>
                                  setFolders(d as MusicFolder[])
                                )
                              );
                            }}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText primary={folder.Uri} />
                      </ListItem>
                    ))}
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </ListItem>
        </List>
      </Container>
    </motion.div>
  );
};

export default Settings;
