import Button from "../button";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import { Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";


import { BoxClose, StyledAiOutlineClose } from "../isEdit/style";
import { Box, DivSubHeader, Title, TotalValue, DivClosePrint, ContainerFlutuantePrint, TextLabel, BoxButtonPrint, BoxButtonDialog } from "./style";
import useFormatCurrency from "../../hooks/formatCurrency";
import printJS from "print-js";

interface Props {
    values: EntregaModel,
    setShouldShow: React.Dispatch<React.SetStateAction<boolean>>
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void
}

export function NotaFiscal({ values, setShouldShow, handleSubmit }: Props) {
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

    // TODO: IMPRIMIR CUPOM DE NOTA FISCAL TESTE

    const handlePrint = () => {
        if (ref.current) {
            const printContent = ref.current.innerHTML;

            // Crie um iframe temporário
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            iframe.style.display = 'none'; // Oculta o iframe

            const doc = iframe.contentWindow?.document || iframe.contentDocument;

            if (doc) {
                doc.open();
                doc.write(`
                    <html>
                    <head>
                        <title>Nota Fiscal</title>
                        <style>
                            @media print {
                                .marginprint {
                                    margin-bottom: 6px;
                                    margin-top: 6px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                doc.close();

                // Usando print.js para imprimir o conteúdo do iframe
                printJS({ printable: iframe.contentWindow?.document.body.innerHTML, type: 'html', style: '' });

                // Remove o iframe após a impressão
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    setRegisterProduct(true);
                }, 1000);
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
                                <TextLabel className="marginprint">R. Uruguai, 115 - Santa Luzia, Dois Vizinhos - PR, 85660-000</TextLabel>
                                <TextLabel className="marginprint">Telefone: (46) 99935-8718</TextLabel>
                                <DivSubHeader>
                                    <div>
                                        <TextLabel className="marginprint">CNPJ: 52.193.214/0001-25</TextLabel>
                                        <TextLabel className="marginprint">IE: Isento</TextLabel>
                                    </div>
                                    <div>
                                        <TextLabel className="marginprint">Data e Hora da venda</TextLabel>
                                        <div style={{ display: 'flex' }}>
                                            <TextLabel className="marginprint">{values.dtEntrega !== null ? values.dtEntrega.toString() : ''}</TextLabel>
                                            <TextLabel className="marginprint">-{horaAtual}</TextLabel>
                                        </div>
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
                                        {values.produtos.filter(produto => produto.valorItem !== 0)
                                            .map((produto, index) => (
                                                <>
                                                    <TableRow key={produto.nmProduto}>
                                                        <TableCell style={{ fontSize: 13 }}>{formatIndex(index + 1)}</TableCell>
                                                        <TableCell style={{ fontSize: 13 }}>{produto.nmProduto}</TableCell>
                                                        <TableCell style={{ fontSize: 13 }}>{produto.quantidade ?? 0}</TableCell>
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
                            className="no-print"
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