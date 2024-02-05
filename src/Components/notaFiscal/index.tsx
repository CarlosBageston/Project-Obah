import Button from "../button";
import { format } from "date-fns";
import ReactToPrint from "react-to-print";
import { useEffect, useRef, useState } from "react";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import ClienteModel from "../../Pages/admin/cadastroClientes/model/cliente";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";


import { BoxClose, StyledAiOutlineClose } from "../isEdit/style";
import { Box, DivSubHeader, Title, TotalValue, DivClosePrint, ContainerFlutuantePrint } from "./style";

interface Props {
    values: EntregaModel,
    clienteCurrent: ClienteModel,
    setShouldShow: React.Dispatch<React.SetStateAction<boolean>>
}

export function NotaFiscal({ values, clienteCurrent, setShouldShow }: Props) {
    const [horaAtual, setHoraAtual] = useState('');

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const data = new Date();
        const dataFormatada = format(data, 'HH:mm');
        setHoraAtual(dataFormatada);
    }, []);

    function formatIndex(index: number): string {
        return index.toString().padStart(3, '0');
    }


    return (
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
                        <p>R. Uruguai, 115 - Santa Luzia, Dois Vizinhos - PR, 85660-000</p>
                        <DivSubHeader>
                            <div>
                                <p>CNPJ: 52.193.214/0001-25</p>
                                <p>IE: Isento</p>
                            </div>
                            <div>
                                <p>Data e Hora da venda</p>
                                <p>{values.dtEntrega}</p>
                                <p>{horaAtual}</p>
                            </div>
                        </DivSubHeader>
                    </div>
                    <hr style={{ border: "1px dashed #b0b0b0" }} />
                    <div style={{ margin: "1rem 0 1rem 0" }}>
                        <h1>CUPOM FISCAL</h1>
                        <TableContainer>
                            <Table >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ITEM</TableCell>
                                        {/* <TableCell>CÓD.</TableCell> */}
                                        <TableCell>DESC.</TableCell>
                                        <TableCell align="right">VALOR</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clienteCurrent.produtos
                                        .filter(produto => produto.valorItem !== 0)
                                        .map((produto, index) => (
                                            <>
                                                <TableRow key={produto.cdProduto}>
                                                    <TableCell>{formatIndex(index + 1)}</TableCell>
                                                    <TableCell component="th" scope="row">{produto.nmProduto}</TableCell>
                                                    <TableCell align="right"> {
                                                        Number(produto.valorItem) % 1 === 0
                                                            ? `R$ ${produto.valorItem?.toFixed(0)},00`
                                                            : ` R$ ${produto.valorItem?.toFixed(2).replace('.', ',')}`}
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <hr style={{ border: "1px dashed #b0b0b0" }} />
                    <div style={{ margin: "1rem 0 1rem 0" }}>
                        <TotalValue>VALOR TOTAL R$ {values.vlEntrega}</TotalValue>
                    </div>
                </div>
            </Box>
            <div>
                <ReactToPrint
                    trigger={() =>
                        <Button
                            type='button'
                            disabled={values.dtEntrega === ""}
                            style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}
                            label={"Confirmar"}
                        />
                    }
                    content={() => ref.current}
                />
            </div>
        </ContainerFlutuantePrint>
    )
}