import Input from "../input";
import { useEffect, useState } from 'react'
import { FormikErrors, FormikTouched } from "formik";
import { Autocomplete, Stack, TextField } from '@mui/material';
import { TitleDefault } from "../../Pages/admin/cadastroClientes/style";
import SituacaoProduto from "../../Pages/admin/compras/enumeration/situacaoProduto";
import { BoxClose, ButtonStyled, ContainerFlutuante, ContianerMP, DivClose, DivLineMP, Paragrafo, StyledAiOutlineClose } from "../isEdit/style";

interface IsEditProps {
    isAdding: boolean;
    data: any;
    products: any[];
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => Promise<void> | Promise<FormikErrors<any>>;
    setIsVisibleTpProduto: React.Dispatch<React.SetStateAction<any | undefined>>;
    addingScreen: 'Cliente' | 'Produto';
    touched?: FormikTouched<any>;
    errors?: FormikTouched<any>;

}
export function IsAdding({ data, isAdding, setFieldValue, setIsVisibleTpProduto, products, addingScreen, errors, touched }: IsEditProps) {
    const [filterTpProdutoFabricado, setFilterTpProdutoFabricado] = useState<any>()
    const [filterTpProdutoComprado, setFilterTpProdutoComprado] = useState<any>()


    useEffect(() => {
        if (addingScreen === 'Cliente') {
            const filterFabricado = data.filter((item: any) => item.tpProduto === SituacaoProduto.FABRICADO)
            setFilterTpProdutoFabricado(filterFabricado)
        } else {
            const filterComprado = data.filter((item: any) => item.tpProduto === SituacaoProduto.COMPRADO)
            setFilterTpProdutoComprado(filterComprado)
        }
    }, [data])


    //essa e a logica da tela de Cliente
    const handleChangeCliente = (e: React.SyntheticEvent<Element, Event>, value: any[]) => {
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
        console.log(produto)
        const newMpFabricado = [...products];
        const index = newMpFabricado.findIndex((item) => item.nmProduto === produto.nmProduto);
        newMpFabricado[index].vlVendaProduto = e.target.value;
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
                                        label="Selecione MP necessaria para fabricar"
                                        placeholder="matéria-prima"
                                    />
                                )}
                            />
                        </Stack>
                    </div>
                    {addingScreen === 'Produto' && touched && errors &&
                        (
                            (touched.mpFabricado && errors.mpFabricado) && (
                                //@ts-ignore
                                <div style={{ color: 'red' }}>{errors.mpFabricado}</div>
                            )
                        )
                    }
                    <ContianerMP>
                        {products &&
                            products.map((produto: any) => (
                                <>
                                    <ul>
                                        <DivLineMP>
                                            <div style={{ width: '18rem' }}>
                                                <li>{produto.nmProduto}</li>
                                            </div>
                                            <div>
                                                <Input
                                                    error=""
                                                    label={addingScreen === 'Cliente' ? "Valor do produto" : "Quantidade"}
                                                    name={produto.nmProduto}
                                                    onChange={(e) => { addingScreen === 'Cliente' ? handleChangeProdutoCliente(e, produto) : handleChangeMpProduto(e, produto) }}
                                                    value={addingScreen === 'Cliente' ? produto.vlVendaProduto : produto.quantidade}
                                                    raisedLabel
                                                    style={{ fontSize: '1rem' }}
                                                    styleLabel={{ marginTop: '-20px' }}
                                                    styleDiv={{ margin: '0', padding: 0 }}
                                                />
                                            </div>
                                        </DivLineMP>
                                    </ul>
                                </>
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