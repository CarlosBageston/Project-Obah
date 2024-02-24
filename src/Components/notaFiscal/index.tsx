import Button from "../button";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import ClienteModel from "../../Pages/admin/cadastroClientes/model/cliente";
import { Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";


import { BoxClose, StyledAiOutlineClose } from "../isEdit/style";
import { Box, DivSubHeader, Title, TotalValue, DivClosePrint, ContainerFlutuantePrint, TextLabel, BoxButtonPrint, BoxButtonDialog } from "./style";
import useFormatCurrency from "../../hooks/formatCurrency";

interface Props {
    values: EntregaModel,
    clienteCurrent: ClienteModel,
    setShouldShow: React.Dispatch<React.SetStateAction<boolean>>
    quantidades: { [key: string]: number }
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void
}

export function NotaFiscal({ values, clienteCurrent, setShouldShow, quantidades, handleSubmit }: Props) {
    const [horaAtual, setHoraAtual] = useState<string>('');
    const [registerProduct, setRegisterProduct] = useState<boolean>(false);

    const ref = useRef<HTMLDivElement>(null);
    const { NumberFormatForBrazilianCurrency } = useFormatCurrency();

    useEffect(() => {
        const data = new Date();
        const dataFormatada = format(data, 'HH:mm');
        setHoraAtual(dataFormatada);
    }, []);

    function formatIndex(index: number): string {
        return index.toString().padStart(3, '0');
    }

    const handlePrint = () => {
        if (ref.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Nota Fiscal</title></head><body>');
                printWindow.document.write(ref.current.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();

                printWindow.addEventListener('afterprint', () => {
                    printWindow.close();
                    setRegisterProduct(true)
                });

                printWindow.print();
            }
        }
    };
    return (
        <>
            {!registerProduct ?

                <ContainerFlutuantePrint>
                    <BoxClose>
                        <DivClosePrint
                            onClick={() => setShouldShow(false)}
                        >
                            <StyledAiOutlineClose />
                        </DivClosePrint>
                    </BoxClose>
                    <Title>
                        Imprimir Cupom Fiscal
                    </Title>
                    <Box>
                        <div style={{ padding: 16 }} ref={ref}>
                            <div>
                                <Title>SORVETERIA OBAH</Title>
                                <TextLabel>R. Uruguai, 115 - Santa Luzia, Dois Vizinhos - PR, 85660-000</TextLabel>
                                <DivSubHeader>
                                    <div>
                                        <TextLabel>CNPJ: 52.193.214/0001-25</TextLabel>
                                        <TextLabel>IE: Isento</TextLabel>
                                    </div>
                                    <div>
                                        <TextLabel>Data e Hora da venda</TextLabel>
                                        <TextLabel>{values.dtEntrega}</TextLabel>
                                        <TextLabel>{horaAtual}</TextLabel>
                                    </div>
                                </DivSubHeader>
                            </div>
                            <hr style={{ border: "1px dashed #000000" }} />
                            <div style={{ margin: "1rem 0 1rem 0" }}>
                                <Table >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ fontSize: 13 }}>ITEM</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>DESC.</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>QNTD</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>V UN</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>V Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {clienteCurrent.produtos
                                            .filter(produto => produto.valorItem !== 0)
                                            .map((produto, index) => (
                                                <>
                                                    <TableRow key={produto.cdProduto}>
                                                        <TableCell style={{ fontSize: 13 }}>{formatIndex(index + 1)}</TableCell>
                                                        <TableCell style={{ fontSize: 13 }}>{produto.nmProduto}</TableCell>
                                                        <TableCell style={{ fontSize: 13 }}>
                                                            {quantidades[produto.nmProduto] ?? 0}
                                                        </TableCell>
                                                        <TableCell style={{ fontSize: 13 }}>
                                                            {NumberFormatForBrazilianCurrency(produto.vlVendaProduto).replace('R$', '')}
                                                        </TableCell>
                                                        <TableCell style={{ fontSize: 12 }}> {
                                                            Number(produto.valorItem) % 1 === 0
                                                                ? `${produto.valorItem?.toFixed(0)},00`
                                                                : `${produto.valorItem?.toFixed(2).replace('.', ',')}`}
                                                        </TableCell>
                                                    </TableRow>
                                                </>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <hr style={{ border: "1px dashed #000000" }} />
                            <div style={{ margin: "1rem 0 1rem 0" }}>
                                <TotalValue>VALOR TOTAL {values.vlEntrega}</TotalValue>
                            </div>
                        </div>
                    </Box>
                    <BoxButtonPrint>
                        <Button
                            label={"Confirmar"}
                            type="button"
                            onClick={handlePrint}
                        />
                    </BoxButtonPrint>
                </ContainerFlutuantePrint>
                :
                <Dialog open={registerProduct}>
                    <DialogTitle>Cadastrar Entrega</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Deseja Cadastrar a Entrega ?
                        </DialogContentText>
                    </DialogContent>
                    <BoxButtonDialog>
                        <DialogActions>
                            <Button onClick={() => { setRegisterProduct(false); setShouldShow(false) }} label={'Cancelar'} type="button" />
                        </DialogActions>
                        <DialogActions>
                            <Button onClick={() => { handleSubmit(); setRegisterProduct(false); setShouldShow(false) }} label={'Cadastrar Entrega'} type="button" />
                        </DialogActions>
                    </BoxButtonDialog>
                </Dialog>
            }
        </>
    )
}