import ExcelJS from "exceljs";

function monthly_summary(stream, data, enddate) {
    console.log("i am priting data")
    console.log(data);

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
        { header: "dc", key: "daycount", width: 10 },           // I
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
    worksheet.getCell("I2").value = {
        formula: '=IF(AND(G2<=$K$1, G2<>""), IF(EOMONTH(G2,0)=EOMONTH($K$1,0), $K$1-G2, DAY($K$1)), 0)',
        shareType: "shared",
        ref: `I2:I${data.length + 1}`, // check if this is off by one
    };

    // then cascade the formula down
    // this part will probably crash if data is empty
    for (let index = 1; index < data.length; index++) {
        worksheet.getCell(`I${index + 2}`).value = { sharedFormula: "I2" };
    }

    // apply conditional formatting

    // send off the workbook
    workbook.xlsx.write(stream);
}

export default {
    monthly_summary,
};
