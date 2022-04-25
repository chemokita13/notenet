const indexCtrl = {};

indexCtrl.renderIndex = (req,res)=>{
    res.render('index')
    //res.redirect('/notes')
}

indexCtrl.renderAbout = (req,res)=>{
    //res.render('about')
    res.redirect('/docs')
}

indexCtrl.redirectIg = (req,res)=>{
    res.redirect('http://instagram.com/chemokita7')
}

indexCtrl.renderDocs = (req, res) => res.render('docs')

module.exports = indexCtrl;