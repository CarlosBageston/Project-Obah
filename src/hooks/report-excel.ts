import ExcelJS from 'exceljs';


export const generateReport = async ( somaTotalEntregas: number, somaTotalVendas: number ) => {

    // Criação da planilha Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RelatorioMensal');

    worksheet.views = [
        {
            showGridLines: false,
        },
    ];

    const styleBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' },
    };

    const styleBorderParcial: Partial<ExcelJS.Borders> = {
        left: { style: 'thick' },
        right: { style: 'thick' },
    };

    const styleFill: ExcelJS.Fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E6E6E6' },
    };

    const styleFontWithBold: Partial<ExcelJS.Font> = { bold: true, name: 'Times New Roman', size: 9 }
    const styleFont: Partial<ExcelJS.Font> = { name: 'Times New Roman' }

    const cellA1 = worksheet.getCell('A1');
    const cellA2 = worksheet.getCell('A2');
    const cellA3 = worksheet.getCell('A3');
    const cellA4 = worksheet.getCell('A4');
    const cellA5 = worksheet.getCell('A5');
    const cellA6 = worksheet.getCell('A6');
    const cellA7 = worksheet.getCell('A7');
    const cellA8 = worksheet.getCell('A8');
    const cellA9 = worksheet.getCell('A9');
    const cellA10 = worksheet.getCell('A10');
    const cellA11 = worksheet.getCell('A11');
    const cellA12 = worksheet.getCell('A12');
    const cellA13 = worksheet.getCell('A13');
    const cellA14 = worksheet.getCell('A14');
    const cellA15 = worksheet.getCell('A15');
    const cellA16 = worksheet.getCell('A16');
    const cellA17 = worksheet.getCell('A17');
    const cellA18 = worksheet.getCell('A18');
    const cellA19 = worksheet.getCell('A19');
    const cellA20 = worksheet.getCell('A20');
    const cellA21 = worksheet.getCell('A21');

    const cellB6 = worksheet.getCell('B6');
    const cellB7 = worksheet.getCell('B7');
    const cellB8 = worksheet.getCell('B8');
    const cellB10 = worksheet.getCell('B10');
    const cellB11 = worksheet.getCell('B11');
    const cellB12 = worksheet.getCell('B12');
    const cellB14 = worksheet.getCell('B14');
    const cellB15 = worksheet.getCell('B15');
    const cellB16 = worksheet.getCell('B16');
    const cellB17 = worksheet.getCell('B17');
    const cellB18 = worksheet.getCell('B18');

    cellA1.value = 'RELATÓRIO MENSAL DAS RECEITAS BRUTAS';
    cellA2.value = 'CNPJ: 52.193.214/0001-25';
    cellA3.value = 'Empreendedor individual: Carlos Eduardo Bageston';
    cellA4.value = 'Período de apuração: 11/2023';
    cellA5.value = 'RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO) ';
    cellA6.value = 'I – Revenda de mercadorias com dispensa de emissão de documento fiscal ';
    cellA7.value = 'II – Revenda de mercadorias com documento fiscal emitido ';
    cellA8.value = 'III – Total das receitas com revenda de mercadorias (I + II) ';
    cellA9.value = 'RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)  ';
    cellA10.value = 'IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal  ';
    cellA11.value = 'V – Venda de produtos industrializados com documento fiscal emitido  ';
    cellA12.value = 'VI – Total das receitas com venda de produtos industrializados (IV + V)  ';
    cellA13.value = 'RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS   ';
    cellA14.value = 'VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal  ';
    cellA15.value = 'VIII – Receita com prestação de serviços com documento fiscal emitido ';
    cellA16.value = 'IX – Total das receitas com prestação de serviços (VII + VIII) ';
    cellA17.value = 'X - Total geral das receitas brutas no mês (III + VI + IX)  ';
    cellA18.value = 'LOCAL E DATA:  ';
    cellA19.value = '  ENCONTRAM-SE ANEXADOS E ESTE RELATÓRIO:';
    cellA20.value = '  - Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período;';
    cellA21.value = '  - As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.';

    cellB6.value = somaTotalVendas ? somaTotalVendas : 'R$ ';
    cellB7.value = 'R$ ';
    cellB8.value = 'R$ ';
    cellB10.value = 'R$ ';
    cellB11.value = somaTotalEntregas ? somaTotalEntregas : 'R$ ';
    cellB12.value = 'R$ ';
    cellB14.value = 'R$ ';
    cellB15.value = 'R$ ';
    cellB16.value = 'R$ ';
    cellB17.value = 'R$ ';
    cellB18.value = 'ASSINATURA DO EMPRESÁRIO: ';


    cellA1.font = { bold: true, name: 'Times New Roman', size: 11 };
    cellA5.font = styleFontWithBold;
    cellA9.font = styleFontWithBold;
    cellA13.font = styleFontWithBold;
    cellA17.font = { bold: true, name: 'Times New Roman', size: 11 };

    cellA2.font = styleFont;
    cellA3.font = styleFont;
    cellA4.font = styleFont;
    cellA6.font = styleFont;
    cellA7.font = styleFont;
    cellA8.font = styleFont;
    cellA10.font = styleFont;
    cellA11.font = styleFont;
    cellA12.font = styleFont;
    cellA14.font = styleFont;
    cellA15.font = styleFont;
    cellA16.font = styleFont;
    cellA18.font = { name: 'Times New Roman', size: 9 };
    cellA19.font = { name: 'Times New Roman', size: 9 };
    cellA20.font = { name: 'Times New Roman', size: 9 };
    cellA21.font = { name: 'Times New Roman', size: 9 };


    cellB18.font = styleFontWithBold;

    cellA1.border = styleBorder;
    cellA2.border = styleBorder;
    cellA3.border = styleBorder;
    cellA4.border = styleBorder;
    cellA5.border = styleBorder;
    cellA6.border = styleBorder;
    cellA7.border = styleBorder;
    cellA8.border = styleBorder;
    cellA9.border = styleBorder;
    cellA10.border = styleBorder;
    cellA11.border = styleBorder;
    cellA12.border = styleBorder;
    cellA13.border = styleBorder;
    cellA14.border = styleBorder;
    cellA15.border = styleBorder;
    cellA16.border = styleBorder;
    cellA17.border = styleBorder;
    cellA18.border = styleBorder;
    cellA19.border = styleBorderParcial;
    cellA20.border = styleBorderParcial;
    cellA21.border = {
        left: { style: 'thick' },
        right: { style: 'thick' },
        bottom: { style: 'thick' }
    };

    cellB6.border = styleBorder;
    cellB7.border = styleBorder;
    cellB8.border = styleBorder;
    cellB10.border = styleBorder;
    cellB11.border = styleBorder;
    cellB12.border = styleBorder;
    cellB14.border = styleBorder;
    cellB15.border = styleBorder;
    cellB16.border = styleBorder;
    cellB17.border = styleBorder;
    cellB18.border = styleBorder;

    cellB6.font = styleFont;
    cellB7.font = styleFont;
    cellB8.font = styleFont;
    cellB10.font = styleFont;
    cellB11.font = styleFont;
    cellB12.font = styleFont;
    cellB14.font = styleFont;
    cellB15.font = styleFont;
    cellB16.font = styleFont;
    cellB17.font = { bold: true, name: 'Times New Roman', size: 11 };
    cellB18.font = { name: 'Times New Roman', size: 9 };



    cellA1.fill = styleFill;
    cellA5.fill = styleFill;
    cellA9.fill = styleFill;
    cellA13.fill = styleFill;

    cellA1.alignment = { vertical: 'middle', horizontal: 'center' };
    cellA2.alignment = { vertical: 'middle' };
    cellA3.alignment = { vertical: 'middle' };
    cellA4.alignment = { vertical: 'middle' };
    cellA5.alignment = { vertical: 'middle' };
    cellA6.alignment = { vertical: 'middle' };
    cellA7.alignment = { vertical: 'middle' };
    cellA8.alignment = { vertical: 'middle' };
    cellA9.alignment = { vertical: 'middle' };
    cellA9.alignment = { vertical: 'middle' };
    cellA10.alignment = { vertical: 'middle', wrapText: true };
    cellA11.alignment = { vertical: 'middle' };
    cellA12.alignment = { vertical: 'middle' };
    cellA13.alignment = { vertical: 'middle' };
    cellA14.alignment = { vertical: 'middle', wrapText: true };
    cellA15.alignment = { vertical: 'middle' };
    cellA16.alignment = { vertical: 'middle' };
    cellA17.alignment = { vertical: 'middle' };
    cellA18.alignment = { vertical: 'top' };
    cellA19.alignment = { vertical: 'top' };
    cellA20.alignment = { vertical: 'top' };
    cellA21.alignment = { vertical: 'top' };

    cellB6.alignment = { vertical: 'middle' };
    cellB7.alignment = { vertical: 'middle' };
    cellB8.alignment = { vertical: 'middle' };
    cellB10.alignment = { vertical: 'middle' };
    cellB11.alignment = { vertical: 'middle' };
    cellB12.alignment = { vertical: 'middle' };
    cellB14.alignment = { vertical: 'middle' };
    cellB15.alignment = { vertical: 'middle' };
    cellB16.alignment = { vertical: 'middle' };
    cellB17.alignment = { vertical: 'middle' };
    cellB18.alignment = { vertical: 'top' };

    worksheet.mergeCells('A1:B1');
    worksheet.mergeCells('A2:B2');
    worksheet.mergeCells('A3:B3');
    worksheet.mergeCells('A4:B4');
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('A9:B9');
    worksheet.mergeCells('A13:B13');
    worksheet.mergeCells('A19:B19');
    worksheet.mergeCells('A20:B20');
    worksheet.mergeCells('A21:B21');

    // Definir altura específica para a linha 1
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 30;
    worksheet.getRow(3).height = 30;
    worksheet.getRow(4).height = 30;
    worksheet.getRow(5).height = 30;
    worksheet.getRow(6).height = 30;
    worksheet.getRow(7).height = 30;
    worksheet.getRow(8).height = 30;
    worksheet.getRow(9).height = 30;
    worksheet.getRow(10).height = 30;
    worksheet.getRow(11).height = 30;
    worksheet.getRow(12).height = 30;
    worksheet.getRow(13).height = 30;
    worksheet.getRow(14).height = 30;
    worksheet.getRow(15).height = 30;
    worksheet.getRow(16).height = 30;
    worksheet.getRow(17).height = 30;
    worksheet.getRow(18).height = 45;
    worksheet.getRow(19).height = 15;
    worksheet.getRow(20).height = 11;
    worksheet.getRow(21).height = 40;

    // Definir larguras específicas para colunas A e B
    worksheet.columns = [{ width: 65 }, { width: 35 }];

    // Geração do arquivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_mensal.xlsx';
    link.click();
};