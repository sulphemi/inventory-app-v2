import ExcelJS from "exceljs";

async function monthly_summary(stream, data, enddate) {
    // setup workbook
    const workbook = new ExcelJS.Workbook();
    workbook.calcProperties.fullCalcOnLoad = true;

    const worksheet = workbook.addWorksheet("inventory");

    // this should really be from a single source of truth...
    worksheet.columns = [
        { header: "wid", key: "warehouse_id", width: 10 },      // A
        { header: "sku", key: "sku", width: 20 },               // B
        { header: "sz", key: "size", width: 10 },               // C
        { header: "nt", key: "notes", width: 10 },              // D
        { header: "qu", key: "quantity", width: 10 },           // E
        { header: "cnd", key: "condition", width: 20 },         // F
        { header: "in", key: "inbounddate", width: 20 },        // G
        { header: "out", key: "outbounddate", width: 20 },      // H
        { header: "stat", key: "status", width: 20 },           // I
        { header: "dc", key: "daycount", width: 10 },           // J
    ];

    for (const row of data) {
        const excelRow = { ...row };

        // for some columns, convert string to better datatype
        excelRow.inbounddate = excelRow.inbounddate ? new Date(excelRow.inbounddate) : null;
        excelRow.outbounddate = excelRow.outbounddate ? new Date(excelRow.outbounddate) : null;
        excelRow.quantity = +excelRow.quantity;

        worksheet.addRow(excelRow);
    }

    // apply daycount
    // first set master cell to first row, and slave cells all the way down
    worksheet.getCell("J2").value = {
        formula: '=IF(AND(G2<=$K$1, G2<>""), IF(EOMONTH(G2,0)=EOMONTH($K$1,0), $K$1-G2, DAY($K$1)), 0)',
        shareType: "shared",
        ref: `J2:J${data.length + 1}`,
    };

    // then cascade the formula down
    for (let index = 1; index < data.length; index++) {
        worksheet.getCell(`J${index + 2}`).value = { sharedFormula: "J2" };
    }

    // add summary lines to the bottom of the table
    // these column names don't mean anything, they're just to position
    // TODO: stop using data.length ffs
    const RATE = 69420;
    worksheet.addRow({
        status: "Total Days",
        daycount: { formula: `=SUM(J2:J${data.length + 1})` },
    });
    worksheet.addRow({
        status: "Rate",
        daycount: RATE,
    });
    worksheet.addRow({
        status: "Charge",
        daycount: { formula: `=J${data.length + 2}*J${data.length + 3}` },
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
        ref: `A2:J${data.length + 1}`,
        rules: [
            {
                type: "expression",
                formulae: [ '=OR($I2="报废", $I2="弃置")' ],
                style: GRAY_BG,
            }
        ],
    });

    worksheet.addConditionalFormatting({
        ref: `A2:J${data.length + 1}`,
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
    monthly_summary,
};
