import Guard from "../../common/guard";
import {
    IProject, IExportFormat, IAssetMetadata, IAsset,
    AssetState, AssetType, IExportProviderOptions,
} from "../../models/applicationState";
import { IStorageProvider, StorageProviderFactory } from "../storage/storageProviderFactory";
import { IAssetProvider, AssetProviderFactory } from "../storage/assetProviderFactory";
import _ from "lodash";
import { AssetService } from "../../services/assetService";
import {ITrainConfigResults} from "../export/exportProvider";

/**
 * @name - TF Pascal VOC Records Export Asset State
 * @description - Defines the asset type export option
 * @member All - Specifies that all assets will be exported
 * @member Visited - Specifies that visited (including tagged) assets will be exported
 * @member Tagged - Specifies that only tagged assets will be exported
 */
export enum ExportAssetState {
    All = "all",
    Visited = "visited",
    Tagged = "tagged",
}

export interface IExportAssetResult {
    asset: IAssetMetadata;
    success: boolean;
    error?: string;
}

export interface IExportResults {
    completed: IExportAssetResult[];
    errors: IExportAssetResult[];
    count: number;
}

/**
 * @name - IExportProvider
 * @description - Defines the required interface for all VoTT export providers
 */
export interface ITrainProvider {
    /**
     * Gets or set the project to be exported
     */
    project: IProject;

    /**
     * Exports the configured project for specified export configuration
     */
    export(): Promise<void> | Promise<ITrainConfigResults>;
    save?(exportFormat: IExportFormat): Promise<any>;
}

/**
 * Base class implementation for all VoTT export providers
 * Provides quick access to the configured projects asset & storage providers
 */
export abstract class TrainProvider
    <TOptions extends IExportProviderOptions = IExportProviderOptions> implements ITrainProvider {
    private storageProviderInstance: IStorageProvider;
    private assetProviderInstance: IAssetProvider;
    private assetService: AssetService;

    constructor(public project: IProject, protected options?: TOptions) {
        Guard.null(project);
        this.assetService = new AssetService(this.project);
    }

    public abstract export(): Promise<void> | Promise<ITrainConfigResults>;

    /**
     * Gets the storage provider for the current project
     */
    protected get storageProvider(): IStorageProvider {
        if (this.storageProviderInstance) {
            return this.storageProviderInstance;
        }

        this.storageProviderInstance = StorageProviderFactory.create(
            this.project.targetConnection.providerType,
            this.project.targetConnection.providerOptions,
        );

        return this.storageProviderInstance;
    }
}
