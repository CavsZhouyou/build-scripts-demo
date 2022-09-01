interface IConfig {
    [key: string]: any;
}
interface IUserConfigArgs {
    name: string;
    defaultValue?: any;
    validation?: (value: any) => Promise<boolean>;
    configWebpack?: (defaultConfig: IConfig, value: any) => void;
}
declare class ConfigManager {
    config: IConfig;
    userConfig: IConfig;
    private userConfigRegistration;
    constructor(config: IConfig, userConfig: IConfig);
    /**
     * 注册用户配置
     *
     * @param {IUserConfigArgs[]} configs
     * @memberof ConfigManager
     */
    registerUserConfig(configs: IUserConfigArgs[]): void;
    /**
     * 执行用户配置
     *
     * @param {*} configs
     * @memberof ConfigManager
     */
    runUserConfig(): Promise<void>;
    /**
     * webpack 配置初始化
     */
    setup(): Promise<void>;
}
export default ConfigManager;
