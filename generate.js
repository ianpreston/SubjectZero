var fs = require('fs'),
    path = require('path'),
    sys = require('sys'),
    exec = require('child_process').exec,

    hogan = require('hogan'),

    models = require('./models.js'),
    config = require('./config.js').config,

    Page = models.Page,
    Template = models.Template,
    StaticFile = models.StaticFile;


/**
 * Generates the entire static site. Generates each static page and moves them
 * to webroot, copies all statics to webroot, and does everything else to compile
 * the entire site into webroot.
 */
exports.generateSite = function() {
    // Iterate through all Pages in the site and call generatePage() oneach
    Page.find({}, function(err, pages) {
        pages.forEach(function(page) {
            generatePage(page._id, config.webRoot);
        });
    });

    // Iterate through all static media files in the site and call
    // generateStaticMediaFile() on each
    StaticFile.find({'isText': false}, function(err, mediaFiles) {
        mediaFiles.forEach(function(f) {
            generateStaticMediaFile(f._id, config.webRoot);
        });
    });
};

/**
 * The inverse of generatePage. Takes the ObjectId of a Page and
 * deletes the generated static file for that page from disk.
 */
exports.deletePage = function(pageId, deletedCallback) {
    Page.findOne({'_id': pageId}, function(err, page) {
        fs.unlink(path.join(config.webRoot, page.path), function(err) {
            deletedCallback();
        });
    });
};

/**
 * The inverse of generateStaticMediaFile. Takes the ObjectId of a
 * StaticFile and deletes that media file from webroot.
 */
exports.deleteStaticMediaFile = function(fileId, deletedCallback) {
    StaticFile.findOne({'_id': fileId}, function(err, file) {
        fs.unlink(path.join(config.webRoot, file.path), function(err) {
            deletedCallback();
        });
    });
};

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
 *
 */
var generatePage = function(pageId) {
    Page.findOne({'_id': pageId}).populate('template').run(function(err, page) {
        var templateContext = {'page': {
            'title': page.title,
            'content': page.body,
            'path': page.path,
        }};

        // Make sure the page's path exists. i.e. if the page's path is '/foo/bar/index.html',
        // run a mkdir on `webroot/foo/bar'
        exec('mkdir -p ' + path.join(config.webRoot, path.dirname(page.path)), function(err, stdout, stderr) {
            // Now save the template
            saveTemplate(page.path, page.template.body, templateContext);
        });
    });
};

/**
 * Copies a static media file from config.mediaUploadPath to webroot
 */
var generateStaticMediaFile = function(fileId) {
    StaticFile.findOne({'_id': fileId}, function(err, file) {
        var finalPath = path.join(config.webRoot, file.path);

        // Make sure a path up to the static file's path in webroot exists
        exec('mkdir -p ' + path.dirname(finalPath), function(err, stdout, stderr) {
            // Ignore errors because nothing bad ever happens

            // Exec a `cp' command out of sheer laziness
            exec('cp ' + file.mediaFilePath + ' ' + finalPath, function(err, stdout, stderr) {
                if (err) {
                    console.log('Could not copy static file!');
                    console.log(err);
                }
            });
        });
    });
};
