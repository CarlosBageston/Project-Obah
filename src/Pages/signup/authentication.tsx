import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { useTableKeys } from '../../hooks/tableKey';
import { addItem } from '../../hooks/queryFirebase';
import { useDispatch } from 'react-redux';

function Admin() {
    const [registrationLink, setRegistrationLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();

    const handleGenerateLink = async () => {
        const token = uuidv4();
        const expirationTime = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
        await addItem(tableKeys.RegistrationTokens, { token, expirationTime }, dispatch);

        setRegistrationLink(`${window.location.origin}/register?token=${token}`);
        setCopied(false);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <Tooltip title={'Gerar Link de Registro'} sx={{ mr: 2 }}>
                <IconButton onClick={handleGenerateLink}>
                    <AddLinkIcon />
                </IconButton>
            </Tooltip>
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Link de Registro Gerado</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Copie o link abaixo e compartilhe com o novo usuário.
                    </Typography>
                    <TextField
                        value={registrationLink}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="standard"
                        sx={{ marginBottom: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                            {registrationLink}
                        </Typography>
                        <CopyToClipboard text={registrationLink} onCopy={() => setCopied(true)}>
                            <Button
                                variant="text"
                                color="primary"
                                startIcon={<ContentCopyIcon />}
                                sx={{ marginLeft: 1 }}
                            >
                                {copied ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </CopyToClipboard>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Admin;
