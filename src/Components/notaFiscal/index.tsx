import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { EntregaModel } from "../../Pages/admin/entregas/model/entrega";
import ClienteModel from "../../Pages/admin/cadastroClientes/model/cliente";
import { useEffect, useState } from "react";
import { format } from "date-fns";


import { Box, DivSubHeader, Title, TotalValue, DivClosePrint, ContainerFlutuantePrint } from "./style";
import { BoxClose, ButtonStyled, StyledAiOutlineClose } from "../isEdit/style";

interface Props {
    resultCalculo: number[],
    values: EntregaModel,
    clienteCurrent: ClienteModel[],
    setShouldShow: React.Dispatch<React.SetStateAction<boolean>>,
    shouldShow: boolean
}

export function NotaFiscal({ resultCalculo, values, clienteCurrent, setShouldShow, shouldShow }: Props) {
    const [horaAtual, setHoraAtual] = useState('');

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
                <div>
                    <Title>SORVETERIA OBAH LTDA</Title>
                    <p>R. Uruguai, 115 - Santa Luzia, Dois Vizinhos - PR, 85660-000</p>
                    <DivSubHeader>
                        <div>
                            <p>CNPJ: 88.060.864/0001-40</p>
                            <p>IE: 940.82689-63</p>
                            <p>IM: 08641569</p>
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
                                    <TableCell>CÓD.</TableCell>
                                    <TableCell>DESC.</TableCell>
                                    <TableCell align="right">VALOR</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clienteCurrent.map((cliente) => (
                                    <>
                                        {cliente.produtos
                                            .filter((produto, index) => resultCalculo[index] !== 0)
                                            .map((produto, index) => (
                                                <TableRow key={produto.cdProduto}>
                                                    <TableCell>{formatIndex(index + 1)}</TableCell>
                                                    <TableCell>{produto.cdProduto.substring(0, 3)}</TableCell>
                                                    <TableCell component="th" scope="row">{produto.nmProduto}</TableCell>
                                                    <TableCell align="right">
                                                        {!Number.isNaN(resultCalculo[index]) && resultCalculo[index] !== undefined
                                                            ? resultCalculo[index].toFixed(2)
                                                            : 0}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
            </Box>
            <div>
                <ButtonStyled>
                    Confirmar
                </ButtonStyled>
            </div>
        </ContainerFlutuantePrint>
    )
}