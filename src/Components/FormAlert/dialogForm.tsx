import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DialogProps {
    open: boolean;
    onOKClick: () => void;
    nmProduto: string
    estoqueVazio: boolean
}

export default function AlertDialog({ open, onOKClick, nmProduto, estoqueVazio }: DialogProps) {
    return (
        <Dialog open={open}>
            <DialogTitle>Alerta</DialogTitle>
            <DialogContent>
                {estoqueVazio ?
                    <DialogContentText>
                        Produto {nmProduto} está com o estoque vazio. Por favor, Atualize o estoque desse produto antes de continuar.
                    </DialogContentText>
                    :
                    <DialogContentText>
                        Produto {nmProduto} não foi encontrado no Estoque. Por favor, cadastre este produto no estoque antes de continuar.
                    </DialogContentText>

                }
            </DialogContent>
            <DialogActions>
                <Button onClick={onOKClick} autoFocus>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}