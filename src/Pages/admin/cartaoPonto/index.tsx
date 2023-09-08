import * as Yup from 'yup';
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import Input from "../../../Components/input";
import GetData from "../../../firebase/getData";
import CartaoPontoModel from "./model/cartaoponto";
import { Box, DivTable, TotalValue } from "./style";
import formatDate from "../../../Components/masks/formatDate";
import { ButtonFilter } from "../../../Components/filtro/style";
import ColaboradorModel from "../cadastroColaborador/model/colaborador";
import {
    Paper,
    Table,
    TableRow,
    TableBody,
    TableCell,
    TextField,
    TableHead,
    Autocomplete,
    TableContainer,
    AutocompleteChangeReason,
} from "@mui/material";
import DatePicker from '../../../Components/datePicker/datePicker';
import moment from 'moment';

const objClean: CartaoPontoModel = {
    colaborador: undefined,
    dtInicio: '',
    dtTermino: '',
    dtTrabalhada: '',
    hrInicio: '',
    hrTermino: '',
    vlPagoColaborador: null
}
export default function CartaoPonto() {



    const [key, setKey] = useState<number>(0);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [currentColaborador, setCurrentColaborador] = useState<ColaboradorModel | null>();
    const [initialValues, setInitialValues] = useState<CartaoPontoModel>({ ...objClean });
    const [currentCartaoPonto, setCurrentCartaoPonto] = useState<CartaoPontoModel[]>([])
    const [sumTotalPago, setSumTotalPago] = useState<number>();

    //realizando busca no banco de dados
    const {
        dataTable: dataTableColabroador,
    } = GetData('Colaborador', recarregue) as { dataTable: ColaboradorModel[] };
    const {
        dataTable,
    } = GetData('CartaoPonto', recarregue) as { dataTable: CartaoPontoModel[], loading: boolean, setDataTable: (data: CartaoPontoModel[]) => void };


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<CartaoPontoModel>({
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
            colaborador: undefined,
            dtInicio: '',
            dtTermino: '',
            dtTrabalhada: '',
            hrInicio: '',
            hrTermino: '',
            vlPagoColaborador: null,
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

    // colaborador
    //     (map)


    // idCartaoPonto
    // "123456"
    //     (string)


    // vlHora
    // 10
    //     (number)


    // dtTrabalhada
    // "30/08/2023"
    //     (string)


    // hrInicio
    // "06:00"
    //     (string)


    // hrTermino
    // "08:00"
    function handleSearch() {
        if (currentColaborador && values.dtInicio && values.dtTermino) {
            const dateInicial = values.dtInicio
            const dateTermino = values.dtTermino
            console.log(dateInicial, dateTermino)
            const filteredData = dataTable.filter(cartao => {
                const cartaoDate = moment(cartao.dtTrabalhada, 'DD/MM/YYYY').toDate();
                console.log(cartaoDate)

                return cartaoDate >= dateInicial && cartaoDate <= dateTermino &&
                    cartao.colaborador?.idCartaoPonto === currentColaborador.idCartaoPonto;
            });
            console.log(filteredData)
            const result = filteredData.map(hora => {
                const hrInicio = hora.hrInicio;
                const hrTermino = hora.hrTermino;
                const vlPago = hora.colaborador?.vlHora
                // Convertendo as strings de hora para objetos de hora
                const inicioParts = hrInicio.split(':');
                const terminoParts = hrTermino.split(':');
                const inicioDate = new Date(0, 0, 0, parseInt(inicioParts[0]), parseInt(inicioParts[1]));
                const terminoDate = new Date(0, 0, 0, parseInt(terminoParts[0]), parseInt(terminoParts[1]));

                // Calculando a diferença em milissegundos
                const diffMilliseconds = terminoDate.getTime() - inicioDate.getTime();

                // Convertendo a diferença para horas
                const diffHours = diffMilliseconds / (1000 * 60 * 60);
                if (vlPago && diffHours) {
                    const total = diffHours * vlPago
                    hora.vlPagoColaborador = total;
                }
                return hora;
            })
            const totalSum = result.reduce((total, hora) => total + (hora.vlPagoColaborador || 0), 0);
            setSumTotalPago(totalSum)
            setCurrentCartaoPonto(result)
        }
    }

    return (
        <Box>
            <div style={{ display: 'flex', marginTop: '2rem', alignItems: 'center', justifyContent: 'center' }}>
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

                {/* <Input
                    key={`dtInicio-${key}`}
                    maxLength={10}
                    name="dtInicio"
                    onBlur={handleBlur}
                    label="Data Inicio"
                    value={values.dtInicio}
                    onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                    error={touched.dtInicio && errors.dtInicio ? errors.dtInicio : ''}
                    styleDiv={{ margin: '0 1rem', width: '20rem' }}
                />
                <Input
                    key={`dtTermino-${key}`}
                    maxLength={10}
                    name="dtTermino"
                    onBlur={handleBlur}
                    label="Data Termino"
                    value={values.dtTermino}
                    onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                    error={touched.dtTermino && errors.dtTermino ? errors.dtTermino : ''}
                    styleDiv={{ margin: '0 1rem', width: '20rem' }}
                /> */}
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
            </div>

            {currentCartaoPonto.length > 0 &&
                <>
                    <DivTable>
                        <TableContainer component={Paper} style={{ width: '72rem' }}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Data Trabalhada</TableCell>
                                        <TableCell>Hora de inicio</TableCell>
                                        <TableCell>Hora de saida</TableCell>
                                        <TableCell>Valor a Receber</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentCartaoPonto.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>{row.dtTrabalhada}</TableCell>
                                            <TableCell>{row.hrInicio}</TableCell>
                                            <TableCell>{row.hrTermino}</TableCell>
                                            <TableCell>{row.vlPagoColaborador && row.vlPagoColaborador % 1 === 0 ?
                                                ` ${row.vlPagoColaborador.toFixed(0)},00`
                                                :
                                                `${row.vlPagoColaborador?.toString().replace('.', ',')}`
                                            }</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DivTable>
                    <div>
                        <TotalValue>Valor Total: R$
                            {sumTotalPago && sumTotalPago % 1 === 0 ?
                                ` ${sumTotalPago?.toFixed(0)},00`
                                :
                                ` ${sumTotalPago?.toFixed(2).replace('.', ',')}`}
                        </TotalValue>
                    </div>
                </>
            }
        </Box>
    )
}