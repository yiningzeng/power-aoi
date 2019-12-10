import { ExportProviderFactory } from "./providers/export/exportProviderFactory";
import { TrainProviderFactory } from "./providers/trainSettings/trainProviderFactory";
import { PascalVOCExportProvider } from "./providers/export/pascalVOC";
import { TFRecordsExportProvider } from "./providers/export/tensorFlowRecords";
import { PowerAiExportProvider } from "./providers/export/powerAi";
import { AssetProviderFactory } from "./providers/storage/assetProviderFactory";
import { BingImageSearch } from "./providers/storage/bingImageSearch";
import { LocalFileSystemProxy } from "./providers/storage/localFileSystemProxy";
import { StorageProviderFactory } from "./providers/storage/storageProviderFactory";
import registerToolbar from "./registerToolbar";
import { strings } from "./common/strings";
import { HostProcessType } from "./common/hostProcess";
import { AzureCustomVisionProvider } from "./providers/export/azureCustomVision";
import { CntkExportProvider } from "./providers/export/cntk";
import {CocoExportProvider} from "./providers/export/coco";
import {Yolov3Provider} from "./providers/trainSettings/yolov3";
import {FasterRcnnProvider} from "./providers/trainSettings/fasterRcnn";
import {MaskRcnnProvider} from "./providers/trainSettings/maskRcnn";
import {FasterRcnn2Provider} from "./providers/trainSettings/fasterRcnn2";
import {MaskRcnn2Provider} from "./providers/trainSettings/maskRcnn2";
import {Yolov3PytorchProvider} from "./providers/trainSettings/yolov3Pytorch";

/**
 * Registers storage, asset and export providers, as well as all toolbar items
 */
export default function registerProviders() {
    // Storage Providers
    StorageProviderFactory.register({
        name: "localFileSystemProxy",
        displayName: strings.connections.providers.local.title,
        platformSupport: HostProcessType.Electron,
        factory: (options) => new LocalFileSystemProxy(options),
    });
    // Asset Providers
    AssetProviderFactory.register({
        name: "localFileSystemProxy",
        displayName: strings.connections.providers.local.title,
        platformSupport: HostProcessType.Electron,
        factory: (options) => new LocalFileSystemProxy(options),
    });
    // AssetProviderFactory.register({
    //     name: "azureBlobStorage",
    //     displayName: strings.connections.providers.azureBlob.title,
    //     factory: (options) => new AzureBlobStorage(options),
    // });
    // AssetProviderFactory.register({
    //     name: "bingImageSearch",
    //     displayName: strings.connections.providers.bing.title,
    //     factory: (options) => new BingImageSearch(options),
    // });

    // Export Providers
    ExportProviderFactory.register({
        name: "coco",
        displayName: strings.export.providers.coco.displayName,
        factory: (project, options) => new CocoExportProvider(project, options),
    });
    ExportProviderFactory.register({
        name: "pascalVOC",
        displayName: strings.export.providers.pascalVoc.displayName,
        factory: (project, options) => new PascalVOCExportProvider(project, options),
    });
    ExportProviderFactory.register({
        name: "tensorFlowRecords",
        displayName: strings.export.providers.tfRecords.displayName,
        factory: (project, options) => new TFRecordsExportProvider(project, options),
    });
    ExportProviderFactory.register({
        name: "powerAi",
        displayName: strings.export.providers.powerAi.displayName,
        factory: (project, options) => new PowerAiExportProvider(project, options),
    });
    // ExportProviderFactory.register({
    //     name: "azureCustomVision",
    //     displayName: strings.export.providers.azureCV.displayName,
    //     factory: (project, options) => new AzureCustomVisionProvider(project, options),
    // });
    // ExportProviderFactory.register({
    //     name: "cntk",
    //     displayName: strings.export.providers.cntk.displayName,
    //     factory: (project, options) => new CntkExportProvider(project, options),
    // });

    // train
    TrainProviderFactory.register({
        name: "yolov3",
        displayName: strings.train.providers.yolov3.displayName,
        factory: (project, options) => new Yolov3Provider(project, options),
    });
    TrainProviderFactory.register({
        name: "yolov3Pytorch",
        displayName: strings.train.providers.yolov3Pytorch.displayName,
        factory: (project, options) => new Yolov3PytorchProvider(project, options),
    });
    // TrainProviderFactory.register({
    //     name: "fasterRcnn",
    //     displayName: strings.train.providers.fasterRcnn.displayName,
    //     factory: (project, options) => new FasterRcnnProvider(project, options),
    // });
    // TrainProviderFactory.register({
    //     name: "maskRcnn",
    //     displayName: strings.train.providers.maskRcnn.displayName,
    //     factory: (project, options) => new MaskRcnnProvider(project, options),
    // });

    TrainProviderFactory.register({
        name: "fasterRcnn2",
        displayName: strings.train.providers.fasterRcnn2.displayName,
        factory: (project, options) => new FasterRcnn2Provider(project, options),
    });
    TrainProviderFactory.register({
        name: "maskRcnn2",
        displayName: strings.train.providers.maskRcnn2.displayName,
        factory: (project, options) => new MaskRcnn2Provider(project, options),
    });
    // TrainProviderFactory.register({
    //     name: "maskRcnn",
    //     displayName: strings.train.providers.maskRcnn.displayName,
    //     factory: (project, options) => new MaskRcnnProvider(project, options),
    // });
    // TrainProviderFactory.register({
    //     name: "remoteTrain",
    //     displayName: strings.train.providers.maskRcnn.displayName,
    //     factory: (project, options) => new MaskRcnnProvider(project, options),
    // });
    // TrainProviderFactory.register({
    //     name: "fpn",
    //     displayName: "FPN",
    //     factory: (project, options) => new FasterRcnnProvider(project, options),
    // });
    registerToolbar();
}
