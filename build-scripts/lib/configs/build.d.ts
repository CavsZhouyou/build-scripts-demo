declare const buildConfig: {
    entry: any;
    module: {
        rules: {
            test: RegExp;
            use: string;
            exclude: RegExp;
        }[];
    };
    resolve: {
        extensions: string[];
    };
    output: {
        filename: string;
        path: any;
    };
};
export default buildConfig;
