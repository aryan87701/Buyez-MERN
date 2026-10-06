const nodemailer = require("nodemailer")

const sendEmail= async(to,subject,text)=>{
    try {
         const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}); 
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,// Sender name and email
            to: to,                               // Recipient
            subject: subject,                     // Subject line
            text: text,                           // Plain text body
        });
           console.log("Email sent:", info.messageId);                         
    } catch (error) {
        console.error('Error sending mail:',error)
    }

}

module.exports = sendEmail