var mongoose = require('mongoose'),

    models = require('./models.js'),

    Template = models.Template,
    Page = models.Page,
    validateTemplate = models.validateTemplate,
    validatePage = models.validatePage;


exports.indexController = function(req, res) {
    var templates = [];
    Template.find({}, function(template_err, templates) {
        Page.find({}, function(page_err, pages) {
            res.render('index.ejs', {'templates': templates, 'pages': pages});
        });
    });
};


exports.templateCreateController = function(req, res) {
    var newTemplate = new Template();
    if (req.method == 'GET') {
        res.render('template.create.ejs', {'errors': null, 'template': newTemplate});
    } else {
        newTemplate.template_name = req.body.template.template_name;
        newTemplate.body = req.body.template.body;
        newTemplate.save(function(err) {
            if (err) {
                var errors = [];
                for(var e in err.errors) errors.push(err.errors[e].type);
                res.render('template.create.ejs', {'errors': errors, 
                                                   'template': req.body.template});
            } else {
                res.redirect('/');
            }
        });


    }
};

exports.templateEditController = function(req, res) {
    Template.findOne({'_id': req.params.id}, function(err, template) {
        if (req.method == 'GET') {
            res.render('template.edit.ejs', {'errors': null, 'template': template});
        } else {
            template.template_name = req.body.template.template_name;
            template.body = req.body.template.body;
            template.save(function(err) {
                if (err) {
                    var errors = [];
                    for(var e in err.errors) errors.push(err.errors[e].type);
                    res.render('template.edit.ejs', {'errors': errors,
                                                     'template': template});
                } else {
                    res.redirect('/');
                }
            });
        }
    });
    
};

exports.templateDeleteController = function(req, res) {
    /* TODO propagate deletes to pages */
    if (req.method == 'GET') {
        Template.findOne({'_id': req.params.id}, function(err, template) {
            if (err) { res.send('Error: ' + err); return; }
            res.render('template.delete.ejs', {'template': template});
        });
    } else {
        Template.remove({'_id': req.params.id}, function(err, template) {
            res.redirect('/');
        });
    }
};
