const Encore = require("@symfony/webpack-encore");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");

const config =
    Encore.enableSourceMaps()
    // Convert typescript files.
    .enableTypeScriptLoader()

    // Show OS notifications when builds finish/fail.
    .enableBuildNotifications()

    .addPlugin(new CaseSensitivePathsPlugin())

    // The project directory where all compiled assets will be stored.
    .setOutputPath("build/")

    .addEntry("main", "./src/index.ts")
    .cleanupOutputBeforeBuild()
    .addLoader({
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
    })
    .getWebpackConfig();

// Export the final configuration.
module.exports = config;
