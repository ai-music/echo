import { IField, IIndex, IMongoStorageConfig, MONGO_CONFIG_STORAGE_KEY } from './types'

export class ConfigStorage {
    private static config: Map<string, IMongoStorageConfig> = new Map()

    public static updateStorage(field: IField | IIndex, key: MONGO_CONFIG_STORAGE_KEY): void {
        if (!ConfigStorage.config.has(field.collection)) {
            ConfigStorage.config.set(field.collection, { [key]: [ field ] })
            return
        }
        const collection = ConfigStorage.config.get(field.collection)
        ConfigStorage.config.set(field.collection, { ...collection, [key]: [ ...collection[key] || [], field ] })
    }

    public static getConfig(): Map<string, IMongoStorageConfig> {
        return ConfigStorage.config
    }

}
