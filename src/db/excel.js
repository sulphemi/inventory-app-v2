import ExcelJS from "exceljs";
//import Queries from "./queries.js";

function hello(stream) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("hi");

    worksheet.columns = [
        { header: "hello", key: "hello", width: 10 },
        { header: "world", key: "world", width: 15 },
    ];

    worksheet.addRow({ hello: "bonjour", world: "monde" });

    workbook.xlsx.write(stream);
}

export default {
    hello,
};
