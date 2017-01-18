/**
 * This adds basic app env parsing
 *
 * Specifically, it handles a "compose" option in the app config which is an
 * array of files. It is also responsible for parsing
 *
 * @name env
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add a process env object, this is to inject ENV into the process
    // running the app task so we cna use $ENVARS in our docker compose
    // files
    app.processEnv = {};

    // Add a env object, these are envvars that get added to every container
    app.env = {};

    // Add a label object, these are labels that get added to every container
    app.labels = {};

    // Add in some common process envvars we might want
    app.processEnv.KALABOX_APP_NAME = app.name;
    app.processEnv.KALABOX_APP_ROOT = app.root;
    app.processEnv.KALABOX_APP_ROOT_BIND = app.rootBind;

    // Add in some global container envvars
    app.env.KALABOX = 'ON';
    app.env.KALABOX_HOST_OS = lando.config.os.platform;

    // Add in some global labels
    app.labels = {'io.lando.container': 'TRUE'};

    // Add the global env object to all our containers
    app.events.on('app-ready', function(app) {

      // Log
      lando.log.verbose('App %s has global env.', app.name, app.env);
      lando.log.verbose('App %s has global labels.', app.name, app.labels);
      lando.log.verbose('App %s adds process env.', app.name, app.processEnv);

      // If we have some containers lets add in our global envs and labels
      if (!_.isEmpty(app.containers)) {
        _.forEach(app.containers, function(container) {

          // Get existing ENV and LABELS
          var env = container.environment || {};
          var labels = container.labels || {};

          // Merge in our globals underneath
          container.environment = _.merge(app.env, env);
          container.labels = _.merge(app.labels, labels);

        });

      }

    });

  });

};
