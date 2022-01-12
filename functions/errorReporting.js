import { email, emailPass } from '../config.js';
import nodemailer from 'nodemailer';
import xl from 'excel4node';
import fs from 'fs';

const getXlxs = (arr) => {
	//Create a new Excel sheet
	let wb = new xl.Workbook();
	let ws = wb.addWorksheet('Errors');

	//Add headers
	ws.cell(1, 1).string('Error');
	ws.cell(1, 2).string('LastId');

	//Loop through the error array to add to the worksheet
	for (let i = 0; i < arr.length; ++i) {
		let error = arr[i];
		let row = i + 2;

		if (error.err) {
			ws.cell(row, 1).string(error.err);
		}

		if (error.lastId) {
			ws.cell(row, 2).string(error.lastId.toString());
		}
	}

	//Save the error file to the current directory
	wb.write('AndromedaErrorReport.xlsx');
};

const sendErrorReport = async (arr, type) => {
	getXlxs(arr);

	let transporter = nodemailer.createTransport({
		host: 'smtp-mail.outlook.com',
		secure: false,
		port: 587,
		auth: {
			user: email,
			pass: emailPass,
		},
	});

	await transporter.sendMail({
		from: '"Lauren West" <lwest@echodesign.com>',
		to: `${email}`,
		subject: `Andromeda ${type} Error Report`,
		text: `Attached are the errors from the Andromeda ${type} update.`,
		attachments: [
			{
				filename: 'AndromedaErrorReport.xlsx',
				path: './AndromedaErrorReport.xlsx',
				contentType:
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			},
		],
	});

	fs.unlinkSync('./AndromedaErrorReport.xlsx');
};

export { sendErrorReport };
