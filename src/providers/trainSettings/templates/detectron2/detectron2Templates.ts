export const detectron2Template = "" +
    "_BASE_: ${_BASE_}\n" +
    "VERSION: 2\n" +
    "MODEL:\n" +
    "  WEIGHTS: ${WEIGHTS}\n" +
    "  MASK_ON: ${MASK_ON}\n" +
    "  ROI_HEADS:\n" +
    "    NUM_CLASSES: ${NUM_CLASSES}\n" +
    "  RESNETS:\n" +
    "    DEPTH: ${DEPTH}\n" +
    "  PIXEL_STD: ${PIXEL_STD}\n" +
    "DATASETS:\n" +
    "  TRAIN: ${TRAIN}\n" +
    "  TEST: ${TEST}\n" +
    "DATALOADER:\n" +
    "  NUM_WORKERS: ${NUM_WORKERS}\n" +
    "  ASPECT_RATIO_GROUPING: ${ASPECT_RATIO_GROUPING}\n" +
    "  SAMPLER_TRAIN: ${SAMPLER_TRAIN}\n" +
    "  REPEAT_THRESHOLD: ${REPEAT_THRESHOLD}\n" +
    "SOLVER:\n" +
    "  IMS_PER_BATCH: ${IMS_PER_BATCH}\n" +
    "  MAX_ITER: ${MAX_ITER}\n" +
    "  STEPS: ${STEPS}\n" +
    "INPUT:\n" +
    "  MIN_SIZE_TRAIN: ${MIN_SIZE_TRAIN}\n" +
    "  MAX_SIZE_TRAIN: ${MAX_SIZE_TRAIN}\n" +
    "  CROP:\n" +
    "    ENABLED: ${ENABLED}\n" +
    "    TYPE: ${TYPE}\n" +
    "    SIZE: ${SIZE}\n" +
    "OUTPUT_DIR: \"/detectron2/datasets/output\"\n";
