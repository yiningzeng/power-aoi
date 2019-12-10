// region 界面参数
export interface IYoloV3 {
    gpu_numb: number;
    yolov3net: IYoloV3Net;
}

export interface IDetectron {
    detectron: {
        netModelType: NetModelType,
        layerNumbEnum: string;
        gpuNumb: number;
        fpn: boolean;
        augument: boolean;
        multiScale: boolean;
        useFlipped: boolean;
    };
}
// endregion

// region yolov3
export interface IYoloV3Net {
    batch: number;
    subdivisions: number;
    width: number;
    height: number;
    channels: number;
    momentum: number;
    decay: number;
    angle: number;
    saturation: number;
    exposure: number;
    hue: number;
    learning_rate: number; // 0.001;
    burn_in: number; // 1000;
    max_batches: number; // 500200;
    policy: string; // steps;
    steps: string; // 400000,450000;
    scales: string; // .1,.1;
}
// endregion yolov3

// region detectron
export enum NetModelType {
    MaskRcnn = "maskRcnn",
    RetinaNet = "retinaNet",
    FasterRcnn = "fasterRcnn",
    YoloV3 = "yoloV3",
}

// 最新的faster Rcnn 配置
export interface IMaskRcnnCondig {
    // MODEL: {
    MODEL_TYPE: string;
    MODEL_CONV_BODY: string;
    MODEL_NUM_CLASSES: number;
    MODEL_FASTER_RCNN: boolean;
    MODEL_MASK_ON: boolean;
    // };
    NUM_GPUS: number;
    // SOLVER: {
    SOLVER_WEIGHT_DECAY: number;
    SOLVER_LR_POLICY: string;
    SOLVER_BASE_LR: number;
    SOLVER_GAMMA: number;
    SOLVER_MAX_ITER: number;
    SOLVER_STEPS: [number, number, number];
    // };
    // FPN: {
    FPN_FPN_ON: boolean;
    FPN_MULTILEVEL_ROIS: boolean;
    FPN_MULTILEVEL_RPN: boolean;
    // };
    // FAST_RCNN: {
    FAST_RCNN_ROI_BOX_HEAD: string;
    FAST_RCNN_ROI_XFORM_METHOD: string;
    FAST_RCNN_ROI_XFORM_RESOLUTION: number;
    FAST_RCNN_ROI_XFORM_SAMPLING_RATIO: number;
    // MRCNN
    MRCNN_ROI_MASK_HEAD: string;
    MRCNN_RESOLUTION: number;
    MRCNN_ROI_XFORM_METHOD: string;
    MRCNN_ROI_XFORM_RESOLUTION: number;
    MRCNN_ROI_XFORM_SAMPLING_RATIO: number;
    MRCNN_DILATION: number;
    MRCNN_CONV_INIT: string;
    // };
    // TRAIN: {
    TRAIN_WEIGHTS: string;
    TRAIN_DATASETS: string;
    TRAIN_SCALES: string;
    TRAIN_MAX_SIZE: number;
    TRAIN_BATCH_SIZE_PER_IM: number;
    TRAIN_RPN_PRE_NMS_TOP_N: number;
    // };
    // TEST: {
    TEST_DATASETS: string;
    TEST_SCALE: number;
    TEST_MAX_SIZE: number;
    TEST_NMS: number;
    TEST_RPN_PRE_NMS_TOP_N: number;
    TEST_RPN_POST_NMS_TOP_N: number;
    // };
    OUTPUT_DIR: string;
}

// 最新的faster Rcnn 配置
export interface IFasterRcnnCondig {
    // MODEL: {
    MODEL_TYPE: string;
    MODEL_CONV_BODY: string;
    MODEL_NUM_CLASSES: number;
    MODEL_FASTER_RCNN: boolean;
    // };
    NUM_GPUS: number;
    // SOLVER: {
    SOLVER_WEIGHT_DECAY: number;
    SOLVER_LR_POLICY: string;
    SOLVER_BASE_LR: number;
    SOLVER_GAMMA: number;
    SOLVER_MAX_ITER: number;
    SOLVER_STEPS: [number, number, number];
    // };
    // FPN: {
    FPN_FPN_ON: boolean;
    FPN_MULTILEVEL_ROIS: boolean;
    FPN_MULTILEVEL_RPN: boolean;
    // };
    // FAST_RCNN: {
    FAST_RCNN_ROI_BOX_HEAD: string;
    FAST_RCNN_ROI_XFORM_METHOD: string;
    FAST_RCNN_ROI_XFORM_RESOLUTION: number;
    FAST_RCNN_ROI_XFORM_SAMPLING_RATIO: number;
    // };
    // TRAIN: {
    TRAIN_WEIGHTS: string;
    TRAIN_DATASETS: string;
    TRAIN_SCALES: string;
    TRAIN_MAX_SIZE: number;
    TRAIN_BATCH_SIZE_PER_IM: number;
    TRAIN_RPN_PRE_NMS_TOP_N: number;
    NEGATIVE: boolean;
    MULTI_SCALE: boolean;
    CROP_SCALE: number;
    MULTI_COLOR: boolean;
    ROTATION: boolean;
    ROT: number;
    ROT_RANDOM: boolean;
    ROT_RANDOM_ANGLE: number;
    // };
    // TEST: {
    TEST_DATASETS: string;
    TEST_SCALE: number;
    TEST_MAX_SIZE: number;
    TEST_NMS: number;
    TEST_RPN_PRE_NMS_TOP_N: number;
    TEST_RPN_POST_NMS_TOP_N: number;
    // };
    OUTPUT_DIR: string;
}

// fasterRcnn 配置文件的接口
export interface IFasterRcnnCondigGiveUp {
    MODEL: IMODEL;
    NUM_GPUS: number;
    SOLVER: ISOLVER;
    FPN: IFPN;
    FAST_RCNN: IFASTRCNN;
    TRAIN: ITRAIN;
    TEST: ITEST;
    OUTPUT_DIR: string;
}

export interface IMODEL {
    TYPE: string;
    CONV_BODY: string;
    NUM_CLASSES: number;
    FASTER_RCNN: true;
}

export interface ISOLVER {
    WEIGHT_DECAY: number;
    LR_POLICY: string;
    BASE_LR: number;
    GAMMA: number;
    MAX_ITER: number;
    STEPS: [number, number, number];
}

export interface IFPN {
    FPN_ON: true;
    MULTILEVEL_ROIS: true;
    MULTILEVEL_RPN: true;
}

export interface IFASTRCNN {
    ROI_BOX_HEAD: string;
    ROI_XFORM_METHOD: string;
    ROI_XFORM_RESOLUTION: number;
    ROI_XFORM_SAMPLING_RATIO: number;
}

export interface ITRAIN {
    WEIGHTS: string;
    DATASETS: string;
    SCALES: string;
    MAX_SIZE: number;
    BATCH_SIZE_PER_IM: number;
    RPN_PRE_NMS_TOP_N: number;
    AUGUMENT: boolean; // 数据增强
    MULTI_SCALE: boolean; // 多尺度
    USE_FLIPPED: boolean; // 图像旋转
}

export interface ITEST {
    DATASETS: string;
    SCALE: number;
    MAX_SIZE: number;
    NMS: number;
    RPN_PRE_NMS_TOP_N: number;
    RPN_POST_NMS_TOP_N: number;
}
// endregion detectron
