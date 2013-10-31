
module.exports = function (grunt) {
    grunt.initConfig({
        pkg:    grunt.file.readJSON("package.json")
    ,   uglify: {
            options: {
                banner: "/*! <%= pkg.name %>/<%= pkg.version%>, <%= grunt.template.today('yyyy-mm-dd') %>\n" +
                        "    Robin Berjon <robin@berjon.com>, http://berjon.com/, @robinberjon */\n"
            }
        ,   build: {
                src:    "specstatic.js"
            ,   dest:   "specstatic.min.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.registerTask("default", ["uglify"]);
};
