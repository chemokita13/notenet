const supportCtrl = {}
const nodemailer = require('nodemailer');
const { getTemplateSupport, sendEmailSupport } = require('../config/mail.config');


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
    const { name, email, message } = req.body;

    let html = getTemplateSupport(name,email,message)

    let info = sendEmailSupport(html)
    console.log('Message sent: %s', info.messageId);
    
    req.flash('added_msg', "Message sent successfully")
    res.redirect('/')
}

module.exports = supportCtrl