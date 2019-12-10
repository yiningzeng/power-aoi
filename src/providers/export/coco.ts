import { ExportProvider } from "./exportProvider";
import {IProject, IExportProviderOptions, IActiveLearningSettings} from "../../models/applicationState";
import { IFasterRcnnCondig } from "../../models/trainConfig";
import Guard from "../../common/guard";
import { constants } from "../../common/constants";
import HtmlFileReader from "../../common/htmlFileReader";
import YAML from "json2yaml";

/**
 * @name - Vott Json Export Provider
 * @description - Exports a project into a single JSON file that include all configured assets
 */
export class CocoExportProvider extends ExportProvider {
    constructor(project: IProject, options: IExportProviderOptions) {
        super(project, options);
        Guard.null(options);
    }
    /**
     * Export project to Coco format
     */
    public async export(): Promise<void> {
        // trainSettings.MODEL.NUM_CLASSES = this.project.tags.length + 1;
        // trainSettings.TRAIN.AUGUMENT = this.project.trainSettings.augument;
        // trainSettings.TRAIN.MULTI_SCALE = this.project.trainSettings.multiScale;
        // trainSettings.TRAIN.USE_FLIPPED = this.project.trainSettings.useFlipped;
        // trainSettings.NUM_GPUS = this.project.trainSettings.gpuNumb;
        // switch (this.project.trainSettings.layerNumbEnum) {
        //     case "50":
        //         trainSettings.TRAIN.WEIGHTS = "/Detectron/models/R-50.pkl";
        //         break;
        //     case "101":
        //         trainSettings.TRAIN.WEIGHTS = "/Detectron/models/R-101.pkl";
        //         break;
        // }
        // switch (this.project.trainSettings.gpuNumb) {
        //     case 1:
        //         trainSettings.SOLVER.BASE_LR = 0.0025;
        //         trainSettings.SOLVER.MAX_ITER = 60000;
        //         trainSettings.SOLVER.STEPS = [0, 30000, 40000];
        //         break;
        //     case 2:
        //         trainSettings.SOLVER.BASE_LR = 0.005;
        //         trainSettings.SOLVER.MAX_ITER = 30000;
        //         trainSettings.SOLVER.STEPS = [0, 15000, 20000];
        //         break;
        //     case 4:
        //         trainSettings.SOLVER.BASE_LR = 0.01;
        //         trainSettings.SOLVER.MAX_ITER = 15000;
        //         trainSettings.SOLVER.STEPS = [0, 7500, 10000];
        //         break;
        //     case 8:
        //         trainSettings.SOLVER.BASE_LR = 0.02;
        //         trainSettings.SOLVER.MAX_ITER = 7500;
        //         trainSettings.SOLVER.STEPS = [0, 3750, 5000];
        //         break;
        // }
        // await this.storageProvider.writeText(`coco-json-export/train-config.yaml`,
        //     YAML.stringify(trainSettings));
        const results = await this.getAssetsForExport();
        await results.forEachAsync(async (assetMetadata) => {
            return new Promise<void>(async (resolve) => {
                const blob = await HtmlFileReader.getAssetBlob(assetMetadata.asset);
                if (blob == null) {
                    resolve();
                    return;
                }
                const assetFilePath = `coco-json-export/${assetMetadata.asset.name}`;
                await this.storageProvider.deleteContainer(assetFilePath);
                const fileReader = new FileReader();
                fileReader.onload = async () => {
                    try {
                        const buffer = Buffer.from(fileReader.result as ArrayBuffer);
                        await this.storageProvider.writeBinary(assetFilePath, buffer);
                        resolve();
                    } catch (e) {
                        console.error(e);
                    }
                };
                fileReader.readAsArrayBuffer(blob);
            });
        });

        // const exportObject: any = { ...this.project };
        // exportObject.assets = _.keyBy(results, (assetMetadata) => assetMetadata.asset.id);

        const fileName = `coco-json-export/${this.project.name.replace(" ", "-")}${constants.exportCoCoFileExtension}`;
        await this.storageProvider.writeText(fileName, JSON.stringify(results, null, 4));
    }
}
