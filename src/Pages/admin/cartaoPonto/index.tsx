import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect, useCallback } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { realtimeDb } from '../../../firebase';
import { query, orderByChild, startAt, endAt, ref, get } from "firebase/database";
import CartaoPontoModel from "./model/cartaoponto";
import ActionCartaoPontoEnum from '../../../enumeration/action';
import { ButtonFilter } from "../../../Components/filtro/style";
import DatePicker from '../../../Components/datePicker/datePicker';
import ColaboradorModel from "../cadastroColaborador/model/colaborador";
import {
    TextField,
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useTableKeys } from '../../../hooks/tableKey';
import { NumberFormatForBrazilianCurrency } from '../../../hooks/formatCurrency';
import { getItemsByQuery, getSingleItemByQuery } from '../../../hooks/queryFirebase';
import { where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import SituacaoSalarioColaboradorEnum from '../../../enumeration/situacaoColaborador';

function CartaoPonto() {
    const [suggestions, setSuggestions] = useState<ColaboradorModel[]>([]);
    const [currentColaborador, setCurrentColaborador] = useState<ColaboradorModel | null>();
    const [currentCartaoPonto, setCurrentCartaoPonto] = useState<CartaoPontoModel[]>([])
    const [sumTotalPago, setSumTotalPago] = useState<string>('');
    const [sumHoraTrabalhada, setHoraTrabalhada] = useState<string>('');
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();


    const { values, setFieldValue, resetForm } = useFormik<CartaoPontoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            dtInicio: '',
            dtTermino: '',
            action: undefined,
            datetime: undefined,
            uid: '',
            vlHora: undefined,
            nmColaborador: ''
        },
        validationSchema: Yup.object().shape({
            dtInicio: Yup.string().required('Campo obrigatório'),
            dtTermino: Yup.string().required('Campo obrigatório'),
            colaborador: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: () => { },
    });

    //manupulando evento de onchange do Select
    async function handleColaboradorChange(event: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm()
            setCurrentCartaoPonto([])
        } else {
            console.log(value)
            setCurrentColaborador(value);
            if (value) {
                const colaboradorId = value.idCartaoPonto;
                const colaboradorEncontrado = await getSingleItemByQuery<ColaboradorModel>(tableKeys.Colaborador, [where('idCartaoPonto', '==', colaboradorId)], dispatch)
                if (colaboradorEncontrado) {
                    setFieldValue('nmColaborador', colaboradorEncontrado.nmColaborador);
                }
            }
        }
    }

    function cleanSearch() {
        setFieldValue('dtInicio', '')
        setFieldValue('dtTermino', '')
        setCurrentCartaoPonto([])
    }

    function calcularHorasTrabalhadas(
        data: CartaoPontoModel[],
    ) {
        if (!currentColaborador) {
            throw new Error("Colaborador não encontrado.");
        }

        switch (currentColaborador.stSalarioColaborador) {
            case SituacaoSalarioColaboradorEnum.DIARIA:
                return calcularPagamentoDiario(data, currentColaborador);

            case SituacaoSalarioColaboradorEnum.MES:
                return calcularPagamentoMensal(currentColaborador);

            default:
                return calcularPagamentoPorHoras(data);
        }
    }

    function calcularPagamentoDiario(
        data: CartaoPontoModel[],
        currentColaborador: ColaboradorModel
    ) {
        if (data.length === 0) {
            throw new Error("Nenhum registro de ponto encontrado.");
        }

        const uniqueDates = new Set(
            data.map((d) => {
                const date = d.datetime ? new Date(d.datetime) : new Date();
                return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
            })
        );

        const diffDays = uniqueDates.size;
        const salarioDiario = currentColaborador.vlHora ?? 0;
        const totalSalario = diffDays * salarioDiario;

        return {
            horasTrabalhadas: `${diffDays} dias`,
            valorPago: NumberFormatForBrazilianCurrency(totalSalario),
        };
    }

    function calcularPagamentoMensal(currentColaborador: ColaboradorModel) {
        const salarioMensal = currentColaborador.vlHora ?? 0;
        return {
            horasTrabalhadas: "",
            valorPago: NumberFormatForBrazilianCurrency(salarioMensal),
        };
    }

    function calcularPagamentoPorHoras(data: CartaoPontoModel[]) {
        let totalHorasTrabalhadas = 0;
        let valorPago = 0;

        for (let i = 0; i < data.length; i += 2) {
            const entrada = data[i];
            const saida = data[i + 1];

            if (isParValido(entrada, saida)) {
                const { horasTrabalhadas, valor } = calcularHorasEValor(entrada, saida);
                totalHorasTrabalhadas += horasTrabalhadas;
                valorPago += valor;
            }
        }

        const tempoFormatado = formatarHoras(totalHorasTrabalhadas);

        return {
            horasTrabalhadas: tempoFormatado,
            valorPago: NumberFormatForBrazilianCurrency(valorPago),
        };
    }

    function isParValido(entrada: CartaoPontoModel, saida: CartaoPontoModel): boolean {
        return (
            entrada &&
            saida &&
            entrada.action === "entrada" &&
            saida.action === "saida"
        );
    }

    function calcularHorasEValor(
        entrada: CartaoPontoModel,
        saida: CartaoPontoModel
    ): { horasTrabalhadas: number; valor: number } {
        const horaEntrada = moment(entrada.datetime);
        const horaSaida = moment(saida.datetime);

        const diffSeconds = horaSaida.diff(horaEntrada, "seconds");
        const vlHora = entrada.vlHora ?? 0;

        if (isNaN(diffSeconds)) {
            return { horasTrabalhadas: 0, valor: 0 };
        }

        const horasTrabalhadas = diffSeconds / 3600;
        const valor = horasTrabalhadas * vlHora;

        return { horasTrabalhadas, valor };
    }

    function formatarHoras(totalHoras: number): string {
        const totalSeconds = Math.floor(totalHoras * 3600);
        const horas = Math.floor(totalSeconds / 3600);
        const minutos = Math.floor((totalSeconds % 3600) / 60);
        const segundos = totalSeconds % 60;

        return `${horas}h ${minutos}m ${segundos}s`;
    }

    async function fetchColaboradorWithDateFilters(uid: string, startDate: string, endDate: string): Promise<CartaoPontoModel[]> {
        const cartaoPontoRef = ref(realtimeDb, `CartaoPonto/${uid}`);
        const startAtDate = new Date(startDate).toISOString(); // Converte para ISO 8601
        const endAtDate = new Date(endDate).toISOString();

        // Consulta filtrada pelas datas
        const filteredQuery = query(
            cartaoPontoRef,
            orderByChild("datetime"),
            startAt(startAtDate),
            endAt(endAtDate)
        );
        const snapshot = await get(filteredQuery);

        const dataArray: CartaoPontoModel[] = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach((key) => {
                dataArray.push(data[key]);
            });
        }
        console.log(dataArray)
        return dataArray;
    }

    // Atualização do handleSearch
    async function handleSearch() {
        if (currentColaborador && values.dtInicio && values.dtTermino) {
            const filteredData = await fetchColaboradorWithDateFilters(
                currentColaborador.idCartaoPonto,
                values.dtInicio as string,
                values.dtTermino as string
            );
            console.log(filteredData)
            const { horasTrabalhadas, valorPago } = calcularHorasTrabalhadas(filteredData);
            setSumTotalPago(valorPago);
            setHoraTrabalhada(horasTrabalhadas);
            mergeEntriesAndExits(filteredData);
        }
    }

    function mergeEntriesAndExits(data: CartaoPontoModel[]) {
        const mergedData: CartaoPontoModel[] = [];
        let currentEntry: CartaoPontoModel | null = null;
        data.forEach(item => {
            if (item.action === ActionCartaoPontoEnum.ENTRADA) {
                // Se for uma entrada, cria um novo objeto de entrada.
                currentEntry = {
                    action: ActionCartaoPontoEnum.ENTRADA,
                    entrada: item.datetime,
                    uid: item.uid,
                    vlHora: currentColaborador?.vlHora
                };
            } else if (item.action === ActionCartaoPontoEnum.SAIDA && currentEntry) {
                // Se for uma saída e houver um objeto de entrada correspondente,
                // adicione a saída ao objeto de entrada e adicione o objeto de entrada unificado à lista.
                currentEntry.saida = item.datetime;
                mergedData.push(currentEntry);
                currentEntry = null;
            }
        });
        setCurrentCartaoPonto(mergedData)
    }
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions();
        }, 200);

        return () => {
            clearTimeout(handler);
        };
    }, [values.nmColaborador]);

    const fetchSuggestions = useCallback(async () => {
        if (!values.nmColaborador || values.nmColaborador.trim() === "") {
            setSuggestions([]);
            return;
        }
        try {
            const { data } = await getItemsByQuery<ColaboradorModel>(
                tableKeys.Colaborador,
                [where('nmColaborador', '>=', values.nmColaborador), where('nmColaborador', '<=', values.nmColaborador + '\uf8ff')],
                dispatch
            );
            setSuggestions(data);
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            setSuggestions([]);
        }
    }, [values.nmColaborador]);
    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Cartão Ponto</Typography>
            <Grid container spacing={2} mb={5}>
                <Grid item xs={3}>
                    <Autocomplete
                        freeSolo
                        id="tags-standard"
                        options={suggestions}
                        value={suggestions.find((item: any) => item.colaborador === values.nmColaborador) || null}
                        getOptionLabel={(item: any) => item.nmColaborador}
                        onChange={(_, newValue, reason) => handleColaboradorChange(_, newValue, reason)}
                        onInputChange={(_, newInputValue, reason) => {
                            if (reason === 'clear') handleColaboradorChange(_, null, 'clear');
                            setFieldValue('nmColaborador', newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Colaborador"
                                placeholder="Selecione..."
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={2}>
                    <DatePicker
                        label='Data Inicio'
                        onChange={(date) => setFieldValue('dtInicio', date)}
                        value={values.dtInicio}
                    />
                </Grid>
                <Grid item xs={2}>

                    <DatePicker
                        label='Data Termino'
                        onChange={(date) => setFieldValue('dtTermino', date)}
                        value={values.dtTermino}
                    />
                </Grid>
                <div style={{ display: 'flex' }}>

                    <ButtonFilter
                        type="button"
                        startIcon={<BiSearchAlt size={25} />}
                        onClick={handleSearch}
                    >
                    </ButtonFilter>
                    <ButtonFilter
                        type="button"
                        startIcon={<IoMdClose size={25} color='red' />}
                        onClick={cleanSearch}
                    >
                    </ButtonFilter>
                </div>
            </Grid>
            <div style={{ minHeight: 'calc(100vh - 433px)' }}>
                {currentCartaoPonto.length > 0 && (
                    <TableContainer component={Paper} className='style-scrollbar'>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Data Trabalhada</strong></TableCell>
                                    <TableCell><strong>Hora de Entrada</strong></TableCell>
                                    <TableCell><strong>Hora de Saída</strong></TableCell>
                                    <TableCell><strong>Valor a Receber</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentCartaoPonto.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{moment(row.entrada).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell>{moment(row.entrada).format("HH:mm:ss")}</TableCell>
                                        <TableCell>{moment(row.saida).format("HH:mm:ss")}</TableCell>
                                        <TableCell>
                                            {row.vlHora && row.vlHora % 1 === 0 && typeof row.vlHora === 'number'
                                                ? ` ${row.vlHora.toFixed(0)},00`
                                                : `${row.vlHora?.toString() + ',00'}`
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {currentCartaoPonto.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                        <p><strong>
                            Total de
                            {currentColaborador?.stSalarioColaborador === SituacaoSalarioColaboradorEnum.HORA ? ' Horas Trabalhadas: ' : ' Dias Trabalhados: '}</strong> {sumHoraTrabalhada}</p>
                        <p><strong>Valor Total:</strong> {sumTotalPago}</p>
                    </div>
                )}
            </div>
        </Box>
    )
}

export default CartaoPonto;