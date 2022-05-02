const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.ionos.es',
    port: 587,
    secure: false,
    auth: {
        user: 'support@notenet.es',
        pass: process.env.PASSWORDEMAIL
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmailConfirm = async (email, subject, html) => {
    try {
        
        await transporter.sendMail({
            from: `NoteNet <support@notenet.es>`, // sender address
            to: email, // list of receivers
            subject, // Subject line
            html, // html body
        });

    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
  }

  const getTemplateConfirm = (name, token) => {
      return `
        <head>
            <link rel="stylesheet" href="./style.css">
        </head>
        
        <div id="email___content">
            <h2>Hola ${ name }</h2>
            <p>Para confirmar tu cuenta, ingresa al siguiente enlace</p>
            <a
                href="https://notenet.es/users/confirm/${ token }"
                target="_blank"
            >Confirmar Cuenta</a>
        </div>
      `;
  }

  const getTemplateSupport = (name,email,message)=>{
      return `
      <h1>User Information</h1>
      <ul>
          <li>Username: ${name}</li>
          <li>User Email: ${email}</li>
      </ul>
      <h2>Problem</h2>
      <p>${message}</p>
  `
  }

  const sendEmailSupport = async (html) => {
    await transporter.sendMail({
    from: '"NoteNet" <support.sender@notenet.es>', // sender address,
    to: `support.sender@notenet.es`,
    subject: 'Problem',
    html
})}

module.exports = {
    getTemplateConfirm, sendEmailConfirm,
    getTemplateSupport, sendEmailSupport
}