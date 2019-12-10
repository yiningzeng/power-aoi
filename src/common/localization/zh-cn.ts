import { IAppStrings } from "../strings";

/**
 * App Strings for English language
 */
export const chinese: IAppStrings = {
    appName: "Power Ai",
    common: {
        displayName: "项目名称",
        description: "描述",
        submit: "提交",
        cancel: "取消",
        save: "保存",
        delete: "删除",
        provider: "数据集",
        trainProvider: "检测框架",
        homePage: "首页",
    },
    titleBar: {
        help: "帮助",
        minimize: "最小化",
        maximize: "最大化",
        restore: "恢复",
        close: "关闭",
    },
    assetsFolderBar: {
        addFolder: "新增素材文件夹",
        importAssets: "导入已经标注的素材文件夹",
    },
    homePage: {
        newProject: "新建项目",
        openLocalProject: {
            title: "打开本地项目",
        },
        openTransferProject: {
            title: "打开迁移的项目",
        },
        openCloudProject: {
            title: "打开线上项目",
            selectConnection: "选择连接",
        },
        recentProjects: "最近项目",
        deleteProject: {
            title: "删除项目",
            confirmation: "确定要删除该项目么",
        },
        importProject: {
            title: "导入项目",
            confirmation: "确定要更新项目 ${project.file.name} 配置来适配V2版本么？ 建议您先备份项目再升级",
        },
        messages: {
            deleteSuccess: "成功删除 ${project.name}",
        },
    },
    appSettings: {
        title: "软件设置",
        storageTitle: "存储设置",
        uiHelp: "设置存储的路径",
        save: "保存设置",
        securityToken: {
            name: {
                title: "名称",
            },
            key: {
                title: "密钥",
            },
        },
        securityTokens: {
            title: "安全令牌",
            description: "安全令牌用于加密项目配置中的敏感数据",
        },
        version: {
            description: "版本:",
        },
        commit: "提交 SHA",
        devTools: {
            description: "打开应用程序开发人员工具以帮助诊断问题",
            button: "切换开发人员工具",
        },
        reload: {
            description: "重新加载应用程序，放弃所有当前更改",
            button: "重新加载应用",
        },
        messages: {
            saveSuccess: "已成功保存应用程序设置",
        },
    },
    projectSettings: {
        title: "项目设置",
        securityToken: {
            title: "安全令牌",
            description: "用于加密项目文件中的敏感数据",
        },
        save: "保存项目",
        sourceConnection: {
            title: "关联资源",
            description: "资源的路径",
            removeProvider: {
                title: "移除文件夹",
                confirmation: "确定要移除素材文件夹吗？这不会删除本地文件",
            },
        },
        targetConnection: {
            title: "项目路径",
            description: "初始项目素材路径，用于保存和导出数据",
        },
        videoSettings: {
            title: "视频设置",
            description: "提取用于标记的帧的速率",
            frameExtractionRate: "帧提取率（每秒帧数）",
        },
        addConnection: "新增",
        messages: {
            saveSuccess: "保存 ${project.name} 项目设置成功",
        },
    },
    projectMetrics: {
        title: "Project Metrics",
        assetsSectionTitle: "Assets",
        totalAssetCount: "Total Assets",
        visitedAssets: "查看的素材 (${count})",
        taggedAssets: "标记的素材 (${count})",
        nonTaggedAssets: "未标记的素材 (${count})",
        nonVisitedAssets: "未查看的素材 (${count})",
        tagsSectionTitle: "Tags & Labels",
        totalRegionCount: "Total Tagged Regions",
        totalTagCount: "Total Tags",
        avgTagCountPerAsset: "Average tags per asset",
        currentAsset: {
            name: "当前素材名称",
            size: "当前素材尺寸",
        },
    },
    tags: {
        title: "标签",
        placeholder: "新增",
        editor: "编辑",
        modal: {
            name: "标签名称",
            color: "标签颜色",
        },
        colors: {
            white: "白色",
            gray: "灰色",
            red: "红色",
            maroon: "褐色",
            yellow: "黄色",
            olive: "橄榄绿",
            lime: "石灰",
            green: "绿色",
            aqua: "水绿色",
            teal: "鸭绿色",
            blue: "蓝色",
            navy: "海蓝色",
            fuschia: "紫红色",
            purple: "紫色",
        },
        warnings: {
            existingName: "标签已经存在",
            emptyName: "不能有空标签",
            unknownTagName: "Unknown",
        },
        toolbar: {
            add: "新增标签",
            search: "搜索标签",
            edit: "编辑标签",
            lock: "锁定标签",
            moveUp: "标签上移",
            moveDown: "标签下移",
            delete: "删除标签",
        },
    },
    connections: {
        title: "关联的资源",
        details: "资源详情",
        settings: "资源设置",
        instructions: "请选择一个资源编辑",
        save: "保存",
        messages: {
            saveSuccess: "保存 ${connection.name} 成功",
            deleteSuccess: "成功的删除 ${connection.name}",
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
                title: "本地文件",
                folderPath: "路径",
                selectFolder: "选择文件夹",
                chooseFolder: "选择文件夹",
            },
        },
    },
    editorPage: {
        width: "宽",
        height: "高",
        tagged: "Tagged",
        visited: "Visited",
        assetsFolderBar: {
            importTaggedAssets: {
                progress: {
                    title: "正在导入",
                    content: "请耐心等待，去喝杯咖啡再来吧",
                },
                done: {
                    title: "导入完成",
                    content: "已经成功导入，可在素材文件夹列表查看",
                },
                errorPart: {
                    title: "注意！部分导入完成",
                    content: "个别目录导入失败，成功导入 (${part}) 个素材文件夹，可在素材文件夹列表查看",
                },
                error: {
                    title: "导入失败",
                    content: "请检查文件夹下是否包含import.power-ai文件",
                },
            },
        },
        toolbar: {
            select: "选择",
            pan: "Pan",
            drawRectangle: "矩形",
            drawPolygon: "多边形",
            drawPolygon2MinBox: "多边形最小外接矩形",
            drawWithPencil: "画笔",
            copyRectangle: "标签印章",
            copy: "复制",
            cut: "剪切",
            paste: "粘贴",
            removeAllRegions: "删除当前素材所有标签",
            previousAsset: "上一个",
            nextAsset: "下一个",
            saveProject: "保存项目",
            exportProject: "导出训练素材",
            transferProject: "迁移项目",
            activeLearning: "自动标注当前素材",
            trainAi: "开始训练",
            onlineTest: "在线测试",
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
            title: "切换帮助菜单",
            escape: "退出帮助菜单",
        },
        assetError: "加载素材失败",
        tags: {
            hotKey: {
                apply: "设置标签快捷键",
                lock: "锁定标签快捷键",
            },
            rename: {
                title: "重命名标签",
                confirmation: "确定要重命名标签么？这将会把所有的已打标的素材更改",
            },
            delete: {
                title: "删除标签",
                confirmation: "确定要删除标签么？这会删除所有素材中已经打标的标签",
            },
        },
        canvas: {
            removeAllRegions: {
                title: "删除所有的选框",
                confirmation: "确定要删除所有的选框么？",
            },
            deleteAsset: {
                title: "删除素材",
                confirmation: "确定要删除本地的素材文件么？",
            },
        },
        messages: {
            enforceTaggedRegions: {
                title: "检测到未标记的框",
                // tslint:disable-next-line:max-line-length
                description: "一个或者多个框未打标，请确认",
            },
        },
    },
    export: {
        title: "导出",
        settings: "导出设置",
        saveSettings: "确认",
        providers: {
            common: {
                properties: {
                    assetState: {
                        title: "选择",
                        description: "需要导出哪些资源",
                        options: {
                            all: "所有资源",
                            visited: "仅查看过的资源",
                            tagged: "仅有标签的资源",
                        },
                    },
                    testTrainSplit: {
                        title: "训练 / 验证 比例",
                        description: "导出的训练和验证比例",
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
                    title: "导出没有标记过的标签",
                    description: "",
                },
            },
            cntk: {
                displayName: "Microsoft Cognitive Toolkit (CNTK)",
            },
            coco: {
                displayName: "CoCo",
            },
            powerAi: {
                displayName: "PowerAi(可导入到其他项目)",
                subdirectories: {
                    title: "根据标签名分文件夹",
                    description: "如果一个素材包含多个标签名会被分到multi-tag文件夹",
                },
            },
        },
        messages: {
            title: "正在导出",
            content: "请耐心等待，去喝杯咖啡再来吧",
            saveSuccess: "已成功保存导出设置",
        },
    },
    train: {
        title: "训练设置",
        settings: "训练参数设置",
        saveSettings: "保存",
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
                displayName: "[detectron] Faster Rcnn (弃用)",
            },
            maskRcnn: {
                displayName: "[detectron] Mask Rcnn (弃用)",
            },
            yolov3: {
                displayName: "[yolov3] Yolo v3",
            },
            yolov3Pytorch: {
                displayName: "[pytorch] Yolo v3",
            },
        },
        messages: {
            title: "正在处理...",
            content: "请耐心等待，去喝杯咖啡再来吧",
            success: "处理完成，训练素材已经上传到服务器",
            fail: "处理失败，请检查",
        },
    },
    remoteTrainSettings: {
        ip: "训练服务器ip",
    },
    trainSettings: {
        title: "训练设置",
        messages: {
            saveSuccess: "已成功保存训练设置",
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
        settings: "配置文件设置",
    },
    errors: {
        unknown: {
            title: "未知异常",
            message: "应用程序遇到未知错误，请再试一次。",
        },
        projectUploadError: {
            title: "上传文件出错",
            message: `上载文件时出错。
                请验证文件的格式是否正确，然后重试。.`,
        },
        genericRenderError: {
            title: "载入应用出错",
            message: "载入时有错误发生，请重试",
        },
        projectInvalidSecurityToken: {
            title: "加载项目出错",
            message: `项目引用的安全令牌无效。
                验证是否已在应用程序设置中正确设置了项目的安全令牌`,
        },
        projectInvalidJson: {
            title: "项目文件出错",
            message: "所选项目文件不包含有效的JSON。请检查文件，再试一次",
        },
        projectDeleteError: {
            title: "删除项目出错",
            message: `删除项目时出错。 验证项目文件和安全令牌是否存在，然后重试`,
        },
        securityTokenNotFound: {
            title: "载入项目出错",
            message: `在当前应用程序设置中找不到项目引用的安全令牌。
                验证安全令牌是否存在，并尝试重新加载项目。`,
        },
        canvasError: {
            title: "载入画布出错",
            message: "加载画布时出错，请检查项目的素材，然后重试。",
        },
        importError: {
            title: "导入V1项目出错",
            message: "导入v1项目时出错。请检查项目文件并重试",
        },
        pasteRegionTooBigError: {
            title: "粘贴出错",
            message: "复制的区域太大，请尝试复制其他的区域",
        },
        exportFormatNotFound: {
            title: "项目导出出错",
            message: "项目缺少导出格式。请在导出设置页中配置。",
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
