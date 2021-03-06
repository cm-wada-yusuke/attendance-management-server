const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: {
        'hello-world': path.resolve(__dirname, './src/lambda/handlers/api-gw/api-gw-greeting.ts'),
        'event': path.resolve(__dirname, './src/lambda/handlers/api-gw/api-gw-slack-event.ts'),
        'subscribe': path.resolve(__dirname, './src/lambda/handlers/kinesis/kinesis-event-subscribe.ts'),
    },
    externals: [nodeExternals({
        modulesFromFile: {
            exclude: ['dependencies'],
            include: ['devDependencies']
        }
    })],
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};
