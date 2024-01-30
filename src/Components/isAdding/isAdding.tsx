import Input from "../input";
import { useEffect, useState } from 'react'
import { FormikErrors, FormikTouched } from "formik";
import { Autocomplete, Stack, TextField } from '@mui/material';
import { TitleDefault } from "../../Pages/admin/cadastroClientes/style";
import SituacaoProduto from "../../enumeration/situacaoProduto";
import { BoxClose, ButtonStyled, ContainerFlutuante, ContianerMP, DivClose, DivLineMP, Paragrafo, StyledAiOutlineClose } from "../isEdit/style";
import ProdutosModel from "../../Pages/admin/cadastroProdutos/model/produtos";
import GetData from "../../firebase/getData";
import useFormatCurrency from "../../hooks/formatCurrency";

interface IsAddingProps {
    isAdding: boolean;
    data: any;
    products: any[];
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => Promise<void> | Promise<FormikErrors<any>>;
    setIsVisibleTpProduto: React.Dispatch<React.SetStateAction<any | undefined>>;
    addingScreen: 'Cliente' | 'Produto';
    touched?: FormikTouched<any>;
    errors?: FormikTouched<any>;
}

/**
 * IsAdding Component
 * 
 * Este componente exibe um formulário flutuante para adicionar matérias-primas ou produtos.
 * O componente recebe várias propriedades para configurar e personalizar o comportamento do formulário.
 * Ele inclui a lógica e manipulação de eventos para selecionar matérias-primas ou produtos, especificar quantidades ou valores,
 * exibir erros de validação e concluir a adição.
 * O formulário flutuante é exibido apenas quando `isAdding` é verdadeiro.
 * 
 * @param isAdding Indica se o formulário flutuante de adição está visível.
 * @param data Os dados disponíveis para seleção de matérias-primas ou produtos.
 * @param products Os produtos selecionados ou as matérias-primas adicionadas.
 * @param setFieldValue Função para definir o valor de um campo no formulário.
 * @param setIsVisibleTpProduto Função para controlar a visibilidade do formulário flutuante.
 * @param addingScreen A tela de adição atual, que pode ser 'Cliente' ou 'Produto'.
 * @param errors Os erros de validação dos campos do formulário.
 * @param touched Os campos do formulário que foram tocados.
 * 
 * @returns Retorna o formulário flutuante de adição de matérias-primas ou produtos.
 */

