import { IAppStrings } from "../strings";

/**
 * App Strings for English language
 */
export const english: IAppStrings = {
    appName: "Visual Object Tagging Tool",
    common: {
        displayName: "Display Name",
        description: "Description",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        provider: "Provider",
        trainProvider: "net",
        homePage: "Home Page",
    },
    titleBar: {
        help: "Help",
        minimize: "Minimize",
        maximize: "Maximize",
        restore: "Restore",
        close: "Close",
    },
    assetsFolderBar: {
        addFolder: "Add Assets Folder",
        importAssets: "Import Tagged Assets",
    },
    homePage: {
        newProject: "New Project",
        openLocalProject: {
            title: "Open Local Project",
        },
        openTransferProject: {
            title: "Open Local Transfer Project",
        },
        openCloudProject: {
            title: "Open Cloud Project",
            selectConnection: "Select a Connection",
        },
        recentProjects: "Recent Projects",
        deleteProject: {
            title: "Delete Project",
            confirmation: "Are you sure you want to delete project",
        },
        importProject: {
            title: "Import Project",
            confirmation: "Are you sure you want to convert project ${project.file.name} project settings " +
                "to v2 format? We recommend you backup the project file first.",
        },
        messages: {
            deleteSuccess: "Successfully deleted ${project.name}",
        },
    },
    appSettings: {
        title: "Application Settings",
        storageTitle: "Storage Settings",
        uiHelp: "Where your settings are stored",
        save: "Save Settings",
        securityToken: {
            name: {
                title: "Name",
            },
            key: {
                title: "Key",
            },
        },
        securityTokens: {
            title: "Security Tokens",
            description: "Security tokens are used to encrypt sensitive data within your project configuration",
        },
        version: {
            description: "Version:",
        },
        commit: "Commit SHA",
        devTools: {
            description: "Open application developer tools to help diagnose issues",
            button: "Toggle Developer Tools",
        },
        reload: {
            description: "Reload the app discarding all current changes",
            button: "Refresh Application",
        },
        messages: {
            saveSuccess: "Successfully saved application settings",
        },
    },
    projectSettings: {
        title: "Project Settings",
        securityToken: {
            title: "Security Token",
            description: "Used to encrypt sensitive data within project files",
        },
        save: "Save Project",
        sourceConnection: {
            title: "Source Connection",
            description: "Where to load assets from",
            removeProvider: {
                title: "Remove Source Folder",
                confirmation: "Are you sure you want to remove source folder?",
            },
        },
        targetConnection: {
            title: "Target Connection",
            description: "Where to save the project and exported data",
        },
        videoSettings: {
            title: "Video Settings",
            description: "The rate at which frames are extracted for tagging.",
            frameExtractionRate: "Frame Extraction Rate (frames per a video second)",
        },
        addConnection: "Add Connection",
        messages: {
            saveSuccess: "Successfully saved ${project.name} project settings",
        },
    },
    projectMetrics: {
        title: "Project Metrics",
        assetsSectionTitle: "Assets",
        totalAssetCount: "Total Assets",
        visitedAssets: "Visited Assets (${count})",
        taggedAssets: "Tagged Assets (${count})",
        nonTaggedAssets: "Not Tagged Assets (${count})",
        nonVisitedAssets: "Not Visited Assets (${count})",
        tagsSectionTitle: "Tags & Labels",
        totalRegionCount: "Total Tagged Regions",
        totalTagCount: "Total Tags",
        avgTagCountPerAsset: "Average tags per asset",
        currentAsset: {
            name: "Current Asset's Name",
            size: "Current Asset's Size",
        },
    },
    tags: {
        title: "Tags",
        placeholder: "Add new tag",
        editor: "Tags Editor",
        modal: {
            name: "Tag Name",
            color: "Tag Color",
        },
        colors: {
            white: "White",
            gray: "Gray",
            red: "Red",
            maroon: "Maroon",
            yellow: "Yellow",
            olive: "Olive",
            lime: "Lime",
            green: "Green",
            aqua: "Aqua",
            teal: "Teal",
            blue: "Blue",
            navy: "Navy",
            fuschia: "Fuschia",
            purple: "Purple",
        },
        warnings: {
            existingName: "Tag name already exists. Choose another name",
            emptyName: "Cannot have an empty tag name",
            unknownTagName: "Unknown",
        },
        toolbar: {
            add: "Add new tag",
            search: "Search tags",
            edit: "Edit tag",
            lock: "Lock tag",
            moveUp: "Move tag up",
            moveDown: "Move tag down",
            delete: "Delete tag",
        },
    },
    connections: {
        title: "Connections",
        details: "Connection Details",
        settings: "Connection Settings",
        instructions: "Please select a connection to edit",
        save: "Save Connection",
        messages: {
            saveSuccess: "Successfully saved ${connection.name}",
            deleteSuccess: "Successfully deleted ${connection.name}",
        },
        imageCorsWarning: "Warning: When using VoTT in a Web browser, some assets from Bing Image \
                          Search may not export correctly due to CORS (Cross Origin Resource Sharing) restrictions.",
        blobCorsWarning: "Warning: CORS (Cross Domain Resource Sharing) must be enabled on the Azure Blob Storage \
                          account, in order to use it as a source or target connection. More information on \
                          enabling CORS can be found in the {0}",
        azDocLinkText: "Azure Documentation.",
        providers: {
            azureBlob: {
                title: "Azure Blob Storage",
                description: "",
                accountName: {
                    title: "Account Name",
                    description: "",
                },
                containerName: {
                    title: "Container Name",
                    description: "",
                },
                sas: {
                    title: "SAS",
                    description: "Shared access signature used to authenticate to the blob storage account",
                },
                createContainer: {
                    title: "Create Container",
                    description: "Creates the blob container if it does not already exist",
                },
            },
            bing: {
                title: "Bing Image Search",
                options: "Bing Image Search Options",
                apiKey: "API Key",
                query: "Query",
                aspectRatio: {
                    title: "Aspect Ratio",
                    all: "All",
                    square: "Square",
                    wide: "Wide",
                    tall: "Tall",
                },
            },
            local: {
                title: "Local File System",
                folderPath: "Folder Path",
                selectFolder: "Select Folder",
                chooseFolder: "Choose Folder",
            },
        },
    },
    editorPage: {
        width: "Width",
        height: "Height",
        tagged: "Tagged",
        visited: "Visited",
        assetsFolderBar: {
            importTaggedAssets: {
                progress: {
                    title: "Importing",
                    content: "Please be patient and have a cup of coffee.",
                },
                done: {
                    title: "Import success",
                    content: "Assets has been successfully imported",
                },
                errorPart: {
                    title: "注意！部分导入完成",
                    content: "个别目录导入失败，成功导入 (${part}) 个素材文件夹，可在素材文件夹列表查看",
                },
                error: {
                    title: "Import failed",
                    content: "Check that the folder contains the import.power-ai file",
                },
            },
        },
        toolbar: {
            select: "Select (V)",
            pan: "Pan",
            drawRectangle: "Draw Rectangle",
            drawPolygon: "Draw Polygon",
            drawPolygon2MinBox: "Draw the smallest circumscribed rectangle of polygon",
            drawWithPencil: "Draw with a pencil",
            copyRectangle: "Copy Rectangle",
            copy: "Copy Regions",
            cut: "Cut Regions",
            paste: "Paste Regions",
            removeAllRegions: "Remove All Regions",
            previousAsset: "Previous Asset",
            nextAsset: "Next Asset",
            saveProject: "Save Project",
            exportProject: "Export Train Assets",
            transferProject: "Transfer Project",
            activeLearning: "Active Learning",
            trainAi: "Start Learning",
            onlineTest: "Start Test",
        },
        videoPlayer: {
            previousTaggedFrame: {
                tooltip: "Previous Tagged Frame",
            },
            nextTaggedFrame: {
                tooltip: "Next Tagged Frame",
            },
            previousExpectedFrame: {
                tooltip: "Previous Frame",
            },
            nextExpectedFrame: {
                tooltip: "Next Frame",
            },
        },
        help: {
            title: "Toggle Help Menu",
            escape: "Escape Help Menu",
        },
        assetError: "Unable to load asset",
        tags: {
            hotKey: {
                apply: "Apply Tag with Hot Key",
                lock: "Lock Tag with Hot Key",
            },
            rename: {
                title: "Rename Tag",
                confirmation: "Are you sure you want to rename this tag? It will be renamed throughout all assets",
            },
            delete: {
                title: "Delete Tag",
                confirmation: "Are you sure you want to delete this tag? It will be deleted throughout all assets \
                and any regions where this is the only tag will also be deleted",
            },
        },
        canvas: {
            removeAllRegions: {
                title: "Remove All Regions",
                confirmation: "Are you sure you want to remove all regions?",
            },
            deleteAsset: {
                title: "Delete Asset",
                confirmation: "Are you sure you want to Delete Asset?",
            },
        },
        messages: {
            enforceTaggedRegions: {
                title: "Invalid region(s) detected",
                description: "1 or more regions have not been tagged.  Ensure all regions are tagged before \
                    continuing to next asset.",
            },
        },
    },
    export: {
        title: "Export",
        settings: "Export Settings",
        saveSettings: "Save Export Settings",
        providers: {
            common: {
                properties: {
                    assetState: {
                        title: "Asset State",
                        description: "Which assets to include in the export",
                        options: {
                            all: "All Assets",
                            visited: "Only Visited Assets",
                            tagged: "Only tagged Assets",
                        },
                    },
                    testTrainSplit: {
                        title: "Test / Train Split",
                        description: "The test train split to use for exported data",
                    },
                },
            },
            azureCV: {
                displayName: "Azure Custom Vision Service",
                regions: {
                    australiaEast: "Australia East",
                    centralIndia: "Central India",
                    eastUs: "East US",
                    eastUs2: "East US 2",
                    japanEast: "Japan East",
                    northCentralUs: "North Central US",
                    northEurope: "North Europe",
                    southCentralUs: "South Central US",
                    southeastAsia: "Southeast Asia",
                    ukSouth: "UK South",
                    westUs2: "West US 2",
                    westEurope: "West Europe",
                },
                properties: {
                    apiKey: {
                        title: "API Key",
                    },
                    region: {
                        title: "Region",
                        description: "The Azure region where your service is deployed",
                    },
                    classificationType: {
                        title: "Classification Type",
                        options: {
                            multiLabel: "Multiple tags per image",
                            multiClass: "Single tag per image",
                        },
                    },
                    name: {
                        title: "Project Name",
                    },
                    description: {
                        title: "Project Description",
                    },
                    domainId: {
                        title: "Domain",
                    },
                    newOrExisting: {
                        title: "New or Existing Project",
                        options: {
                            new: "New Project",
                            existing: "Existing Project",
                        },
                    },
                    projectId: {
                        title: "Project Name",
                    },
                    projectType: {
                        title: "Project Type",
                        options: {
                            classification: "Classification",
                            objectDetection: "Object Detection",
                        },
                    },
                },
            },
            tfRecords: {
                displayName: "Tensorflow Records",
            },
            pascalVoc: {
                displayName: "Pascal VOC",
                exportUnassigned: {
                    title: "Export Unassigned",
                    description: "Whether or not to include unassigned tags in exported data",
                },
            },
            cntk: {
                displayName: "Microsoft Cognitive Toolkit (CNTK)",
            },
            coco: {
                displayName: "CoCo",
            },
            powerAi: {
                displayName: "PowerAi",
                subdirectories: {
                    title: "classify by tag name",
                    description: "If a material contains more than one tag name, it will be assigned to the multi-tag folder.",
                },
            },
        },
        messages: {
            title: "exporting",
            content: "Please be patient and have a cup of coffee.",
            saveSuccess: "Successfully saved export settings",
        },
    },
    train: {
        title: "Train Settings",
        settings: "",
        saveSettings: "save",
        providers: {
            fasterRcnn2: {
                displayName: "[detectron2] Faster Rcnn",
            },
            maskRcnn2: {
                displayName: "[detectron2] Mask Rcnn",
            },
            keypointRcnn2: {
                displayName: "[detectron2] Keypoint Rcnn",
            },
            fasterRcnn: {
                displayName: "[detectron] Faster Rcnn (discards)",
            },
            maskRcnn: {
                displayName: "[detectron] Mask Rcnn (discards)",
            },
            yolov3: {
                displayName: "[yolov3] Yolo v3",
            },
            yolov3Pytorch: {
                displayName: "[pytorch] Yolo v3",
            },
        },
        messages: {
            title: "processing...",
            content: "Please be patient and have a cup of coffee.",
            success: "Training assets has been uploaded to the server",
            fail: "failed, please check",
        },
    },
    remoteTrainSettings: {
        ip: "server ip",
    },
    trainSettings: {
        title: "Train Settings",
        messages: {
            saveSuccess: "Successfully saved train settings",
        },
    },
    activeLearning: {
        title: "Active Learning",
        form: {
            properties: {
                modelPathType: {
                    title: "Model Provider",
                    description: "Where to load the training model from",
                    options: {
                        preTrained: "Pre-trained Coco SSD",
                        customFilePath: "Custom (File path)",
                        customWebUrl: "Custom (Url)",
                    },
                },
                autoDetect: {
                    title: "Auto Detect",
                    description: "Whether or not to automatically make predictions as you navigate between assets",
                },
                modelPath: {
                    title: "Model path",
                    description: "Select a model from your local file system",
                },
                modelUrl: {
                    title: "Model URL",
                    description: "Load your model from a public web URL",
                },
                predictTag: {
                    title: "Predict Tag",
                    description: "Whether or not to automatically include tags in predictions",
                },
            },
        },
        messages: {
            loadingModel: "Loading active learning model...",
            errorLoadModel: "Error loading active learning model",
            saveSuccess: "Successfully saved active learning settings",
        },
    },
    profile: {
        settings: "Profile Settings",
    },
    errors: {
        unknown: {
            title: "Unknown Error",
            message: "The app encountered an unknown error. Please try again.",
        },
        projectUploadError: {
            title: "Error Uploading File",
            message: `There was an error uploading the file.
                Please verify the file is of the correct format and try again.`,
        },
        genericRenderError: {
            title: "Error Loading Application",
            message: "An error occured while rendering the application. Please try again",
        },
        projectInvalidSecurityToken: {
            title: "Error loading project file",
            message: `The security token referenced by the project is invalid.
                Verify that the security token for the project has been set correctly within your application settings`,
        },
        projectInvalidJson: {
            title: "Error parsing project file",
            message: "The selected project files does not contain valid JSON. Please check the file any try again.",
        },
        projectDeleteError: {
            title: "Error deleting project",
            message: `An error occured while deleting the project.
                Validate the project file and security token exist and try again`,
        },
        securityTokenNotFound: {
            title: "Error loading project file",
            message: `The security token referenced by the project cannot be found in your current application settings.
                Verify the security token exists and try to reload the project.`,
        },
        canvasError: {
            title: "Error loading canvas",
            message: "There was an error loading the canvas, check the project's assets and try again.",
        },
        importError: {
            title: "Error importing V1 project",
            message: "There was an error importing the V1 project. Check the project file and try again",
        },
        pasteRegionTooBigError: {
            title: "Error pasting region",
            message: "Region too big for this asset. Try copying another region",
        },
        exportFormatNotFound: {
            title: "Error exporting project",
            message: "Project is missing export format.  Please select an export format in the export setting page.",
        },
        trainFormatNotFound: {
            title: "导出训练配置出错",
            message: "项目缺少训练配置格式。请在训练设置页中配置。",
        },
        activeLearningPredictionError: {
            title: "Active Learning Error",
            message: "An error occurred while predicting regions in the current asset. \
                Please verify your active learning configuration and try again",
        },
    },
};
