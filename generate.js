var fs = require('fs'),
    path = require('path'),
    sys = require('sys'),
    exec = require('child_process').exec,

    hogan = require('hogan'),

    models = require('./models.js'),
    config = require('./config.js').config,

    Page = models.Page,
    Template = models.Template;


/**
 * Compiles a template and saves it to disk at config.webRoot + path. Expects that
 * the full path to file exists and is writable and that nothing bad ever
 * happens.
 *
 * path : The page's path relative to config.webRoot
 * template : A string containing the template contents
 * context : The template context
 */
var saveTemplate = function(savePath, template, context) {
    var hoganTemplate = hogan.compile(template);
    var finalPageContent = hoganTemplate.render(context);

    fs.writeSync(fs.openSync(path.join(config.webRoot, savePath), 'w'), finalPageContent);
};

/**
 * Iterates through all Pages in the database and calls
 * generatePage() on them.
 */
exports.generateAllPages = function() {
    Page.find({}, function(err, pages) {
        pages.forEach(function(page) {
            generatePage(page._id, config.webRoot);
        });
    });
};

/**
 *
 */
var generatePage = function(page_id) {
    Page.findOne({'_id': page_id}).populate('template').run(function(err, page) {
        var templateContext = {'page': {
            'title': page.title,
            'content': page.body,
            'path': page.path,
        }};

        path.exists(path.dirname(page.path), function(exists) {
            if (!exists) {
                exec('mkdir -p ' + path.join(config.webRoot, path.dirname(page.path)), function(err, stdout, stderr) {
                    if (err) {
                        console.log('Could not create path to template!');
                        console.log(err);
                    } else {
                        saveTemplate(page.path, page.template.body, templateContext);
                    }
                });
            } else {
                saveTemplate(page.path, page.template.body, templateContext);
            }
        });
    });
};

/**
 * The inverse of generatePage. Takes the ObjectId of a Page and
 * deletes the generated static file for that page from disk.
 */
exports.deletePage = function(page_id, deletedCallback) {
    Page.findOne({'_id': page_id}, function(err, page) {
        fs.unlink(path.join(config.webRoot, page.path), function(err) {
            deletedCallback();
        });
    });
};
