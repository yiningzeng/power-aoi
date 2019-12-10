import {TrainProvider} from "./trainProvider";
import {
    ICocoCategories,
    IDetectron2,
    IExportProviderOptions,
    IProject,
    ITagDetectron2,
} from "../../models/applicationState";
import Guard from "../../common/guard";
import YAML from "json2yaml";
import {interpolate} from "../../common/strings";
import {detectron2Template} from "./templates/detectron2/detectron2Templates";
import hexrgb from "hexrgb";
/**
 * hexrgb.hex2rgb('#ff0000'); // return 'rgb(255,0,0)'
 * hexrgb.hex2rgb('#ff0, true); // return [255, 255, 0]
 * hexrgb.rgb2hex('rgb(255, 255, 0)'); // return '#ffff00'
 * hexrgb.rgb2hex('rgb(255, 255, 0)', true); // return ['ff', 'ff', '00']
 * hexrgb.rgb2hex('rgba(255, 134, 0, 0)') // return 'transparent'
 */

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
export class MaskRcnn2Provider extends TrainProvider<IFasterRcnnProviderOptions> {

    constructor(project: IProject, options: IFasterRcnnProviderOptions) {
        super(project, options);
        Guard.null(options);
    }

    /**
     * Export project to PascalVOC
     */
    public async export(): Promise<void> {
        if (this.project.tags.length === 0) {
            return;
        }
        const config: IDetectron2 = this.project.trainFormat.providerOptions as IDetectron2;
        let weights = "";
        switch (config.detectron2.MODEL.RESNETS.DEPTH) {
            case 50:
                weights = "/detectron2/models/R-50.pkl";
                break;
            case 101:
                weights = "/detectron2/models/R-101.pkl";
                break;
        }
        const newConfig: IDetectron2 = {
            ...config,
            detectron2: {
                ...config.detectron2,
                _BASE_: "/detectron2/configs/Base-RCNN-FPN.yaml",
                MODEL: {
                    ...config.detectron2.MODEL,
                    ROI_HEADS: {
                        NUM_CLASSES: `${this.project.tags.length}`,
                    },
                    MASK_ON: true,
                    WEIGHTS: weights,
                    PIXEL_STD: "[1.0, 1.0, 1.0]",
                },
                SOLVER: {
                    ...config.detectron2.SOLVER,
                    STEPS: `(${config.detectron2.SOLVER.MAX_ITER * 0.8},${config.detectron2.SOLVER.MAX_ITER * 0.9})`,
                    IMS_PER_BATCH: config.detectron2.SOLVER.IMS_PER_BATCH === "auto" ?
                        `${config.use_gpus * 2}` : config.detectron2.SOLVER.IMS_PER_BATCH,
                },
                DATASETS: {
                    TRAIN: "(\"coco_2014_train\",)",
                    TEST: "(\"coco_2014_val\",)",
                },
                DATALOADER: {
                    ...config.detectron2.DATALOADER,
                    REPEAT_THRESHOLD: config.detectron2.DATALOADER.REPEAT_THRESHOLD.toString().indexOf(".") > 0 ?
                        config.detectron2.DATALOADER.REPEAT_THRESHOLD : `${config.detectron2.DATALOADER.REPEAT_THRESHOLD}.0`,
                },
                OUTPUT_DIR: "/detectron2/datasets/output",
            },
        };
        // 输出使用的gpu数量
        await this.storageProvider.writeText(`coco-json-export/use_gpus`, `${config.use_gpus}`);

        // region 输出 coco_categories.cjson 用于训练的时候生成指定的标和数量 并且转换coco数据的时候保证标签的顺序不会乱
        const categories: ITagDetectron2[] = [];
        let i = 1;
        await this.project.tags.mapAsync(async (v) => {
            const item: ITagDetectron2 = {
                id: i,
                color: hexrgb.hex2rgb(v.color, true),
                isthing: 1,
                name: v.name,
            };
            i++;
            categories.push(item);
        });
        const cocoCategories: ICocoCategories = {
            things_num: this.project.tags.length,
            not_things_num: 0,
            categories,
        };
        // endregion

        const pars = {
            ...newConfig.detectron2,
            ...newConfig.detectron2.MODEL,
            ...newConfig.detectron2.MODEL.ROI_HEADS,
            ...newConfig.detectron2.MODEL.RESNETS,
            ...newConfig.detectron2.INPUT,
            ...newConfig.detectron2.INPUT.CROP,
            ...newConfig.detectron2.SOLVER,
            ...newConfig.detectron2.DATALOADER,
            ...newConfig.detectron2.DATASETS,
        };
        await this.storageProvider.writeText(`coco-json-export/coco_categories.cjson`,
            JSON.stringify(cocoCategories, null, 4));
        await this.storageProvider.writeText(`coco-json-export/train-config.yaml`,
            interpolate(detectron2Template, pars));
    }
}
