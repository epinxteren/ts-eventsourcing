const Encore = require("@symfony/webpack-encore");
const path = require("path");
const webpack = require("webpack");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");

function clientConfig() {
    Encore.reset();

    // Always use sourcemaps for debugging purposes (dev mode it"s included in the css file, prod external map file).
    const config = Encore.enableSourceMaps()

        // Convert typescript files.
        .enableTypeScriptLoader(function(tsConfig) {
            tsConfig.configFile = path.resolve(__dirname, "web.tsconfig.json");
        })

        // Convert sass files.
        .enableSassLoader((options) => {
            // https://github.com/sass/node-sass#options.
            options.includePaths = [];
        })

        .addPlugin(new CaseSensitivePathsPlugin())

        .addPlugin(new webpack.IgnorePlugin(/server/, /server$/))
        // The project directory where all compiled assets will be stored.
        .setOutputPath("build/client/")

        // The public path used by the web server to access the previous directory.
        .setPublicPath("/")

        // this creates a 'vendor.js' file with jquery and the bootstrap JS module
        // these modules will *not* be included in page1.js or page2.js anymore
        .createSharedEntry("vendor", [
            "babel-polyfill",
            "core-js",
        ])

        // Will convert typescript file to build/client/main.js.
        .addEntry("main", "./src/client/main.tsx")

        .addStyleEntry("style", "./sass/style.scss");

    if (!Encore.isProduction()) {
        // Show OS notifications when builds finish/fail.
        config.enableBuildNotifications();
        // Add browser sync plugin
        config.addPlugin(new BrowserSyncPlugin({
            proxy: "http://localhost:4000",
            notify: true,
            https: false,
            port: 3002,
        }));

        // config.enableForkedTypeScriptTypesChecking();
    }

    const webpackConfig = config.getWebpackConfig();
    webpackConfig.name = "web";
    webpackConfig.resolve.modules = [
        "node_modules",
        path.resolve(__dirname, "src", "client"),
        path.resolve(__dirname, "src", "shared"),
    ];

    return webpackConfig;
}

function serverConfig() {
    Encore.reset();

    // Always use sourcemaps for debugging purposes (dev mode it"s included in the css file, prod external map file).
    const config = Encore.enableSourceMaps()

        // Convert typescript files.
        .enableTypeScriptLoader(function(tsConfig) {
            tsConfig.configFile = path.resolve(__dirname, "server.tsconfig.json");
        })
        // Show OS notifications when builds finish/fail.
        .enableBuildNotifications()

        // The project directory where all compiled assets will be stored.
        .setOutputPath("build/server/")

        // The public path used by the web server to access the previous directory.
        .setPublicPath("/")

        .addEntry("main", "./src/server/main.ts");

    if (Encore.isProduction()) {
        config.cleanupOutputBeforeBuild();
        config.addLoader({
            test: /\.tsx?|\.js$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: "tslint-loader",
                    options: {
                        configFile: "tslint.json",
                        emitErrors: true,
                        failOnHint: Encore.isProduction(),
                        typeCheck: true,
                        fix: true,
                    },
                },
            ],
        });
    } else {
        // config.enableForkedTypeScriptTypesChecking();
    }

    const raw = config.getWebpackConfig();
    raw.name = "server";
    raw.target = "node";
    raw.externals = [nodeExternals()];
    return raw;
}

// Export the final configuration.
module.exports = [ clientConfig(), serverConfig() ];
