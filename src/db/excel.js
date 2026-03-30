import ExcelJS from "exceljs";

async function create_export(stream, data) {
    // setup workbook
    const workbook = new ExcelJS.Workbook();
    workbook.calcProperties.fullCalcOnLoad = true;

    const worksheet = workbook.addWorksheet("inventory");

    // this should really be from a single source of truth...
    worksheet.columns = [
        { header: "序号", key: "warehouse_id", width: 10 },     // A
        { header: "SKU", key: "sku", width: 20 },               // B
        { header: "尺寸", key: "size", width: 10 },             // C
        { header: "备注", key: "notes", width: 10 },            // D
        { header: "数量", key: "quantity", width: 10 },         // E
        { header: "状况", key: "condition", width: 20 },        // F
        { header: "入仓日期", key: "inbounddate", width: 20 },  // G
        { header: "出仓日期", key: "outbounddate", width: 20 }, // H
        { header: "处理", key: "status", width: 20 },           // I
    ];

    for (const row of data) {
        const excelRow = { ...row };

        // for some columns, convert string to better datatype
        excelRow.inbounddate = excelRow.inbounddate ? new Date(excelRow.inbounddate) : null;
        excelRow.outbounddate = excelRow.outbounddate ? new Date(excelRow.outbounddate) : null;
        excelRow.quantity = +excelRow.quantity;

        worksheet.addRow(excelRow);
    }

    // conditional formatting styles
    const GRAY_BG = {
        fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF6F6F7A" } },
        // border: {
        //     top: { style: "thin" },
        //     left: { style: "thin" },
        //     bottom: { style: "thin" },
        //     right: { style: "thin" },
        // }
    };

    const YELLOW_BG = {
        fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFFF00" } },
        // border: {
        //     top: { style: "thin" },
        //     left: { style: "thin" },
        //     bottom: { style: "thin" },
        //     right: { style: "thin" },
        // }
    };

    // apply conditional formatting
    worksheet.addConditionalFormatting({
        ref: `A2:I${data.length + 1}`,
        rules: [
            {
                type: "expression",
                formulae: [ '=OR($I2="报废", $I2="弃置")' ],
                style: GRAY_BG,
            }
        ],
    });

    worksheet.addConditionalFormatting({
        ref: `A2:I${data.length + 1}`,
        rules: [
            {
                type: "expression",
                formulae: [ "=$H2>$G2" ],
                style: YELLOW_BG,
            }
        ],
    });

    // send off the workbook
    await workbook.xlsx.write(stream);
    stream.end();

}

async function monthly_summary(stream, data, enddate, rate) {
    // setup workbook
    const workbook = new ExcelJS.Workbook();
    workbook.calcProperties.fullCalcOnLoad = true;

    const worksheet = workbook.addWorksheet("inventory");

    // this should really be from a single source of truth...
    worksheet.columns = [
        { header: "序号", key: "warehouse_id", width: 10 },     // A
        { header: "SKU", key: "sku", width: 20 },               // B
        { header: "尺寸", key: "size", width: 10 },             // C
        { header: "备注", key: "notes", width: 10 },            // D
        { header: "数量", key: "quantity", width: 10 },         // E
        { header: "状况", key: "condition", width: 20 },        // F
        { header: "入仓日期", key: "inbounddate", width: 20 },  // G
        { header: "出仓日期", key: "outbounddate", width: 20 }, // H
        { header: "处理", key: "status", width: 20 },           // I
        { header: "天数", key: "daycount", width: 10 },         // J
        { header: "率", key: "rate", width: 10 },               // K
        { header: "x", key: "multiply", width: 10},             // L
    ];

    for (const row of data) {
        // inherit the columns from the database
        const excelRow = { ...row };

        // for some columns, convert string to better datatype
        excelRow.inbounddate = excelRow.inbounddate ? new Date(excelRow.inbounddate) : null;
        excelRow.outbounddate = excelRow.outbounddate ? new Date(excelRow.outbounddate) : null;
        excelRow.quantity = +excelRow.quantity;

        // non-formula columns that aren't native to the row we got
        excelRow.rate = excelRow.status === "二次销售" ? rate : 0;

        worksheet.addRow(excelRow);
    }

    // put the enddate in the cell
    worksheet.getCell("N1").value = "结束日期";
    worksheet.getCell("N2").value = enddate;

    // apply daycount
    // first set master cell to first row, and slave cells all the way down
    worksheet.getCell("J2").value = {
        formula: '=IF(AND(G2<=$N$2, G2<>"", $I2="二次销售"), IF(EOMONTH(G2,0)=EOMONTH($N$2,0), DAY(G2), DAY($N$2)), 0)',
        shareType: "shared",
        ref: `J2:J${data.length + 1}`,
    };

    // then cascade the formula down
    for (let index = 1; index < data.length; index++) {
        worksheet.getCell(`J${index + 2}`).value = { sharedFormula: "J2" };
    }

    // apply multiplying
    worksheet.getCell("L2").value = {
        formula: '=$J2*$K2',
        shareType: "shared",
        ref: `L2:L${data.length + 1}`,
    }

    // cascading it down
    for (let index = 1; index < data.length; index++) {
        worksheet.getCell(`L${index + 2}`).value = { sharedFormula: "L2" };
    }

    // add summary lines to the bottom of the table
    // these column names don't mean anything, they're just to position
    // TODO: stop using data.length ffs
    worksheet.addRow({
        rate: "Total",
        multiply: { formula: `=SUM(L2:L${data.length + 1})` },
    });

    // conditional formatting styles
    const GRAY_BG = {
        fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF6F6F7A" } },
        // border: {
        //     top: { style: "thin" },
        //     left: { style: "thin" },
        //     bottom: { style: "thin" },
        //     right: { style: "thin" },
        // }
    };

    const YELLOW_BG = {
        fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFFF00" } },
        // border: {
        //     top: { style: "thin" },
        //     left: { style: "thin" },
        //     bottom: { style: "thin" },
        //     right: { style: "thin" },
        // }
    };

    // apply conditional formatting
    worksheet.addConditionalFormatting({
        ref: `A2:L${data.length + 1}`,
        rules: [
            {
                type: "expression",
                formulae: [ '=OR($I2="报废", $I2="弃置")' ],
                style: GRAY_BG,
            }
        ],
    });

    worksheet.addConditionalFormatting({
        ref: `A2:L${data.length + 1}`,
        rules: [
            {
                type: "expression",
                formulae: [ "=$H2>$G2" ],
                style: YELLOW_BG,
            }
        ],
    });

    // send off the workbook
    await workbook.xlsx.write(stream);
    stream.end();
}

export default {
    create_export,
    monthly_summary,
};
