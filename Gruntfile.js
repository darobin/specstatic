
module.exports = function (grunt) {
    var banner = "/*! <%= pkg.name %>/<%= pkg.version%>, <%= grunt.template.today('yyyy-mm-dd') %>\n" +
                 "    Robin Berjon <robin@berjon.com>, http://berjon.com/, @robinberjon */\n"
    ;
    grunt.initConfig({
        pkg:    grunt.file.readJSON("package.json")
    ,   uglify: {
            options: {
                banner: banner
            }
        ,   build: {
                src:    "specstatic.js"
            ,   dest:   "specstatic.min.js"
            }
        }
    ,   cssmin: {
            minify: {
                removeEmpty:    true
            ,   src:            "specstatic.css"
            ,   dest:           "specstatic.min.css"
            }
        }
    ,   concat: {
            options: {
                banner: banner
            }
        ,   dist: {
                src:    ["specstatic.min.css"]
            ,   dest:   "specstatic.min.css"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.registerTask("default", ["uglify", "cssmin", "concat"]);
};
