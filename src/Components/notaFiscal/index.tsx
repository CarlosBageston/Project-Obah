import Button from "../button";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import { Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, Box } from "@mui/material";

import { NumberFormatForBrazilianCurrency } from "../../hooks/formatCurrency";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducer/store";

interface Props {
    values: EntregaModel,
    setShouldShow: React.Dispatch<React.SetStateAction<boolean>>
    handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void
}

export function NotaFiscal({ values, setShouldShow, handleSubmit }: Props) {
    const [horaAtual, setHoraAtual] = useState<string>('');
    const [registerProduct, setRegisterProduct] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);
    const empresa = useSelector((state: RootState) => state.empresaOnline);
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
            // Criar iframe invisível para manipulação de impressão
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            if (!iframe) return;
            if (!iframe.contentWindow) return;
            console.log(iframe.contentWindow)
            // Escrever o conteúdo da impressão no iframe
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<html><head><title>Nota Fiscal</title>');
            iframeDoc.write(`
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    th, td {
                        padding: 4px;
                        text-align: center;
                    }
                    th {
                        font-weight: bold;
                    }
                    td {
                        font-size: 12px;
                    }
                    .descricao {
                        text-align: left;
                    }
                    .line {
                        margin: 0;
                        padding: 4px 0;
                        line-height: 1.2;
                    }
                    .total {
                        font-weight: bold;
                        font-size: 18px;
                        margin-top: 10px;
                    }
                </style>
            `);
            iframeDoc.write('</head><body>');
            iframeDoc.write(ref.current.innerHTML);
            iframeDoc.write('</body></html>');
            iframeDoc.close();

            // Chamar o print no iframe (isso deve acionar o pop-up)
            iframe.contentWindow.print();

            // Após a impressão, remover o iframe
            iframe.onload = () => {
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 0);
            };
        }
    };


    return (
        <>
            {!registerProduct ?

                <Dialog open={true} onClose={() => setShouldShow(false)} maxWidth="md" fullWidth>
                    <Box sx={{ padding: "28px", position: "relative" }}>
                        {/* Close button */}
                        <Box sx={{ position: "absolute", top: "-28px", right: "10px", cursor: "pointer" }} onClick={() => setShouldShow(false)}>
                            x
                        </Box>

                        {/* Title */}
                        <Typography variant="h3" align="center">Imprimir Cupom Fiscal</Typography>

                        <Box sx={{ padding: "16px" }} ref={ref}>
                            <Box>
                                <Typography className="line" variant="h4" align="center">SORVETERIA OBAH</Typography>
                                <Typography className="line" align="center" sx={{ fontWeight: "bold", fontSize: "22px", margin: "8px 0" }}>
                                    {`${empresa.ruaEmpresa}, ${empresa.numeroEmpresa} - ${empresa.bairroEmpresa}, ${empresa.cidadeEmpresa} - ${empresa.estadoEmpresa}, ${empresa.cepEmpresa}`}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" sx={{ margin: "1rem 0", height: "10rem", flexDirection: "column" }}>
                                    <Box>
                                        <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>CNPJ: {empresa.cnpjEmpresa}</Typography>
                                        <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>IE: {empresa.inscricaoEstadual || 'Isento'}</Typography>
                                        <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>Telefone: {empresa.tfEmpresa}</Typography>
                                    </Box>
                                    <Box >
                                        <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>Data e Hora da venda</Typography>
                                        <Box>
                                            <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>
                                                {values.dtEntrega ? `${values.dtEntrega.toString()} - ${horaAtual}` : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <hr style={{ border: "1px dashed #000000" }} />

                            {/* Table */}
                            <Box sx={{ margin: "1rem 0" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ fontSize: 13 }}>ITEM</TableCell>
                                            <TableCell style={{ fontSize: 13 }} className="descricao">DESC.</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>QNTD</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>UN</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {values.produtos.filter(produto => produto.valorItem !== 0).map((produto, index) => (
                                            <TableRow key={produto.nmProduto}>
                                                <TableCell style={{ fontSize: 13 }}>{formatIndex(index + 1)}</TableCell>
                                                <TableCell style={{ fontSize: 13 }} className="descricao">{produto.nmProduto}</TableCell>
                                                <TableCell style={{ fontSize: 13 }}>{produto.quantidade ?? 0}</TableCell>
                                                <TableCell style={{ fontSize: 13 }}>{NumberFormatForBrazilianCurrency(produto.vlVendaProduto).replace('R$', '')}</TableCell>
                                                <TableCell style={{ fontSize: 12 }}> {
                                                    Number(produto.valorItem) % 1 === 0
                                                        ? `${produto.valorItem?.toFixed(0)},00`
                                                        : `${produto.valorItem?.toFixed(2).replace('.', ',')}`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            <hr style={{ border: "1px dashed #000000" }} />

                            <Box sx={{ margin: "1rem 0" }}>
                                <Typography className="total" variant="h6" align="center" sx={{ fontWeight: "bold" }}>VALOR TOTAL {values.vlEntrega}</Typography>
                            </Box>
                        </Box>

                        {/* Button */}
                        <Box display="flex" justifyContent="center" sx={{ margin: "1rem 0 2rem 0" }}>
                            <Button
                                label={"Confirmar"}
                                type="button"
                                onClick={handlePrint}
                            />
                        </Box>
                    </Box>
                </Dialog>

                :
                <Dialog open={registerProduct}>
                    <DialogTitle>Cadastrar Entrega</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Deseja Cadastrar a Entrega ?
                        </DialogContentText>
                    </DialogContent>
                    <Box display="flex" justifyContent="space-between" sx={{ padding: "16px", width: '37rem' }}>
                        <DialogActions>
                            <Button onClick={() => { setRegisterProduct(false); setShouldShow(false) }} label={'Cancelar'} type="button" />
                        </DialogActions>
                        <DialogActions>
                            <Button onClick={() => { handleSubmit(); setRegisterProduct(false); setShouldShow(false) }} label={'Cadastrar Entrega'} type="button" />
                        </DialogActions>
                    </Box>
                </Dialog>
            }
        </>
    )
}