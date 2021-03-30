const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const cron = require('node-cron');
const config = require(path.join(__dirname, 'config', 'config'));
const git = require('nodegit');
const Cards = require(path.join(__dirname, 'classes', 'cards'));

const mainRouter = require('./routes/main');

const app = express();

// Set recent commit hash in config
git.Repository.open(path.join(__dirname, '.'))
    .then(repo => {
        return repo.getHeadCommit();
    })
    .then(commit => {
        return commit.sha();
    })
    .then(hash => {
        config.latest_commit = hash.substring(0, 7);
        console.log('Running on commit %s', config.latest_commit);
    });

// Set current branch in config
git.Repository.open(path.join(__dirname, '.'))
    .then(repo => {
        return repo.getCurrentBranch();
    })
    .then(branch => {
        config.branch = branch.shorthand();
        console.log('Branch: %s', config.branch);
    });

// Generate cards once and then run every 4 minutes
const cards = new Cards(
    config['cards']['reference_file'],
    path.join(__dirname, 'public', 'data', 'cards.json'),
);

cards.run();
cron.schedule('*/4 * * * *', () => {
    cards.run();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    sassMiddleware({
        src: path.join(__dirname, 'public', 'sass'),
        dest: path.join(__dirname, 'public', 'css'),
        indentedSyntax: true, // true = .sass and false = .scss
        sourceMap: false,
        outputStyle: 'compressed',
        prefix: '/css',
    }),
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/js/jquery.min.js',
    express.static(
        path.join(__dirname, 'node_modules', 'jquery', 'dist', 'jquery.min.js'),
    ),
);

app.use('/', mainRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
