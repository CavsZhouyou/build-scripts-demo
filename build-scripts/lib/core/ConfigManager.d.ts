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
    constructor(config: IConfig);
    /**
     * 注册用户配置
     *
     * @param {IUserConfigArgs[]} configs
     * @memberof ConfigManager
     */
    registerUserConfig(configs: IUserConfigArgs[]): void;
    /**
     * 获取用户配置
     *
     * @private
     * @return {*}
     * @memberof ConfigManager
     */
    private getUserConfig;
    /**
     * 执行注册用户配置
     *
     * @param {*} configs
     * @memberof ConfigManager
     */
    private runUserConfig;
    /**
     * webpack 配置初始化
     */
    setup(): Promise<void>;
}
export default ConfigManager;
