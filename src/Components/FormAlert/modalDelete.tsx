import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DialogProps {
    open: boolean;
    onDeleteClick: () => void;
    onCancelClick: () => void;
}

/**
 * Componente de Model de exclusão para informar sobre estoque vazio de determinados produtos.
 *
 * @component
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.open - Indica se o diálogo está aberto ou fechado.
 * @param {Function} props.onDeleteClick - Função a ser executada ao clicar no botão "EXCLUIR".
 * @param {Function} props.onCancelClick - Função a ser executada ao clicar no botão "CANCELAR".
 * @returns {JSX.Element} - Elemento JSX representando o componente de Model de exclusão.
 */

export default function ModalDelete({ open, onCancelClick, onDeleteClick }: DialogProps): JSX.Element {
    return (
        <Dialog open={open}>
            <DialogTitle style={{ fontSize: '1rem' }}>Clicando em EXCLUIR você estará removendo esse item da lista.</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja realizar esta ação?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick} autoFocus>
                    CANCELAR
                </Button>
                <Button onClick={onDeleteClick} autoFocus>
                    EXCLUIR
                </Button>
            </DialogActions>
        </Dialog>
    );
}