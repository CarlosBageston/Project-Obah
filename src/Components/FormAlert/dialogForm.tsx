import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '../button';

interface DialogProps {
    open: boolean;
    onOKClick: () => void;
    labelButtonOk: string
    title: string;
    messege: React.ReactNode
    onCancelClick?: () => void;
    labelButtonCencel?: string
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

export default function AlertDialog({ open, onOKClick, messege, title, labelButtonOk, onCancelClick, labelButtonCencel }: DialogProps): JSX.Element {
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {messege}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {labelButtonCencel ?
                    <Button onClick={onCancelClick} label={labelButtonCencel} type="button" />
                    : null
                }
                <Button onClick={onOKClick} label={labelButtonOk} type="button" />
            </DialogActions>
        </Dialog>
    );
}