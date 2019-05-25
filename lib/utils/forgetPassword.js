// const passHash = require('password-hash');
const crypto = require('crypto');
const mailer = require('nodemailer');
const config = require('../config/config');

exports.genForgetToken = () =>  {
	const rbyte = crypto.randomBytes(20);
	const hash = rbyte.toString('hex');
	return hash;
};


exports.sendForgetPasswordEmail = (email, hash) => {
	const url = `http://goftare.com/newpassword/${hash}`;
	const transaporter = mailer.createTransport(config.transport);
	const sent = transaporter.sendMail(Object.assign({}, config.options, {
		to: email,
		subject: 'بازیابی رمز عبور',
		html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> <html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> </head> <body><table border="0" cellpadding="0" cellspacing="0" width="100%" id="emailContainer" style="background-color: #fafafa"> <tr> <td align="center" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="emailHeader"> <tr> <td align="center" valign="top"> <div style=" float: right; text-align: right; border-bottom: #c3c3c3 solid 1px !important; direction: rtl; width: 100%; height: 50px; padding-bottom: 3px; padding-top: 3px; background-color: rgb(53, 131, 224);"> <img src="http://185.4.30.214:2500/static/media/logo-white.6f0ab7cf.svg" style="margin: 6px;"> </div> </td> </tr> </table> </td> </tr> <tr> <td align="center" valign="top"> <table border="0" cellpadding="20" cellspacing="0" width="100%" id="emailBody"> <tr> <td align="center" valign="top"> <div style="padding-right: 10px; float: right; width: 100%; direction: rtl; padding-bottom: 10px;"> <p><b>کاربر عزیز</b></p> <p> برای تغییر رمز عبور روی لینک زیر کلیک نمایید </p> <br> <a style="width: 100px;height: 70px;color: #ffffff;text-decoration: none" href=" ' + url + ' "> <button style="padding: 0;color: #ffffff;border: none;width: 170px; height: 35px; text-decoration: none; background-color: #4a90e2; font-size: 1.05em; border-radius: 50px;">لینک تغییر رمز عبور</button> </a> </div> </td> </tr> </table> </td> </tr> <tr> <td align="center" valign="top"> <table border="0" cellpadding="20" cellspacing="0" width="100%" id="emailFooter"> <tr> <td align="center" valign="top"> با تشکر </td> </tr> </table> </td> </tr> </table></body> </html>\n'
	}));
	return sent;
};