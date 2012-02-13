var fs = require('fs'),
    path = require('path'),

    mongoose = require('mongoose'),
    uuid = require('node-uuid'),

    models = require('./models.js'),
    generate = require('./generate.js'),
    config = require('./config.js').config,

    Template = models.Template,
    Page = models.Page,
    MediaFile = models.MediaFile,
    validateTemplate = models.validateTemplate,
    validatePage = models.validatePage;


exports.indexController = function(req, res) {
    Template.find({}, function(templateErr, templates) {
        Page.find({}).populate('template').run(function(pageErr, pages) {
            MediaFile.find({}, function(staticMediaErr, staticMediaFiles) {
                res.render('index.ejs', {'templates': templates, 'pages': pages, 'staticMediaFiles': staticMediaFiles});
            });
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
                generate.generateSite();
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
                    generate.generateSite();
                }
            });
        }
    });
    
};

exports.templateDeleteController = function(req, res) {
    if (req.method == 'GET') {
        Template.findOne({'_id': req.params.id}, function(err, template) {
            if (err) { res.send('Error: ' + err); return; }
            res.render('template.delete.ejs', {'template': template});
        });
    } else {
        Template.findOne({'_id': req.params.id}, function(err, template) {
            template.remove(function(templateError) {
                Page.find({'template': template._id}, function(pageErr, pages) {
                    res.redirect('/');
                    pages.forEach(function(p) {
                        generate.deletePage(p._id, function() {
                            p.remove();
                        });
                    });
                });
            });
        });
    }
};


exports.pageCreateController = function(req, res) {
    Template.find({}, function(err, templates) {
        if (templates.length == 0)
            res.send('You must create at least one template first');

        var newPage = new Page();
        if (req.method == 'GET') {
            res.render('page.create.ejs', {'errors': null, 'page': newPage, 'templates': templates});
        } else {
            newPage.path = req.body.page.path
            newPage.title = req.body.page.title
            newPage.body = req.body.page.body
            newPage.template = req.body.page.template_id
            newPage.save(function(err) {
                if (err) {
                    var errors = [];
                    for(var e in err.errors) errors.push(err.errors[e].type);
                    res.render('page.create.ejs', {'errors': errors,
                                                   'page': newPage,
                                                   'templates': templates});
                } else {
                    res.redirect('/');
                    generate.generateSite();
                }
            });
        }
    });
};

exports.pageEditController = function(req, res) {
    Template.find({}, function(templateErr, templates) {
        Page.findOne({'_id': req.params.id}, function(pageErr, page) {
            if (req.method == 'GET') {
                res.render('page.edit.ejs', {'errors': null, 'page': page, 'templates': templates});
            } else {
                // Delete the old page on disk, so if the path changes the
                // old file isn't left behind in webroot
                generate.deletePage(page._id, function() {
                    page.path = req.body.page.path
                    page.title = req.body.page.title
                    page.body = req.body.page.body
                    page.template = req.body.page.template_id
                    page.save(function(err) {
                        if (err) {
                            var errors = [];
                            for (var e in err.errors) errors.push(err.errors[e].type);
                            res.render('page.edit.ejs', {'errors': errors,
                                                         'page': page,
                                                         'templates': templates});
                        } else {
                            res.redirect('/');
                            generate.generateSite();
                        }
                    });
                });
            }
        });
    });
};

exports.pageDeleteController = function(req, res) {
    Page.findOne({'_id': req.params.id}, function(err, page) {
        if (req.method == 'GET') {
            res.render('page.delete.ejs', {'page': page});
        } else {
            generate.deletePage(page._id, function() {
                page.remove(function(err) {
                    res.redirect('/');
                });
            });
        }
    });
};


exports.staticMediaCreateController = function(req, res) {
    var newFile = new MediaFile();
    if (req.method == 'GET') {
        res.render('static.media.create.ejs', {'errors': null});
    } else {
        // Find the path where the file upload will be stored
        var fileSavePath = path.join(config.mediaUploadPath, uuid.v1());

        // Move the uploaded file from /tmp to config.mediaUploadPath
        fs.rename(req.files.mediaUpload.path, fileSavePath, function(renameErr) {
            // Add a MediaFile document to the database
            newFile.path = req.body.filePath;
            newFile.mediaFilePath = fileSavePath;
            newFile.save(function(err) {
                if (err) {
                    var errors = [];
                    for (var e in err.errors) errors.push(err.errors[e].type);
                    res.render('static.media.create.ejs', {'errors': errors});
                 } else {
                    res.redirect('/');
                    generate.generateSite();
                }
            });
        });
    }
};

exports.staticMediaDeleteController = function(req, res) {
    MediaFile.findOne({'_id': req.params.id}, function(err, file) {
        if (req.method == 'GET') {
            res.render('static.media.delete.ejs', {'file': file});
        } else {
            generate.deleteStaticMediaFile(file._id, function() {
                file.remove(function(err) {
                    res.redirect('/');
                });
            });
        }
    });
};
