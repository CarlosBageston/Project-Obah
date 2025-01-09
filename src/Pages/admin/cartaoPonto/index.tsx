/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect, useCallback } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { realtimeDb } from '../../../firebase';
import { query, orderByChild, startAt, endAt, ref, get, update } from "firebase/database";
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
import { theme } from '../../../theme';
import Button from '../../../Components/button';
import { PagamentoDialog } from './components/PagamentoDialog';

function CartaoPonto() {
    const [suggestions, setSuggestions] = useState<ColaboradorModel[]>([]);
    const [currentColaborador, setCurrentColaborador] = useState<ColaboradorModel | null>();
    const [currentCartaoPonto, setCurrentCartaoPonto] = useState<CartaoPontoModel[]>([])
    const [sumTotalPago, setSumTotalPago] = useState<string>('');
    const [sumHoraTrabalhada, setHoraTrabalhada] = useState<string>('');
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();
    const [showPagament, setShowPagament] = useState(false);

    const handleOpenPagamentoDialog = () => setShowPagament(true);
    const handleClosePagamentoDialog = () => setShowPagament(false);

    const handleSalvarPagamentoData = async () => {
        await handleSalvarPagamento();
        setShowPagament(false);
    };


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
    async function handleColaboradorChange(_: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm()
            setCurrentCartaoPonto([])
        } else {
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

    function formattedDate(startDate: string, endDate: string) {
        const getLocalISOString = (date: Date) => {
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return localDate.toISOString();
        }
        // Definindo o horário de início (00:00:00) e de fim (23:59:59)
        const startAtDateObj = new Date(startDate);
        startAtDateObj.setHours(0, 0, 0, 0); // Define para 00:00:00.000 no horário local

        const endAtDateObj = new Date(endDate);
        endAtDateObj.setHours(23, 59, 59, 999); // Define para 23:59:59.999 no horário local

        // Converte para ISO 8601 com horário local, levando em consideração o fuso horário
        const startAtDate = getLocalISOString(startAtDateObj);
        const endAtDate = getLocalISOString(endAtDateObj);
        return { startAtDate, endAtDate };
    }
    async function fetchColaboradorWithDateFilters(uid: string, startDate: string, endDate: string): Promise<CartaoPontoModel[]> {
        const cartaoPontoRef = ref(realtimeDb, `CartaoPonto/${uid}`);

        const { startAtDate, endAtDate } = formattedDate(startDate, endDate);
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
        return dataArray;
    }

    function resetTime(date: Date): Date {
        const resetDate = new Date(date); // Cria uma nova data a partir da original
        resetDate.setUTCHours(0, 0, 0, 0); // Zera a hora, minuto, segundo e milissegundo no UTC
        return resetDate;
    }

    async function handleSalvarPagamento() {
        const cartaoPontoRef = ref(realtimeDb, `CartaoPonto/${currentColaborador?.idCartaoPonto}`);
        const dataISO = `${values.dtPagamento}`;

        // Definindo o início e o fim do intervalo
        const startDate = new Date(`${dataISO}T00:00:00.000Z`);
        const endDate = new Date(`${dataISO}T23:59:59.999Z`);

        // Consulta filtrada pelas datas
        const filteredQuery = query(
            cartaoPontoRef,
            orderByChild("datetime"),
            startAt(startDate.toISOString()),
            endAt(endDate.toISOString())
        );
        try {
            const snapshot = await get(filteredQuery);
            if (snapshot.exists()) {
                const data = snapshot.val() as CartaoPontoModel;
                const entries = Object.entries(data).sort(([_, valueA], [__, valueB]) => {
                    const dateA = new Date(valueA.datetime);
                    const dateB = new Date(valueB.datetime);
                    return dateA.getTime() - dateB.getTime();
                });

                // Zera as horas da data selecionada
                const startDateWithoutTime = resetTime(startDate);
                const matchingEntries = entries.filter(([_, value]: [string, any]) => {
                    const entryDateWithoutTime = resetTime(new Date(value.datetime));
                    return startDateWithoutTime.toISOString() === entryDateWithoutTime.toISOString();
                });

                if (matchingEntries.length > 0) {
                    // Pega a primeira entrada correspondente
                    const [key, _] = matchingEntries[0];
                    const entryRef = ref(realtimeDb, `CartaoPonto/${currentColaborador?.idCartaoPonto}/${key}`);
                    // Realize a atualização aqui
                    await update(entryRef, { salarioPago: true });
                } else {
                    console.error("Nenhum dado encontrado para a data selecionada.");
                }
            } else {
                console.error("Nenhum dado encontrado para a data e ação especificadas.");
            }
        } catch (error) {
            console.error("Erro ao buscar ou atualizar os dados:", error);
        }
    }
    // Atualização do handleSearch
    async function handleSearch() {
        if (currentColaborador && values.dtInicio && values.dtTermino) {
            const filteredData = await fetchColaboradorWithDateFilters(
                currentColaborador.idCartaoPonto,
                values.dtInicio as string,
                values.dtTermino as string
            );
            const { horasTrabalhadas, valorPago } = calcularHorasTrabalhadas(filteredData);
            setSumTotalPago(valorPago);
            setHoraTrabalhada(horasTrabalhadas);
            mergeEntriesAndExits(filteredData);
        }
    }
    function mergeEntriesAndExits(data: CartaoPontoModel[]) {
        const mergedData: CartaoPontoModel[] = [];
        let currentEntry: CartaoPontoModel | null = null;

        data.forEach((item, index) => {
            if (index % 2 === 0) {
                // Garantindo que currentEntry seja corretamente tipado
                currentEntry = {
                    action: ActionCartaoPontoEnum.ENTRADA,
                    entrada: item.datetime,
                    uid: item.uid,
                    vlHora: currentColaborador?.vlHora,
                    salarioPago: item.salarioPago ? true : false
                };
            } else if (index % 2 === 1 && currentEntry) {
                // A propriedade 'saida' já está presente em currentEntry
                currentEntry.saida = item.datetime;
                mergedData.push(currentEntry);
                currentEntry = null;
            }
        });

        // Verifica se há uma entrada sem saída e assume a saída baseada em um horário fixo
        if (currentEntry) {
            // Type assertion aqui para garantir que currentEntry é do tipo correto
            (currentEntry as CartaoPontoModel).saida = "";
            mergedData.push(currentEntry);
        }

        setCurrentCartaoPonto(mergedData);
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
                <div style={{ display: 'flex', paddingLeft: '1rem' }}>
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
                                {currentCartaoPonto.map((row: CartaoPontoModel) => (
                                    <TableRow key={row.id} style={{ backgroundColor: row.salarioPago ? theme.paletteColor.tertiaryGreen : '' }}>
                                        <TableCell>{moment.utc(row.entrada).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell>{row.entrada === '' ? "Sem Registro" : moment.utc(row.entrada).format("HH:mm:ss")}</TableCell>
                                        <TableCell>{row.saida === '' ? "Sem Registro" : moment.utc(row.saida).format("HH:mm:ss")}</TableCell>
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
                        <Button style={{ marginTop: "1rem" }} onClick={handleOpenPagamentoDialog} label={'Adicionar Pagamento'} type="button" />
                        <PagamentoDialog
                            setFieldValueExterno={setFieldValue}
                            dtPagemento={values.dtPagamento ?? ''}
                            open={showPagament}
                            onClose={handleClosePagamentoDialog}
                            onSalvar={handleSalvarPagamentoData}
                        />
                    </div>
                )}
            </div>
        </Box>
    )
}

export default CartaoPonto;