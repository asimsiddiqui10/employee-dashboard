import PDFDocument from 'pdfkit';
import { format, differenceInMinutes } from 'date-fns';
import path from 'path';
import fs from 'fs';

export const generateTimesheetPDF = (doc, timeEntry, logoPath) => {
  // Add company logo if exists
  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Document title
  doc.fontSize(20)
     .text('Employee Timesheet', 50, 50, { align: 'center' });

  // Employee information section
  doc.moveDown()
     .fontSize(12)
     .text('Employee Information', 50, 120, { underline: true });

  doc.fontSize(10)
     .text(`Name: ${timeEntry.employee.name}`, 50, 140)
     .text(`Employee ID: ${timeEntry.employee.employeeId}`, 50, 160)
     .text(`Department: ${timeEntry.employee.department}`, 50, 180)
     .text(`Position: ${timeEntry.employee.position}`, 50, 200);

  // Timesheet details section
  doc.moveDown(2)
     .fontSize(12)
     .text('Timesheet Details', 50, 240, { underline: true });

  doc.fontSize(10)
     .text(`Date: ${format(new Date(timeEntry.date), 'MMMM d, yyyy')}`, 50, 260)
     .text(`Clock In: ${format(new Date(timeEntry.clockIn), 'h:mm a')}`, 50, 280)
     .text(`Clock Out: ${format(new Date(timeEntry.clockOut), 'h:mm a')}`, 50, 300)
     .text(`Total Work Time: ${Math.round(timeEntry.totalWorkTime)} minutes`, 50, 320)
     .text(`Total Break Time: ${timeEntry.totalBreakTime} minutes`, 50, 340)
     .text(`Job Code: ${timeEntry.jobCode}`, 50, 360)
     .text(`Rate: $${timeEntry.rate.toFixed(2)}`, 50, 380)
     .text(`Shift: ${timeEntry.shift}`, 50, 400);

  // Break details
  if (timeEntry.breaks && timeEntry.breaks.length > 0) {
    doc.moveDown(2)
       .fontSize(12)
       .text('Break Details', 50, 440, { underline: true });

    let yPosition = 460;
    timeEntry.breaks.forEach((breakItem, index) => {
      doc.fontSize(10)
         .text(`Break ${index + 1}:`, 50, yPosition)
         .text(`Start: ${format(new Date(breakItem.startTime), 'h:mm a')}`, 70, yPosition + 20)
         .text(`End: ${format(new Date(breakItem.endTime), 'h:mm a')}`, 70, yPosition + 40)
         .text(`Duration: ${breakItem.duration} minutes`, 70, yPosition + 60);
      yPosition += 100;
    });
  }

  // Notes section
  if (timeEntry.timesheetNotes) {
    doc.moveDown(2)
       .fontSize(12)
       .text('Notes', 50, doc.y + 20, { underline: true })
       .fontSize(10)
       .text(timeEntry.timesheetNotes, 50, doc.y + 20);
  }

  // Approval section
  doc.moveDown(2)
     .fontSize(12)
     .text('Approval Information', 50, doc.y + 20, { underline: true });

  doc.fontSize(10)
     .text(`Status: ${timeEntry.status.toUpperCase()}`, 50, doc.y + 20)
     .text(`Approved By: ${timeEntry.approvedBy?.name || 'N/A'}`, 50, doc.y + 20)
     .text(`Approval Date: ${timeEntry.approvalDate ? format(new Date(timeEntry.approvalDate), 'MMMM d, yyyy') : 'N/A'}`, 50, doc.y + 20);

  // Footer with page number
  const pageNumber = 'Page 1';
  doc.fontSize(10)
     .text(
       pageNumber,
       doc.page.width / 2 - doc.widthOfString(pageNumber) / 2,
       doc.page.height - 50
     );

  return doc;
};