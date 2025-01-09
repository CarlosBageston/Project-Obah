import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface PagamentoDialogProps {
    open: boolean;
    onClose: () => void;
    setFieldValueExterno: (field: string, value: any) => any;
    onSalvar: () => void;
    dtPagemento: string
}

export const PagamentoDialog: React.FC<PagamentoDialogProps> = ({ open, onClose, onSalvar, setFieldValueExterno, dtPagemento }) => {

    const handleSalvar = () => {
        onSalvar();
        setFieldValueExterno("dtPagamento", '')
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Adicionar Data de Pagamento</DialogTitle>
            <DialogContent>
                <TextField
                    type="date"
                    variant='standard'
                    fullWidth
                    value={dtPagemento}
                    onChange={(e) => setFieldValueExterno("dtPagamento", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancelar</Button>
                <Button onClick={handleSalvar} color="primary">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};
