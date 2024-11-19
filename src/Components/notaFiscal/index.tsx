import Button from "../button";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import { Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, Box } from "@mui/material";


import printJS from "print-js";
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
                                <Typography variant="h4" align="center">SORVETERIA OBAH</Typography>
                                <Typography align="center" sx={{ fontWeight: "bold", fontSize: "22px", margin: "8px 0" }}>
                                    {`${empresa.ruaEmpresa}, ${empresa.numeroEmpresa} - ${empresa.bairroEmpresa}, ${empresa.cidadeEmpresa} - ${empresa.estadoEmpresa}, ${empresa.cepEmpresa}`}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" sx={{ margin: "1rem 0", height: "10rem", flexDirection: "column" }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: "bold", fontSize: "22px" }}>CNPJ: {empresa.cnpjEmpresa}</Typography>
                                        <Typography sx={{ fontWeight: "bold", fontSize: "22px" }}>Telefone: {empresa.tfEmpresa}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: "bold", fontSize: "22px" }}>Data e Hora da venda</Typography>
                                        <Box display="flex">
                                            <Typography sx={{ fontWeight: "bold", fontSize: "22px" }}>{values.dtEntrega ? values.dtEntrega.toString() : ''}</Typography>
                                            <Typography sx={{ fontWeight: "bold", fontSize: "22px", marginLeft: "8px" }}>- {horaAtual}</Typography>
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
                                            <TableCell style={{ fontSize: 13 }}>DESC.</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>QNTD</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>V UN</TableCell>
                                            <TableCell style={{ fontSize: 13 }}>V Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {values.produtos.filter(produto => produto.valorItem !== 0).map((produto, index) => (
                                            <TableRow key={produto.nmProduto}>
                                                <TableCell style={{ fontSize: 13 }}>{formatIndex(index + 1)}</TableCell>
                                                <TableCell style={{ fontSize: 13 }}>{produto.nmProduto}</TableCell>
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
                                <Typography variant="h6" align="center" sx={{ fontWeight: "bold" }}>VALOR TOTAL {values.vlEntrega}</Typography>
                            </Box>
                        </Box>

                        {/* Button */}
                        <Box display="flex" justifyContent="center" sx={{ margin: "1rem 0 2rem 0" }}>
                            <Button
                                className="no-print"
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