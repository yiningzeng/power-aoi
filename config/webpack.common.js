const path = require("path");

module.exports = {
    node: {
        __dirname: false,
    },
    target: "electron-main",
    entry: "./src/electron/electron.ts",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [{
                    loader: "ts-loader",
                    options: {
                        compilerOptions: {
                            noEmit: false
                        }
                    }
                }],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "electron.js",
        path: path.resolve(__dirname, "../build")
    }
};
