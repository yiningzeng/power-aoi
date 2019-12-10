import _ from "lodash";
import { TrainProvider } from "./trainProvider";
import { IProject, IAssetMetadata, ITag, IExportProviderOptions } from "../../models/applicationState";
import Guard from "../../common/guard";
import { IMaskRcnnCondig} from "../../models/trainConfig";
import YAML from "json2yaml";
import {interpolate} from "../../common/strings";
import {maskRcnnTemplate} from "./templates/detectron/maskRcnnTemplates";

const trainSettings: IMaskRcnnCondig  = {
// MODEL:,
    MODEL_TYPE: "generalized_rcnn",
    MODEL_CONV_BODY: "FPN.add_fpn_ResNet50_conv5_body",
    MODEL_NUM_CLASSES: 4,
    MODEL_FASTER_RCNN: true,
    MODEL_MASK_ON: true,
    NUM_GPUS: 1,
// SOLVER:,
    SOLVER_WEIGHT_DECAY: 0.0001,
    SOLVER_LR_POLICY: "steps_with_decay",
    SOLVER_BASE_LR: 0.02,
    SOLVER_GAMMA: 0.1,
    SOLVER_MAX_ITER: 90000,
    SOLVER_STEPS: [0, 60000, 80000],
// FPN:,
    FPN_FPN_ON: true,
    FPN_MULTILEVEL_ROIS: true,
    FPN_MULTILEVEL_RPN: true,
// FAST_RCNN:,
    FAST_RCNN_ROI_BOX_HEAD: "fast_rcnn_heads.add_roi_2mlp_head",
    FAST_RCNN_ROI_XFORM_METHOD: "RoIAlign",
    FAST_RCNN_ROI_XFORM_RESOLUTION: 7,
    FAST_RCNN_ROI_XFORM_SAMPLING_RATIO: 2,
// MRCNN:,
    MRCNN_ROI_MASK_HEAD: "mask_rcnn_heads.mask_rcnn_fcn_head_v1up4convs",
    MRCNN_RESOLUTION: 28,
    MRCNN_ROI_XFORM_METHOD: "RoIAlign",
    MRCNN_ROI_XFORM_RESOLUTION: 14,
    MRCNN_ROI_XFORM_SAMPLING_RATIO: 2,
    MRCNN_DILATION: 1,
    MRCNN_CONV_INIT: "MSRAFill",
// TRAIN:,
    TRAIN_WEIGHTS: "https://dl.fbaipublicfiles.com/detectron/ImageNetPretrained/MSRA/R-50.pkl",
    TRAIN_DATASETS: "('coco_2014_train', 'coco_2014_valminusminival')",
    TRAIN_SCALES: "(800,)",
    TRAIN_MAX_SIZE: 833,
    TRAIN_BATCH_SIZE_PER_IM: 32,
    TRAIN_RPN_PRE_NMS_TOP_N: 2000,
// TEST:,
    TEST_DATASETS: "('coco_2014_minival',)",
    TEST_SCALE: 800,
    TEST_MAX_SIZE: 833,
    TEST_NMS: 0.5,
    TEST_RPN_PRE_NMS_TOP_N: 1000,
    TEST_RPN_POST_NMS_TOP_N: 1000,
OUTPUT_DIR: ".",
};

/**
 * Export options for Pascal VOC Export Provider
 */
export interface IFasterRcnnProviderOptions extends IExportProviderOptions {
    /** The test / train split ratio for exporting data */
    testTrainSplit?: number;
    /** Whether or not to include unassigned tags in exported data */
    exportUnassigned?: boolean;
}

/**
 * @name - PascalVOC Export Provider
 * @description - Exports a project into a Pascal VOC
 */
export class MaskRcnnProvider extends TrainProvider<IFasterRcnnProviderOptions> {

    constructor(project: IProject, options: IFasterRcnnProviderOptions) {
        super(project, options);
        Guard.null(options);
    }

    /**
     * Export project to PascalVOC
     */
    public async export(): Promise<void> {
        console.log("这里已经只是简单的导出！所有的训练操作代码在 /src/electron/providers/training/trainingSystem.ts");
        await this.storageProvider.writeText(`train-config/train-config.yaml`,
            interpolate(maskRcnnTemplate, trainSettings));
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

        // await this.storageProvider.writeText(`train-config/train-config.yaml`,
        //     YAML.stringify(trainSettings));
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
