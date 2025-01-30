/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as XLSX from "xlsx";

export const onGetExportDataToExcel = async (
  title?: string,
  worksheetname?: string,
  dataToExport?: any[]
) => {
  try {
    // todo fetch members data
    if (dataToExport) {
      // todo: create Excel workbook and worksheet

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
      // todo: save the workbook as an Excel file

      XLSX.writeFile(workbook, `${title}.xlsx`);
      console.log(`Exported data to ${title}.xlsx`);
      // todo: set loading to false
    } else {
      // todo set loading to false
      console.log("#==================Export Error");
    }
  } catch (error: any) {
    // todo set loading false
    console.log("#==================Export Error", error.message);
  }
};
