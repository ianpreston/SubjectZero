var path = require('path'),
    fs = require('fs'),

    mongoose = require('mongoose'),

    models = require('./models.js'),
    generate = require('./generate.js'),
    utils = require('./utils.js'),
    config = require('./config.js').config,

    Template = models.Template,
    Page = models.Page,
    MediaFile = models.MediaFile,
    validateTemplate = models.validateTemplate,
    validatePage = models.validatePage;


exports.indexController = function(req, res) {
    Template.find({}).sort('template_name', 'ascending').run(function(templateErr, templates) {
        Page.find({}).sort('path', 'ascending').populate('template').run(function(pageErr, pages) {
            MediaFile.find({}).sort('path', 'ascending').run(function(mediaErr, mediaFiles) {
                res.render('index.ejs', {'templates': templates, 'pages': pages, 'mediaFiles': mediaFiles, 'webRootUrl': config.webRootUrl});
            });
        });
    });
};


exports.templateCreateController = function(req, res) {
    var newTemplate = new Template();
    if (req.method == 'GET') {
        res.render('template.create.ejs', {'errors': null, 'template': newTemplate, 'editorLang': 'html'});
    } else {
        newTemplate.template_name = req.body.template.template_name;
        newTemplate.body = req.body.template.body;
        newTemplate.save(function(err) {
            if (err) {
                var errors = [];
                for(var e in err.errors) errors.push(err.errors[e].type);
                res.render('template.create.ejs', {'errors': errors, 
                                                   'template': req.body.template,
                                                   'editorLang': 'html'});
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
            res.render('template.edit.ejs', {'errors': null, 'template': template, 'editorLang': 'html'});
        } else {
            template.template_name = req.body.template.template_name;
            template.body = req.body.template.body;
            template.save(function(err) {
                if (err) {
                    var errors = [];
                    for(var e in err.errors) errors.push(err.errors[e].type);
                    res.render('template.edit.ejs', {'errors': errors,
                                                     'template': template,
                                                     'editorLang': 'html'});
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
            res.render('page.create.ejs', {'errors': null, 'page': newPage, 'templates': templates, 'editorLang': 'html'});
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
                                                   'templates': templates,
                                                   'editorLang': 'html'});
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
            // Set the language of the Ace editor by the file extension
            var editorLanguage = utils.getAceModeFromExtension(page.path.split(".").pop());

            if (req.method == 'GET') {
                res.render('page.edit.ejs', {'errors': null, 'page': page, 'templates': templates, 'editorLang': editorLanguage, 'webRootUrl': config.webRootUrl});
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
                                                         'templates': templates,
                                                         'editorLang': editorLanguage,
                                                         'webRootUrl': config.webRootUrl});
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


exports.mediaCreateController = function(req, res) {
    var newFile = new MediaFile();
    if (req.method == 'GET') {
        res.render('media.create.ejs', {'errors': null});
    } else {
        // Move the uploaded file from /tmp to config.mediaUploadPath
        var mediaFilePath = utils.createPhysicalMediaFilename();

        // Add a MediaFile document to the database
        newFile.path = req.body.file.path;
        newFile.mediaFilePath = mediaFilePath;
        newFile.save(function(err) {
            if (err) {
                var errors = [];
                for (var e in err.errors) errors.push(err.errors[e].type);
                res.render('media.create.ejs', {'errors': errors});
             } else {
                // Since there were no errors saving the MediaFile, save the physical
                // media file to mediaUploadPath and generate the site
                fs.renameSync(req.files.uploaded.path, mediaFilePath);
                res.redirect('/');
                generate.generateSite();
             }
        });
    }
};

exports.mediaEditController = function(req, res) {
    MediaFile.findOne({'_id': req.params.id}, function(err, file) {
        if (req.method == 'GET') {
            res.render('media.edit.ejs', {'errors': null, 'file': file, 'webRootUrl': config.webRootUrl});
        } else {
            // Delete the old media file from disk, so if the path changes the
            // old file isn't left behind in webroot
            generate.deleteMediaFile(file._id, function() {
                // If a new file was uploaded
                if (req.files.uploaded.size > 0) {
                    // Overwrite the physical media file at file.mediaFilePath with the new
                    // uploaded file's contents
                    fs.renameSync(req.files.uploaded.path, file.mediaFilePath);
                }

                file.path = req.body.file.path;
                file.save(function(err) {
                    if (err) {
                        var errors = [];
                        for (var e in err.errors) errors.push(err.errors[e].type);
                        res.render('media.create.ejs', {'errors': errors, 'file': file, 'webRootUrl': config.webRootUrl});
                     } else {
                        res.redirect('/');
                        generate.generateSite();
                    }
                });
            });
        }
    });
};

exports.mediaDeleteController = function(req, res) {
    MediaFile.findOne({'_id': req.params.id}, function(err, file) {
        if (req.method == 'GET') {
            res.render('media.delete.ejs', {'file': file});
        } else {
            // Remove the media file from webroot, remove the media file from mediaUploadPath,
            // and remove the MediaFile document from the database
            generate.deleteMediaFile(file._id, function() {
                fs.unlink(file.mediaFilePath, function(err) {
                    file.remove(function(err) {
                        res.redirect('/');
                    });
                });
            });
        }
    });
};
