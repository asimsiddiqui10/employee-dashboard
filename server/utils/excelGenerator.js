import ExcelJS from 'exceljs';
import { format } from 'date-fns';

export const generateTimesheetExcel = async (timeEntry) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Timesheet');

  // Add company logo
  try {
    const logoImage = workbook.addImage({
      filename: './public/ACT New Logo HD.png',
      extension: 'png',
    });
    worksheet.addImage(logoImage, {
      tl: { col: 0, row: 0 },
      ext: { width: 100, height: 50 }
    });
  } catch (error) {
    console.error('Error adding logo to Excel:', error);
  }

  // Set column widths
  worksheet.columns = [
    { header: '', width: 20 },
    { header: '', width: 30 },
  ];

  // Add title
  worksheet.mergeCells('A1:B1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = 'Employee Timesheet';
  titleRow.font = { size: 16, bold: true };
  titleRow.alignment = { horizontal: 'center' };

  // Style helper
  const addSection = (startRow, title, data) => {
    // Section title
    worksheet.mergeCells(`A${startRow}:B${startRow}`);
    const sectionTitle = worksheet.getCell(`A${startRow}`);
    sectionTitle.value = title;
    sectionTitle.font = { size: 12, bold: true };
    sectionTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    let currentRow = startRow + 1;
    Object.entries(data).forEach(([key, value]) => {
      worksheet.getCell(`A${currentRow}`).value = key;
      worksheet.getCell(`B${currentRow}`).value = value;
      currentRow++;
    });

    return currentRow + 1;
  };

  // Employee Information
  let nextRow = addSection(3, 'Employee Information', {
    'Name': timeEntry.employee.name,
    'Employee ID': timeEntry.employee.employeeId,
    'Department': timeEntry.employee.department,
    'Position': timeEntry.employee.position
  });

  // Timesheet Details
  nextRow = addSection(nextRow, 'Timesheet Details', {
    'Date': format(new Date(timeEntry.date), 'MMMM d, yyyy'),
    'Clock In': format(new Date(timeEntry.clockIn), 'h:mm a'),
    'Clock Out': format(new Date(timeEntry.clockOut), 'h:mm a'),
    'Total Work Time': `${Math.round(timeEntry.totalWorkTime)} minutes`,
    'Total Break Time': `${timeEntry.totalBreakTime} minutes`,
    'Job Code': timeEntry.jobCode,
    'Rate': `$${timeEntry.rate.toFixed(2)}`,
    'Shift': timeEntry.shift
  });

  // Break Details
  if (timeEntry.breaks && timeEntry.breaks.length > 0) {
    worksheet.mergeCells(`A${nextRow}:B${nextRow}`);
    const breakTitle = worksheet.getCell(`A${nextRow}`);
    breakTitle.value = 'Break Details';
    breakTitle.font = { size: 12, bold: true };
    breakTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    nextRow++;

    timeEntry.breaks.forEach((breakItem, index) => {
      worksheet.getCell(`A${nextRow}`).value = `Break ${index + 1}`;
      worksheet.getCell(`A${nextRow + 1}`).value = 'Start';
      worksheet.getCell(`B${nextRow + 1}`).value = format(new Date(breakItem.startTime), 'h:mm a');
      worksheet.getCell(`A${nextRow + 2}`).value = 'End';
      worksheet.getCell(`B${nextRow + 2}`).value = format(new Date(breakItem.endTime), 'h:mm a');
      worksheet.getCell(`A${nextRow + 3}`).value = 'Duration';
      worksheet.getCell(`B${nextRow + 3}`).value = `${breakItem.duration} minutes`;
      nextRow += 4;
    });
    nextRow++;
  }

  // Notes
  if (timeEntry.timesheetNotes) {
    nextRow = addSection(nextRow, 'Notes', {
      'Comments': timeEntry.timesheetNotes
    });
  }

  // Approval Information
  addSection(nextRow, 'Approval Information', {
    'Status': timeEntry.status.toUpperCase(),
    'Approved By': timeEntry.approvedBy?.name || 'N/A',
    'Approval Date': timeEntry.approvalDate ? 
      format(new Date(timeEntry.approvalDate), 'MMMM d, yyyy') : 
      'N/A'
  });

  // Generate buffer
  return await workbook.xlsx.writeBuffer();
}; 