function IsAdding({ data, isAdding, setFieldValue, setIsVisibleTpProduto, products, addingScreen, errors, touched }: IsAddingProps) {
    const [filterTpProdutoFabricado, setFilterTpProdutoFabricado] = useState<any>()
    const [filterTpProdutoComprado, setFilterTpProdutoComprado] = useState<any>()
    const {
        dataTable,
    } = GetData('Produtos', true) as { dataTable: ProdutosModel[] };

    const { formatCurrencyRealTime } = useFormatCurrency();

    useEffect(() => {
        if (addingScreen === 'Cliente') {
            const filterFabricado = data.filter((item: ProdutosModel) => item.tpProduto === SituacaoProduto.FABRICADO || item.stEntrega)
            setFilterTpProdutoFabricado(filterFabricado)
        } else {
            const filter = dataTable.filter(data => data.nmProduto.includes('Balde 10 Litros'))
            const filterComprado = data.filter((item: any) => item.tpProduto === SituacaoProduto.COMPRADO)
            if (filter.length > 0) {
                const objetoEncontrado = filter[0];
                objetoEncontrado.tpProduto = SituacaoProduto.COMPRADO;

                const newFilterComprado = [...filterComprado, objetoEncontrado]
                setFilterTpProdutoComprado(newFilterComprado)
            } else {
                setFilterTpProdutoComprado([...filterComprado])
            }
        }
    }, [data, dataTable])


    //essa e a logica da tela de Cliente
    const handleChangeCliente = (e: React.SyntheticEvent<Element, Event>, value: ProdutosModel[]) => {
        value.forEach(produto => {
            produto.vlVendaProduto = 0
        })
        setFieldValue('produtos', value);
    }

    //essa e a logica da tela de produto
    const handleChangeProduto = (e: React.SyntheticEvent<Element, Event>, value: any[]) => {
        setFieldValue('mpFabricado',
            value.map((mp) => ({
                nmProduto: mp.nmProduto,
            }))
        )
    }

    //essa e a logica da tela de produto
    const handleChangeMpProduto = (e: React.ChangeEvent<HTMLInputElement>, mp: any) => {
        const newMpFabricado = [...products];
        const index = newMpFabricado.findIndex((item) => item.nmProduto === mp.nmProduto);
        newMpFabricado[index].quantidade = e.target.value.replace(',', '.');
        setFieldValue("mpFabricado", newMpFabricado);
    }
    //essa e a logica da tela de Cliente
    const handleChangeProdutoCliente = (e: React.ChangeEvent<HTMLInputElement>, produto: any) => {
        const newMpFabricado = [...products];
        const index = newMpFabricado.findIndex((item) => item.nmProduto === produto.nmProduto);
        newMpFabricado[index].vlVendaProduto = formatCurrencyRealTime(e.target.value)
        setFieldValue("produtos", newMpFabricado);
    }

    const windowClose = () => {
        if (addingScreen === 'Produto') {
            //essa e a logica da tela de produto
            setFieldValue("mpFabricado", '');
            setIsVisibleTpProduto(false)
            setFieldValue("tpProduto", null);
        } else {
            //essa e a logica da tela de Cliente
            setFieldValue("produtos", '');
            setIsVisibleTpProduto(false)
        }
    }
    return (
        <>
            {isAdding &&
                <ContainerFlutuante >
                    <BoxClose>
                        <DivClose
                            style={{ top: '-22px' }}
                            onClick={() => windowClose()}
                        >
                            <StyledAiOutlineClose />
                        </DivClose>
                    </BoxClose>
                    <div style={{ marginTop: '-4rem' }}>
                        <TitleDefault style={{ margin: '0 0 8px 0' }}>
                            {addingScreen === 'Produto' ? "Matéria-Prima" : "Produtos"}
                        </TitleDefault>
                        <Paragrafo>
                            {addingScreen === 'Produto' ?
                                'Informe a matéria-prima e a quantidade utilizada no produto a ser cadastrado'
                                :
                                'Informe os Produtos e os valores de venda a serem cadastrados'
                            }
                        </Paragrafo>
                    </div>
                    <div>
                        <Stack spacing={3} sx={{ width: 500 }}>
                            <Autocomplete
                                multiple
                                id="tags-standard"
                                options={addingScreen === 'Cliente' ? filterTpProdutoFabricado : filterTpProdutoComprado}
                                getOptionLabel={(item: any) => item.nmProduto}
                                onChange={(e, value) => { addingScreen === 'Cliente' ? handleChangeCliente(e, value) : handleChangeProduto(e, value) }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label={addingScreen === 'Cliente' ? "Selecione os Prdutos vendidos a esse cliente" : "Selecione MP necessaria para fabricar"}
                                        placeholder={addingScreen === 'Cliente' ? "Produtos" : "matéria-prima"}
                                    />
                                )}
                            />
                        </Stack>
                    </div>
                    {addingScreen === 'Produto' && touched && errors &&
                        (
                            (touched.mpFabricado && errors.mpFabricado) && (
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-ignore
                                <div style={{ color: 'red' }}>{errors.mpFabricado}</div>
                            )
                        )
                    }
                    <ContianerMP>
                        {products &&
                            products.map((produto: any) => (
                                <ul key={produto.id}>
                                    <DivLineMP>
                                        <div style={{ width: '18rem' }}>
                                            <li>{produto.nmProduto}</li>
                                        </div>
                                        <div>
                                            <Input
                                                key={produto.id}
                                                error=""
                                                label={addingScreen === 'Cliente' ? "Valor do produto" : "Quantidade"}
                                                name={produto.nmProduto}
                                                onChange={(e) => { addingScreen === 'Cliente' ? handleChangeProdutoCliente(e, produto) : handleChangeMpProduto(e, produto) }}
                                                value={addingScreen === 'Cliente' ? (produto.vlVendaProduto !== 0 ? produto.vlVendaProduto : '') : produto.quantidade}
                                                raisedLabel
                                                style={{ fontSize: '1rem' }}
                                                styleLabel={{ marginTop: '-20px' }}
                                                styleDiv={{ margin: '0', padding: 0 }}
                                            />
                                        </div>
                                    </DivLineMP>
                                </ul>
                            ))}
                    </ContianerMP>
                    <div>
                        <ButtonStyled
                            onClick={() => setIsVisibleTpProduto(false)}>
                            Concluído
                        </ButtonStyled>
                    </div>
                </ContainerFlutuante>
            }
        </>
    )
}

export default IsAdding;