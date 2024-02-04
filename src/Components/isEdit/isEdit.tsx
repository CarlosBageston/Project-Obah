import Input from "../input";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { TitleDefault } from "../../Pages/admin/cadastroClientes/style";
import ClienteModel from "../../Pages/admin/cadastroClientes/model/cliente";
import ProdutosModel from "../../Pages/admin/cadastroProdutos/model/produtos";
import {
    BoxTop,
    DivClose,
    BoxClose,
    BoxBottom,
    Paragrafo,
    DivLineMP,
    ContianerMP,
    ButtonStyled,
    ContainerFlutuante,
    StyledAiOutlineClose,
    StyledIoMdAdd,
    DivIsAdding,
    StyledMdDone,
    Error
} from "./style";
import { Autocomplete, Stack, TextField } from "@mui/material";
import SituacaoProduto from "../../enumeration/situacaoProduto";
import useFormatCurrency from "../../hooks/formatCurrency";
export interface InputConfig {
    label: string;
    propertyName: string;
    type?: 'number' | 'string',
    isCurrency?: boolean,
    isDisable?: boolean
}

interface IsEditProps {
    isEdit: boolean;
    inputsConfig: InputConfig[];
    selected: any;
    products: any[];
    handleEditRow: () => void;
    setSelected: React.Dispatch<React.SetStateAction<any | undefined>>;
    editingScreen: 'Cliente' | 'Produto' | 'Estoque' | 'Colaborador';
    setIsEdit: React.Dispatch<SetStateAction<boolean>>
    newData?: any
}

/**
 * IsEdit Component
 * 
 * Este componente exibe um formulário flutuante para editar os dados de um cliente, produto ou estoque.
 * O componente recebe várias propriedades para configurar e personalizar o formulário de edição.
 * Ele inclui a lógica e manipulação de eventos para alterar os valores dos campos do formulário,
 * formatar valores monetários, exibir os campos de acordo com a tela de edição selecionada,
 * e concluir a edição dos dados.
 * O formulário flutuante de edição é exibido apenas quando `isEdit` é verdadeiro.
 * 
 * @param isEdit Indica se o formulário flutuante de edição está visível.
 * @param inputsConfig As configurações dos campos de entrada do formulário.
 * @param data Os dados a serem editados.
 * @param products Os produtos ou matérias-primas relacionados ao cliente ou produto a serem editados.
 * @param handleEditRow Função para concluir a edição dos dados.
 * @param setSelected Função para definir os dados selecionados ou editados.
 * @param editingScreen A tela de edição atual, que pode ser 'Cliente', 'Produto' ou 'Estoque'.
 * @param setIsEdit Função para controlar a visibilidade do formulário flutuante de edição.
 * 
 * @returns Retorna o formulário flutuante de edição de clientes, produtos ou estoque.
 */

