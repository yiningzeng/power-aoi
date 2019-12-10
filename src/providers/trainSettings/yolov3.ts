import _ from "lodash";
import { TrainProvider } from "./trainProvider";
import { IProject, IAssetMetadata, ITag, IExportProviderOptions } from "../../models/applicationState";
import Guard from "../../common/guard";
import HtmlFileReader from "../../common/htmlFileReader";
// import { itemTemplate, annotationTemplate, objectTemplate } from "./pascalVOC/pascalVOCTemplates";
import { interpolate } from "../../common/strings";
import os from "os";
import {IDetectron, IYoloV3} from "../../models/trainConfig";
import {constants} from "../../common/constants";
import {yolov3Template} from "./templates/yolov3/yolov3Templates";

interface IObjectInfo {
    name: string;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

interface IImageInfo {
    width: number;
    height: number;
    objects: IObjectInfo[];
}

const trainSettings: IYoloV3 = {
    gpu_numb: 0,
    yolov3net: {
        batch: 64,
        subdivisions: 32,
        decay: 0.0005,
        angle: 0,
        saturation: 1.5,
        exposure: 1.5,
        hue: .1,
        learning_rate: 0.001,
        burn_in: 1000,
        max_batches: 100000,
        width: 416,
        height: 416,
        channels: 3,
        policy: "steps",
        steps: "80000,90000",
        scales: ".1,.1",
        momentum: 0.9,
    },
};

/**
 * Export options for Pascal VOC Export Provider
 */
export interface IYoloV3ProviderOptions extends IExportProviderOptions {
    /** The test / train split ratio for exporting data */
    testTrainSplit?: number;
    /** Whether or not to include unassigned tags in exported data */
    exportUnassigned?: boolean;
}

/**
 * @name - PascalVOC Export Provider
 * @description - Exports a project into a Pascal VOC
 */
export class Yolov3Provider extends TrainProvider<IYoloV3ProviderOptions> {
    private imagesInfo = new Map<string, IImageInfo>();

    constructor(project: IProject, options: IYoloV3ProviderOptions) {
        super(project, options);
        Guard.null(options);
    }

    /**
     * Export project to PascalVOC
     */
    public async export(): Promise<void> {
        const exportFolderName = `${this.project.name.replace(/\s/g, "-")}-PascalVOC-export`;
        let config: IYoloV3 = this.project.trainFormat.providerOptions as IYoloV3;
        const max = config.yolov3net.max_batches;
        const step = `${(max * 0.8).toFixed()},${(max * 0.9).toFixed()}`;
        config = {
            ...config,
            yolov3net: {
                ...config.yolov3net,
                steps: step,
                policy: "steps",
                scales: ".1,.1",
                momentum: 0.9,
            },
        };
        let gps = "0";
        for (let i = 1; i < config.gpu_numb; i++) {
            gps = `${gps},${i}`;
        }
        await this.storageProvider.writeText(`${exportFolderName}/use_gpus`, gps);
        console.log(`导出1：${JSON.stringify(this.project.trainFormat.providerOptions)}`);
        console.log(`导出2：${JSON.stringify(config)}`);
        const fileName = `${exportFolderName}/yolov3-voc.cfg`;
        await this.storageProvider.writeText(fileName, interpolate(yolov3Template, config.yolov3net));

    }

    // private async exportPBTXT(exportFolderName: string, project: IProject) {
    //     if (project.tags && project.tags.length > 0) {
    //         // Save pascal_label_map.pbtxt
    //         const pbtxtFileName = `${exportFolderName}/pascal_label_map.pbtxt`;
    //
    //         let id = 1;
    //         const items = project.tags.map((element) => {
    //             const params = {
    //                 id: (id++).toString(),
    //                 tag: element.name,
    //             };
    //
    //             return interpolate(itemTemplate, params);
    //         });
    //
    //         await this.storageProvider.writeText(pbtxtFileName, items.join(""));
    //     }
    // }
}
