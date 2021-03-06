module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

//    frontend preprocessing

    copy: {
      html: {
        files: [{
          expand: true,
          src: ['**/*.html'],
          dest: 'frontend/public',
          cwd: 'frontend/src',
          flatten: true
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: 'frontend/src/images/',
          src: ['**/*.png', '**/*.jpg', '**/*.svg'],
          dest: 'frontend/public/images'
        }]
      }
    },

    sass: {
      build: {
        src: 'frontend/src/scss/main.scss',
        dest: 'frontend/src/css/compiled.css'
      }
    },

    autoprefixer: {
      build: {
        src: 'frontend/src/css/compiled.css',
        dest: 'frontend/src/css/prefixed.css'
      }
    },

    cssmin: {
      build: {
        src: ['frontend/src/css/prefixed.css',
              'frontend/src/css/atelier-lakeside.dark.css'],
        dest: 'frontend/public/css/styles.min.css'
      }
    },

    browserify: {
      build: {
        src: ['frontend/src/**/*.js',
              'frontend/src/**/*.jsx',
              '!frontend/src/**/__tests__/*.js',
              '!frontend/src/**/__tests__/*.jsx',
              '!frontend/src/**/__mocks__/*.js',
              '!frontend/src/**/__mocks__/*.jsx'],
        dest: 'frontend/public/bundle.js',
        options: {
          transform: [ require('grunt-react').browserify ]
        }
      }
    },

    uglify: {
      build: {
        src: 'frontend/public/bundle.js',
        dest: 'frontend/public/bundle.min.js'
      }
    },

    watch: {
      options: {
        livereload: true
      },

      scss: {
        files: 'frontend/src/scss/**/*.scss',
        tasks: 'sass',
        options: {
          livereload: false
        }
      },

      autoprefixer: {
        files: 'frontend/src/css/compiled.css',
        tasks: 'autoprefixer'
      },

      cssmin: {
        files: 'frontend/src/css/prefixed.css',
        tasks: 'cssmin'
      },

      js: {
        files: ['frontend/src/**/*.js',
                'frontend/src/**/*.jsx',
                '!frontend/src/**/__tests__/*.js',
                '!frontend/src/**/__tests__/*.jsx',
                '!frontend/src/**/__mocks__/*.js',
                '!frontend/src/**/__mocks__/*.jsx'],
        tasks: 'browserify'
      },

      uglify: {
        files: ['frontend/public/bundle.js'],
        tasks: 'uglify'
      },

      html: {
        files: ['frontend/src/**/*.html'],
        tasks: 'copy:html'
      },

      images: {
        files: ['frontend/src/images/**/*'],
        tasks: 'copy:images'
      },


      hapi: {
        files: [
          'backend/app/**/*.js',
          'backend/config/**/*.js',
          'shared/**/*.js',
          'Gruntfile.js'
        ],
        tasks: ['hapi'],
        options: {
          interrupt: true,
          spawn: false
        }
      }
    },

    hapi: {
      http: {
        options: {
          server: require('path').resolve('./backend/app/server'),
          livereload: 35729
        }
      }
    }

  });

  // batch load grunt-contrib-* modules
  var grunt_contribs = [
    'cssmin',
    'uglify',
    'watch',
    'copy'
  ];

  // batch load grunt-* modules
  var grunts = [
    'hapi',
    'sass',
    'browserify',
    'autoprefixer'
  ];

  for (var i=0; i < grunt_contribs.length; i++) {
    grunt.loadNpmTasks('grunt-contrib-' + grunt_contribs[i]);
  }

  for (i=0; i < grunts.length; i++) {
    grunt.loadNpmTasks('grunt-' + grunts[i]);
  }

  grunt.registerTask('default', [
    'copy',
    'sass',
    'autoprefixer',
    'cssmin',
    'browserify',
    'uglify'
  ]);

  grunt.registerTask('serve', function() {
    grunt.task.run([
      'default',
      'hapi',
      'watch'
    ]);
  });
};
