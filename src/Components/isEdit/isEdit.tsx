import { ChangeEvent } from "react";
import ClienteModel from "../../Pages/admin/cadastroClientes/model/cliente";
import { TitleDefault } from "../../Pages/admin/cadastroClientes/style";
import Input from "../input";
import ProdutosModel from "../../Pages/admin/cadastroProdutos/model/produtos";
import { BoxUp, ContainerFlutuante, ButtonStyled, ContianerMP, DivLineMP, Paragrafo } from "./style";



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
    setSelected: React.Dispatch<React.SetStateAction<any | undefined>>
    isCliente: boolean
}
export function IsEdit({ data, handleEditRow, inputsConfig, isEdit, products, setSelected, isCliente }: IsEditProps) {
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
    return (
        <>
            {isEdit &&
                <ContainerFlutuante >
                    <div>
                        <TitleDefault
                            style={{ margin: '0 0 8px 0' }}
                        >
                            {isCliente ? "Editar Cliente" : "Editar Produto"}
                        </TitleDefault>
                        <Paragrafo>
                            {
                                isCliente ?
                                    "Alterar dados do cliente e produtos vendidos"
                                    :
                                    "Alterar a matéria-prima ou a quantidade utilizada no produto"
                            }
                        </Paragrafo>
                    </div>
                    <BoxUp>
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
                    </BoxUp>
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
                                                label={isCliente ? "Valor do Produto" : "Quantidade"}
                                                name={produto.nmProduto}
                                                onChange={(e) => { isCliente ? handleChangeCliente(e, index) : handleChangeProduct(e, data, index) }}
                                                value={isCliente ? produto.vlVendaProduto : produto.quantidade}
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
            }
        </>
    )
}