export const fasterRcnnTemplate = "MODEL:\n" +
    "  TYPE: ${MODEL_TYPE}\n" +
    "  CONV_BODY: ${MODEL_CONV_BODY}\n" +
    "  NUM_CLASSES: ${MODEL_NUM_CLASSES}\n" +
    "  FASTER_RCNN: ${MODEL_FASTER_RCNN}\n" +
    "NUM_GPUS: ${NUM_GPUS}\n" +
    "SOLVER:\n" +
    "  WEIGHT_DECAY: ${SOLVER_WEIGHT_DECAY}\n" +
    "  LR_POLICY: ${SOLVER_LR_POLICY}\n" +
    "  BASE_LR: ${SOLVER_BASE_LR}\n" +
    "  GAMMA: ${SOLVER_GAMMA}\n" +
    "  MAX_ITER: ${SOLVER_MAX_ITER}\n" +
    "  STEPS: ${SOLVER_STEPS}\n" +
    "FPN:\n" +
    "  FPN_ON: ${FPN_FPN_ON}\n" +
    "  MULTILEVEL_ROIS: ${FPN_MULTILEVEL_ROIS}\n" +
    "  MULTILEVEL_RPN: ${FPN_MULTILEVEL_RPN}\n" +
    "FAST_RCNN:\n" +
    "  ROI_BOX_HEAD: ${FAST_RCNN_ROI_BOX_HEAD}\n" +
    "  ROI_XFORM_METHOD: ${FAST_RCNN_ROI_XFORM_METHOD}\n" +
    "  ROI_XFORM_RESOLUTION: ${FAST_RCNN_ROI_XFORM_RESOLUTION}\n" +
    "  ROI_XFORM_SAMPLING_RATIO: ${FAST_RCNN_ROI_XFORM_SAMPLING_RATIO}\n" +
    "TRAIN:\n" +
    "  WEIGHTS: ${TRAIN_WEIGHTS}\n" +
    "  DATASETS: ${TRAIN_DATASETS}\n" +
    "  SCALES: ${TRAIN_SCALES}\n" +
    "  MAX_SIZE: ${TRAIN_MAX_SIZE}\n" +
    "  BATCH_SIZE_PER_IM: ${TRAIN_BATCH_SIZE_PER_IM}\n" +
    "  RPN_PRE_NMS_TOP_N: ${TRAIN_RPN_PRE_NMS_TOP_N}\n" +
    "  NEGATIVE: ${NEGATIVE}\n" +
    "  MULTI_SCALE: ${MULTI_SCALE}\n" +
    "  CROP_SCALE: ${CROP_SCALE}\n" +
    "  MULTI_COLOR: ${MULTI_COLOR}\n" +
    "  ROTATION: ${ROTATION}\n" +
    "  ROT: ${ROT}\n" +
    "  ROT_RANDOM: ${ROT_RANDOM}\n" +
    "  ROT_RANDOM_ANGLE: ${ROT_RANDOM_ANGLE}\n" +
    "TEST:\n" +
    "  DATASETS: ${TEST_DATASETS}\n" +
    "  SCALE: ${TEST_SCALE}\n" +
    "  MAX_SIZE: ${TEST_MAX_SIZE}\n" +
    "  NMS: ${TEST_NMS}\n" +
    "  RPN_PRE_NMS_TOP_N: ${TEST_RPN_PRE_NMS_TOP_N}\n" +
    "  RPN_POST_NMS_TOP_N: ${TEST_RPN_POST_NMS_TOP_N}\n" +
    "OUTPUT_DIR: ${OUTPUT_DIR}\n";