function IsEdit({ selected, handleEditRow, inputsConfig, isEdit, products, setSelected, editingScreen, setIsEdit, newData: dataSelected }: IsEditProps) {
    const [isAdding, setIsAdding] = useState<boolean>(false)
    const [filterTpProdutoFabricado, setFilterTpProdutoFabricado] = useState<any>()
    const [filterTpProdutoComprado, setFilterTpProdutoComprado] = useState<any>()
    const [newProduct, setNewProduct] = useState<any>()
    const [error, setError] = useState<string>('')

    const { NumberFormatForBrazilianCurrency, formatCurrencyRealTime } = useFormatCurrency();


    useEffect(() => {
        if (dataSelected) {
            if (editingScreen === 'Cliente') {
                const filterFabricado: ProdutosModel[] = dataSelected.filter((item: ProdutosModel) => item.tpProduto === SituacaoProduto.FABRICADO || item.stEntrega)
                setFilterTpProdutoFabricado(filterFabricado)
            } else {
                const filter = dataSelected.filter((data: ProdutosModel) => data.nmProduto.includes('Balde 10 Litros'))
                const filterComprado = dataSelected.filter((item: any) => item.tpProduto === SituacaoProduto.COMPRADO)
                if (filter.length > 0) {
                    const objetoEncontrado = filter[0];
                    objetoEncontrado.tpProduto = SituacaoProduto.COMPRADO;

                    const newFilterComprado = [...filterComprado, objetoEncontrado]
                    setFilterTpProdutoComprado(newFilterComprado)
                } else {
                    setFilterTpProdutoComprado([...filterComprado])
                }
            }
        }
    }, [dataSelected])
    useEffect(() => {
        if (isEdit) {
            const formattedData = { ...selected };

            inputsConfig.forEach(inputConfig => {
                const propertyName = inputConfig.propertyName;
                const value = selected[propertyName];

                if (inputConfig.isCurrency && typeof value === 'number') {
                    formattedData[propertyName] = NumberFormatForBrazilianCurrency(value);
                }
            });
            if (editingScreen === 'Cliente') {
                const produto = formattedData.produtos.map((produto: ProdutosModel) => {
                    produto.vlVendaProduto = NumberFormatForBrazilianCurrency(produto.vlVendaProduto) as unknown as number
                })
                setSelected(produto)
            }
            setSelected(formattedData);
        }
    }, [isEdit]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>, propertyName: string, type: 'string' | 'number', isCurrency: boolean | undefined) => {
        const { value } = e.target;
        if (type && type === 'number') {
            const newData = { ...selected };
            const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
            newData[propertyName] = isNaN(numericValue) ? null : numericValue;
            setSelected(newData);
        } else if (isCurrency) {
            const newData = { ...selected };
            newData[propertyName] = formatCurrencyRealTime(value);
            setSelected(newData);
        } else {
            const newData = { ...selected };
            newData[propertyName] = value;
            setSelected(newData);
        }
    };
    function formatarValor(valor: string) {
        const inputText = valor.replace(/\D/g, "");
        let formattedText = "";
        if (inputText.length <= 2) {
            formattedText = inputText;
        } else {
            const regex = /^(\d*)(\d{2})$/;
            formattedText = inputText.replace(regex, '$1,$2');
        }
        return inputText ? "R$ " + formattedText : "";
    }

    const handleChangeCliente = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const valorFormatado = formatarValor(e.target.value);
        const updatedProdutos = products.map((produto, i) => {
            if (i === index) {
                return {
                    ...produto,
                    vlVendaProduto: valorFormatado,
                };
            }
            return produto;
        });
        setSelected((prevSelected: ClienteModel | undefined) => ({
            ...prevSelected,
            produtos: updatedProdutos || [],
        } as ClienteModel | undefined));
    }
    const handleChangeProduct = (e: ChangeEvent<HTMLInputElement>, selected: any, index: number) => {
        const newMps = [...selected.mpFabricado];
        newMps[index].quantidade = e.target.value;
        setSelected((prevSelected: ProdutosModel | undefined) => ({
            ...prevSelected,
            mpFabricado: newMps,
        } as ProdutosModel | undefined));
    }

    function handleEventEdit() {
        if (editingScreen === 'Cliente') {
            const isValid = selected.produtos.some((product: ProdutosModel) => !product.vlVendaProduto)
            if (isValid) {
                setError("Valor do Produto não preenchido")
            } else {
                handleEditRow();
                setError('')
                setIsAdding(false);
            }
        } else {
            const isValid = selected.mpFabricado.some((product: any) => !product.quantidade)
            if (isValid) {
                setError("Valor do Produto não preenchido")
            } else {
                handleEditRow();
                setError('')
                setIsAdding(false);
            }
        }
    }

    //essa e a logica para adicionar novo produto na tela de Cliente usando o isEdit.
    const handleChangeProdutoAdding = (e: React.SyntheticEvent<Element, Event>, value: any) => {
        if (editingScreen === 'Cliente') {
            const encontrado: ProdutosModel = dataSelected.find((product: ProdutosModel) => product.nmProduto === value.nmProduto)
            if (encontrado) {
                const newValue = { ...encontrado, vlVendaProduto: undefined }
                setNewProduct(newValue)
            }
        } else {
            const newValue = { nmProduto: value.nmProduto, quantidade: undefined }
            setNewProduct(newValue)
        }
    }
    function addingNewProduct() {
        if (editingScreen === 'Cliente') {
            if (selected.produtos.find((product: ProdutosModel) => product.nmProduto === newProduct.nmProduto)) return setError('Produto já existe na lista')
            setSelected((prevSelected: ClienteModel | undefined) => ({
                ...prevSelected,
                produtos: [...(prevSelected?.produtos || []), newProduct],
            } as ClienteModel | undefined));
            setError('')
        } else {
            if (selected.mpFabricado.find((product: ProdutosModel) => product.nmProduto === newProduct.nmProduto)) return setError('Produto já existe na lista')
            setSelected((prevSelected: ProdutosModel | undefined) => ({
                ...prevSelected,
                mpFabricado: [...(prevSelected?.mpFabricado || []), newProduct],
            } as ProdutosModel | undefined));
            setError('')
        }
    }
    return (
        <>
            {isEdit && (
                (editingScreen === 'Cliente' || editingScreen === 'Produto') ? (

                    <ContainerFlutuante >
                        <BoxClose>
                            <DivClose
                                onClick={() => { setIsEdit(false); setIsAdding(false); setError('') }}
                            >
                                <StyledAiOutlineClose />
                            </DivClose>
                        </BoxClose>
                        <div>
                            <TitleDefault
                                style={{ margin: '0 0 8px 0' }}
                            >
                                {editingScreen === 'Cliente' ? "Editar Cliente" : "Editar Produto"}
                            </TitleDefault>
                            <Paragrafo>
                                {
                                    editingScreen === 'Cliente' ?
                                        "Editar dados do cliente e produtos vendidos"
                                        :
                                        "Editar a matéria-prima ou a quantidade utilizada no produto"
                                }
                            </Paragrafo>
                        </div>
                        <BoxTop>
                            {inputsConfig.map((inputConfig) => (
                                <div key={inputConfig.propertyName}>
                                    <Input
                                        disabled={inputConfig.isDisable}
                                        key={inputConfig.propertyName}
                                        error=""
                                        label={inputConfig.label}
                                        name={inputConfig.propertyName}
                                        onChange={(e) => handleChange(e, inputConfig.propertyName, inputConfig.type ? inputConfig.type : 'string', inputConfig.isCurrency)}
                                        value={inputConfig.isCurrency ? NumberFormatForBrazilianCurrency(selected[inputConfig.propertyName]) : selected[inputConfig.propertyName]}
                                        raisedLabel
                                        style={{ fontSize: '16px' }}
                                        styleLabel={{ marginTop: '0', fontSize: 12 }}
                                        styleDiv={{ margin: '0 0 1rem 0 ', padding: 0 }}
                                    />
                                </div>
                            ))}
                        </BoxTop>
                        <DivIsAdding>
                            {isAdding ? (
                                <div style={{ height: '5rem' }}>
                                    <div style={{ width: '16rem' }}>
                                        <Stack spacing={3} sx={{ width: 250 }}>
                                            <Autocomplete
                                                id="tags-standard"
                                                options={editingScreen === 'Cliente' ? filterTpProdutoFabricado : filterTpProdutoComprado}
                                                getOptionLabel={(item: any) => item.nmProduto}
                                                onChange={(e, value) => { handleChangeProdutoAdding(e, value) }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="standard"
                                                        label={editingScreen === 'Cliente' ? "Selecione os Prdutos vendidos a esse cliente" : "Selecione MP necessaria para fabricar"}
                                                        placeholder={editingScreen === 'Cliente' ? "Produtos" : "matéria-prima"}
                                                    />
                                                )}
                                            />
                                        </Stack>
                                    </div>
                                    <Error>{error ? error : ''}</Error>
                                </div>
                            ) : (
                                <div>
                                    {editingScreen === 'Cliente' ? <p>adicionar um novo produto</p> : <p>adicionar uma nova matéria-prima</p>}
                                </div>
                            )}
                            {!isAdding &&
                                <div onClick={() => setIsAdding(!isAdding)}>
                                    <StyledIoMdAdd />
                                </div>
                            }
                            <div onClick={addingNewProduct}>
                                {isAdding && (<StyledMdDone />)}
                            </div>
                        </DivIsAdding>
                        <ContianerMP>
                            {products.map((produto, index) => (
                                <>
                                    <ul>
                                        <DivLineMP>
                                            <div style={{ width: '18rem' }}>
                                                <li>{produto.nmProduto}</li>
                                            </div>
                                            <div>
                                                <Input
                                                    key={produto.id}
                                                    error=""
                                                    label={editingScreen === 'Cliente' ? "Valor do Produto" : "Quantidade"}
                                                    name={produto.nmProduto}
                                                    onChange={(e) => { editingScreen === 'Cliente' ? handleChangeCliente(e, index) : handleChangeProduct(e, selected, index) }}
                                                    value={editingScreen === 'Cliente' ? produto.vlVendaProduto : produto.quantidade}
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
                                onClick={handleEventEdit}>
                                Concluído
                            </ButtonStyled>
                        </div>
                    </ContainerFlutuante>
                ) : (
                    <ContainerFlutuante >
                        <BoxClose>
                            <DivClose
                                onClick={() => setIsEdit(false)}
                            >
                                <StyledAiOutlineClose />
                            </DivClose>
                        </BoxClose>
                        <div>
                            <TitleDefault style={{ margin: '0 0 8px 0' }}>
                                {
                                    editingScreen === 'Estoque' ?
                                        'Editar Estoque'
                                        :
                                        'Editar Colaborador'
                                }
                            </TitleDefault>
                            <Paragrafo>
                                {
                                    editingScreen === 'Estoque' ?
                                        'Editar produtos do estoque'
                                        :
                                        'Editar Informações do Colaborador'
                                }
                            </Paragrafo>
                        </div>
                        <BoxBottom>
                            {inputsConfig.map((inputConfig) => (
                                <div key={inputConfig.propertyName}>
                                    <Input
                                        disabled={inputConfig.isDisable}
                                        key={inputConfig.propertyName}
                                        error=""
                                        label={inputConfig.label}
                                        name={inputConfig.propertyName}
                                        onChange={(e) => handleChange(e, inputConfig.propertyName, inputConfig.type ? inputConfig.type : 'string', inputConfig.isCurrency)}
                                        value={inputConfig.isCurrency ? NumberFormatForBrazilianCurrency(selected[inputConfig.propertyName]) : selected[inputConfig.propertyName]}
                                        raisedLabel
                                        style={{ fontSize: '16px' }}
                                        styleLabel={{ marginTop: '0', fontSize: 12 }}
                                        styleDiv={{ margin: '0 0 1rem 0 ', padding: 0 }}
                                    />
                                </div>
                            ))}
                        </BoxBottom>
                        <div>
                            <ButtonStyled
                                onClick={handleEditRow}>
                                Concluído
                            </ButtonStyled>
                        </div>
                    </ContainerFlutuante>
                )
            )}
        </>
    )
}
export default IsEdit;