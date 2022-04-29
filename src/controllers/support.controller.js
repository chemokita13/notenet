const supportCtrl = {}
const nodemailer = require('nodemailer');


supportCtrl.renderForm = (req, res) => {
    if(req.user){
    const {name, email} = req.user
    res.render('support/RenderSupport',{name, email}) }
    else{
        res.render('support/RenderSupport')
    }
    console.log(req.user)
}

supportCtrl.sendMail = async (req, res) => {
    const { name, email, phone, message } = req.body;

    contentHTML = `
        <h1>User Information</h1>
        <ul>
            <li>Username: ${name}</li>
            <li>User Email: ${email}</li>
        </ul>
        <h2>Problem</h2>
        <p>${message}</p>
    `;

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

    let info = await transporter.sendMail({
        from: '"NoteNet" <support.sender@notenet.es>', // sender address,
        to: `support.sender@notenet.es`,
        subject: 'Problem',
        html: contentHTML
    })

    console.log('Message sent: %s', info.messageId);
    
    req.flash('added_msg', "Message sent successfully")
    res.redirect('/')
    //res.render('support/mailSent');
}

module.exports = supportCtrl