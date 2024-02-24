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
    nmProduto: string | undefined
}

/**
 * Componente de diálogo de alerta para informar sobre estoque vazio de determinados produtos.
 *
 * @component
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.open - Indica se o diálogo está aberto ou fechado.
 * @param {Function} props.onOKClick - Função a ser executada ao clicar no botão "OK".
 * @param {string | undefined} props.nmProduto - Nome do produto para o qual o estoque está vazio.
 * @returns {JSX.Element} - Elemento JSX representando o componente de diálogo de alerta.
 */

export default function AlertDialog({ open, onOKClick, nmProduto }: DialogProps): JSX.Element {
    return (
        <Dialog open={open}>
            <DialogTitle>Alerta</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Produtos <b>{nmProduto}</b> estão com o estoque vazio. Por favor, Atualize o estoque desses produtos antes de continuar.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onOKClick} autoFocus>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}