import path from 'path';

export default {
    mode: 'production',
    entry: './src/build.js',
    output: {
        path: path.resolve('./docs/'),
        filename: 'json-schema-md-doc.min.js'
    }
}