module.exports = function(grunt) {

  // configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      serve: {
        options: {
          port: 8000,
          base: './'
        }
      }
    },
    php: {
      dist: {
        options: {
          port: 8080,
          base: './',
          keepalive: true
        }
      }
    },
    watch: {
      compass: {
        files: ['./src/scss/*.{scss,sass}'],
        tasks: ['compass']
      },
      jshint: {
        files: ['./src/js/*.js', './src/lib/*.js'],
        tasks: ['jshint']
      },
      concat: {
        files: ['./src/js/*.js', './src/lib/*.js'],
        tasks: ['concat']
      }
    },
    compass: {
      dev: {
        options: {
          sassDir: ['./src/scss'],
          cssDir: ['./inc/css'],
          environment: 'development'
        }
      },
      prod: {
        options: {
          sassDir: ['./src/scss'],
          cssDir: ['./inc/css'],
          environment: 'production'
        }
      }
    },
    jshint: {
      files: ['./src/js/*.js', './inc/guides/*.js'],
      options: {
        globals: {
          console: true
        }
      }
    },
    concat: {
      all: {
        files: {
          './inc/js/scripts.js': ['./src/lib/*.js', './src/js/*.js'],
          './inc/js/guide-data.js': ['./inc/guides/*.js']
        }
      }
    },
    uglify: {
      all: {
        files: {
          './inc/js/scripts.js': ['./src/lib/*.js', './src/js/*.js'],
          './inc/js/guide-data.js': ['./inc/guides/*.js']
        }
      }
    },
    pngmin: {
      compile: {
        options: {
          ext: '.png',
          colors: 32,
          quality: '30-60',
          force: false
        },
        files: [{
          expand: true,
          src: ['**/*.png'],
          cwd: 'src/tiles/',
          dest: 'inc/tiles/'
        }]
      }
    },
    font_optimizer: {
      all: {
        options: {
          chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-_+={}\\/":;><.,\'',
          includeFeatures: ['kern']
        },
        files: {
          './inc/fonts/': ['./src/fonts/*.ttf']
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 version', 'ie 8', 'ie 9']
      },
      no_dest: {
        src: '**/inc/css/*.css'
      }
    }
  };

  // init
  grunt.initConfig(config);

  // dependencies
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-pngmin');
  grunt.loadNpmTasks('grunt-image-resize');
  grunt.loadNpmTasks('grunt-font-optimizer');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // tasts
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('serve:php', ['php']);
  grunt.registerTask('dev', ['compass', 'jshint', 'concat']);
  grunt.registerTask('prod', ['compass', 'jshint', 'uglify']);
  grunt.registerTask('tiles', ['pngmin']);

};
