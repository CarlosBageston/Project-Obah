import Input from "../input";
import { ChangeEvent, SetStateAction } from "react";
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
    StyledAiOutlineClose
} from "./style";

export interface InputConfig {
    label: string;
    propertyName: string;
}

interface IsEditProps {
    isEdit: boolean;
    inputsConfig: InputConfig[];
    data: any;
    products: any[];
    handleEditRow: () => void;
    setSelected: React.Dispatch<React.SetStateAction<any | undefined>>;
    editingScreen: 'Cliente' | 'Produto' | 'Estoque' | 'Colaborador';
    setIsEdit: React.Dispatch<SetStateAction<boolean>>
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

export function IsEdit({ data, handleEditRow, inputsConfig, isEdit, products, setSelected, editingScreen, setIsEdit }: IsEditProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>, propertyName: string) => {
        const { value } = e.target;
        const newData = { ...data };
        newData[propertyName] = value;
        setSelected(newData);
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

    const windowClose = () => {
        if (editingScreen === 'Cliente') {
            setSelected([])
        }
    }
    return (
        <>
            {isEdit && (
                (editingScreen === 'Cliente' || editingScreen === 'Produto') ? (

                    <ContainerFlutuante >
                        <BoxClose>
                            <DivClose
                                onClick={() => setIsEdit(false)}
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
                                        error=""
                                        label={inputConfig.label}
                                        name={inputConfig.propertyName}
                                        onChange={(e) => handleChange(e, inputConfig.propertyName)}
                                        value={data[inputConfig.propertyName]}
                                        raisedLabel
                                        style={{ fontSize: '16px' }}
                                        styleLabel={{ marginTop: '0', fontSize: 12 }}
                                        styleDiv={{ margin: '0 0 1rem 0 ', padding: 0 }}
                                    />
                                </div>
                            ))}
                        </BoxTop>
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
                                                    error=""
                                                    label={editingScreen === 'Cliente' ? "Valor do Produto" : "Quantidade"}
                                                    name={produto.nmProduto}
                                                    onChange={(e) => { editingScreen === 'Cliente' ? handleChangeCliente(e, index) : handleChangeProduct(e, data, index) }}
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
                                onClick={handleEditRow}>
                                Concluído
                            </ButtonStyled>
                        </div>
                    </ContainerFlutuante>
                ) : (
                    <ContainerFlutuante >
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
                                        error=""
                                        label={inputConfig.label}
                                        name={inputConfig.propertyName}
                                        onChange={(e) => handleChange(e, inputConfig.propertyName)}
                                        value={data[inputConfig.propertyName]}
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