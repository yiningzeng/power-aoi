import Guard from "../../common/guard";
import { ITrainProvider } from "./trainProvider";
import { IProject } from "../../models/applicationState";

export interface ITrainProviderRegistrationOptions {
    name: string;
    displayName: string;
    description?: string;
    factory: (project: IProject, options?: any) => ITrainProvider;
}

/**
 * @name - Export Provider Factory
 * @description - Creates instance of export providers based on request provider type
 */
export class TrainProviderFactory {

    /**
     * @returns Dictionary of registered providers
     */
    public static get providers() {
        return { ...TrainProviderFactory.providerRegistry };
    }

    /**
     * @returns Options from specified default provider
     */
    public static get defaultProvider() {
        return TrainProviderFactory.defaultProviderOptions;
    }

    /**
     * Registers a factory method for the specified export provider type
     * @param options - The options to use when registering an export provider
     */
    public static register(options: ITrainProviderRegistrationOptions) {
        Guard.null(options);
        Guard.empty(options.name);
        Guard.empty(options.displayName);
        Guard.null(options.factory);

        // The first provider registered will be the default
        if (TrainProviderFactory.defaultProviderOptions === null) {
            TrainProviderFactory.defaultProviderOptions = options;
        }
        TrainProviderFactory.providerRegistry[options.name] = options;
    }

    /**
     * Creates new instances of the specified export provider
     * @param name - The name of the export provider to instantiate
     * @param project - The project to load into the export provider
     * @param options  - The provider specific options for exporting
     */
    public static create(name: string, project: IProject, options?: any): ITrainProvider {
        Guard.empty(name);
        Guard.null(project);

        const handler = TrainProviderFactory.providerRegistry[name];
        if (!handler) {
            throw new Error(`No export provider has been registered with name '${name}'`);
        }

        return handler.factory(project, options);
    }

    /**
     * Create export provider from project
     * @param project VoTT project
     */
    public static createFromProject(project: IProject): ITrainProvider {
        return TrainProviderFactory.create(
            project.trainFormat.providerType,
            project,
            project.trainFormat.providerOptions,
        );
    }

    private static providerRegistry: { [id: string]: ITrainProviderRegistrationOptions } = {};
    private static defaultProviderOptions: ITrainProviderRegistrationOptions = null;
}
