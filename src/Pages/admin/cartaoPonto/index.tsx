import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { BiSearchAlt } from "react-icons/bi";
import GetData from "../../../firebase/getData";
import CartaoPontoModel from "./model/cartaoponto";
import { Box, DivTable, TotalValue, BoxDate, DivFull, DivTableBody, DivTableTitle, DivTableRow } from "./style";
import { ButtonFilter } from "../../../Components/filtro/style";
import DatePicker from '../../../Components/datePicker/datePicker';
import ColaboradorModel from "../cadastroColaborador/model/colaborador";
import {
    TextField,
    Autocomplete,
    AutocompleteChangeReason,
} from "@mui/material";
import { realtimeDb } from '../../../firebase';
import { onValue, ref } from 'firebase/database';
import ActionCartaoPontoEnum from '../../../enumeration/action';
import { TitleDefault } from '../cadastroClientes/style';

const objClean: CartaoPontoModel = {
    dtInicio: '',
    dtTermino: '',
    action: undefined,
    datetime: undefined,
    uid: undefined,
    vlHora: undefined
}
function CartaoPonto() {
    const [key, setKey] = useState<number>(0);
    const [currentColaborador, setCurrentColaborador] = useState<ColaboradorModel | null>();
    const [initialValues, setInitialValues] = useState<CartaoPontoModel>({ ...objClean });
    const [currentCartaoPonto, setCurrentCartaoPonto] = useState<CartaoPontoModel[]>([])
    const [sumTotalPago, setSumTotalPago] = useState<number>();
    const [sumHoraTrabalhada, setHoraTrabalhada] = useState<number>();
    const [dataRealTime, setDataRealTime] = useState<CartaoPontoModel[]>([])

    //realizando busca no banco de dados
    const {
        dataTable: dataTableColabroador,
    } = GetData('Colaborador', true) as { dataTable: ColaboradorModel[] };


    const { values, setFieldValue } = useFormik<CartaoPontoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            dtInicio: Yup.string().required('Campo obrigatório'),
            dtTermino: Yup.string().required('Campo obrigatório'),
            colaborador: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: () => { },
    });

    function cleanState() {
        setInitialValues({
            dtInicio: '',
            dtTermino: '',
            action: undefined,
            datetime: undefined,
            uid: undefined,
            vlHora: undefined
        })
        setKey(Math.random());
    }
    //manupulando evento de onchange do Select
    function handleColaboradorChange(event: React.SyntheticEvent<Element, Event>, value: ColaboradorModel | null, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cleanState()
            setCurrentCartaoPonto([])
        } else {
            cleanState()
            setCurrentColaborador(value);
            if (value) {
                const colaboradorId = value.idCartaoPonto;
                const colaboradorEncontrado = dataTableColabroador.find(cartao => cartao.idCartaoPonto === colaboradorId);
                if (colaboradorEncontrado) {
                    setFieldValue('colaborador.nmColaborador', colaboradorEncontrado.nmColaborador);
                }
            }
        }
    }

    function cleanSearch() {
        setFieldValue('dtInicio', '')
        setFieldValue('dtTermino', '')
        setCurrentCartaoPonto([])
    }

    function calcularHorasTrabalhadas(data: CartaoPontoModel[]) {
        let horasTrabalhadas = 0;
        let valorPago = 0;

        for (let i = 0; i < data.length; i++) {
            const entrada = data[i];
            const saida = data[i + 1];

            if (entrada && saida && entrada.action === 0 && saida.action === 1) {
                const horaEntrada = entrada.datetime ? new Date(entrada.datetime).getTime() : 0;
                const horaSaida = saida.datetime ? new Date(saida.datetime).getTime() : 0;
                const diffMilliseconds = horaSaida - horaEntrada;
                const diffHours = diffMilliseconds / (1000 * 60 * 60);

                const vlHora = entrada.vlHora;

                if (!isNaN(diffHours) && !isNaN(vlHora as number)) {
                    horasTrabalhadas += diffHours;
                    valorPago += diffHours * Number(vlHora);
                }

                i++;
            }
        }

        return { horasTrabalhadas, valorPago };
    }

    function handleSearch() {
        if (currentColaborador && values.dtInicio && values.dtTermino) {
            const dataFormattedInicio = new Date(values.dtInicio)
            const dataFormattedTermino = new Date(values.dtTermino)

            const dateInicio = moment(dataFormattedInicio).format("DD/MM/YYYY");
            const dateTermino = moment(dataFormattedTermino).format("DD/MM/YYYY")

            const filteredData = dataRealTime.filter(cartao => {
                const cartaoDate = moment(cartao.datetime).format("DD/MM/YYYY");

                return cartaoDate >= dateInicio && cartaoDate <= dateTermino &&
                    cartao.uid === currentColaborador.idCartaoPonto;
            });
            filteredData.map((item) => {
                const funcionarioEncontrado = dataTableColabroador.find(id => id.idCartaoPonto = item.uid)
                item.vlHora = funcionarioEncontrado?.vlHora
                item.id = Math.random().toString()
            })
            const { horasTrabalhadas, valorPago } = calcularHorasTrabalhadas(filteredData)
            setSumTotalPago(valorPago)
            setCurrentCartaoPonto(filteredData)
            setHoraTrabalhada(horasTrabalhadas)
            mergeEntriesAndExits(filteredData)
        }
    }

    useEffect(() => {
        const cartaoPontoRef = ref(realtimeDb, 'CartaoPonto');
        onValue(cartaoPontoRef, (snapshot) => {
            const data = snapshot.val();
            if (data !== null && typeof data === 'object') {
                const dataArray: any[] = [];
                Object.keys(data).forEach((key) => {
                    const item = data[key];
                    dataArray.push(item);
                });
                setDataRealTime(dataArray);
            }
        });
    }, []);

    function mergeEntriesAndExits(data: CartaoPontoModel[]) {
        const mergedData: CartaoPontoModel[] = [];
        let currentEntry: CartaoPontoModel | null = null;

        data.forEach(item => {
            if (item.action === ActionCartaoPontoEnum.ENTRADA) {
                // Se for uma entrada, cria um novo objeto de entrada.
                currentEntry = {
                    action: 0,
                    entrada: item.datetime,
                    uid: item.uid,
                    vlHora: item.vlHora
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

    return (
        <Box>
            <TitleDefault>Histórico Cartão Ponto</TitleDefault>
            <DivFull>
                <div>
                    <Autocomplete
                        id="tags-standard"
                        options={dataTableColabroador}
                        getOptionLabel={(item: any) => item.nmColaborador}
                        onChange={handleColaboradorChange}
                        style={{
                            borderBottom: '1px solid #6e6dc0',
                            color: 'black',
                            backgroundImage: 'linear-gradient(to top, #b2beed1a, #b2beed1a, #b2beed1a, #b2beed12, #ffffff)',
                            width: '20rem',
                            marginTop: '6px'
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Colaborador"
                                placeholder="Selecione..."
                                InputLabelProps={{
                                    style: { fontSize: '1.3rem', fontWeight: '500', color: '#4d68b7' }
                                }}
                            />
                        )}
                    />
                </div>
                <BoxDate>
                    <DatePicker
                        label='Data Inicio'
                        onChange={(date) => setFieldValue('dtInicio', date)}
                        value={values.dtInicio}
                        key={`dtInicio-${key}`}
                    />

                    <DatePicker
                        label='Data Termino'
                        onChange={(date) => setFieldValue('dtTermino', date)}
                        value={values.dtTermino}
                        key={`dtTermino-${key}`}
                    />
                </BoxDate>
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
            </DivFull>

            {currentCartaoPonto.length > 0 &&
                <div>
                    <DivTable>
                        <DivTableTitle>
                            <h3>Data Trabalhada</h3>
                            <h3>Hora de entrada</h3>
                            <h3>Hora de saída</h3>
                            <h3>Valor a Receber</h3>
                        </DivTableTitle>
                        <DivTableBody>
                            {currentCartaoPonto.map(row => (
                                <DivTableRow key={row.id}>
                                    <p>{moment(row.entrada).format("DD/MM/YYYY")}</p>
                                    <p>{moment(row.entrada).format("HH:mm:ss")}</p>
                                    <p>{moment(row.saida).format("HH:mm:ss")}</p>
                                    <p>
                                        {row.vlHora && row.vlHora % 1 === 0 && typeof row.vlHora === 'number'
                                            ? ` ${row.vlHora.toFixed(0)},00`
                                            : `${row.vlHora?.toString() + ',00'}`
                                        }
                                    </p>
                                </DivTableRow>
                            ))}
                        </DivTableBody>
                    </DivTable>
                    <div>
                        <TotalValue>Total de Horas Trabalhadas:
                            {sumHoraTrabalhada && sumHoraTrabalhada % 1 === 0 ?
                                ` ${sumHoraTrabalhada?.toFixed(0)},00`
                                :
                                ` ${sumHoraTrabalhada?.toFixed(2).replace('.', ',')}`}
                        </TotalValue>
                        <TotalValue>Valor Total: R$
                            {sumTotalPago && sumTotalPago % 1 === 0 ?
                                ` ${sumTotalPago?.toFixed(0)},00`
                                :
                                ` ${sumTotalPago?.toFixed(2).replace('.', ',')}`}
                        </TotalValue>
                    </div>

                </div>
            }
        </Box>
    )
}

export default CartaoPonto;