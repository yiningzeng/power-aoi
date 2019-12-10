import _ from "lodash";
import { ExportProvider } from "./exportProvider";
import {
    IProject,
    IExportProviderOptions,
    IAssetMetadata,
    IAsset,
    AssetState,
    AssetType,
} from "../../models/applicationState";
import Guard from "../../common/guard";
import { constants } from "../../common/constants";
import HtmlFileReader from "../../common/htmlFileReader";
import path from "path";
import {Simulate} from "react-dom/test-utils";

/**
 * VoTT Json Export Provider options
 */
export interface IPowerAiExportProviderOptions extends IExportProviderOptions {
    /** Whether or not to include binary assets in target connection */
    includeImages: boolean;
}

/**
 * @name - Vott Json Export Provider
 * @description - Exports a project into a single JSON file that include all configured assets
 */
export class PowerAiExportProvider extends ExportProvider<IPowerAiExportProviderOptions> {
    constructor(project: IProject, options: IPowerAiExportProviderOptions) {
        super(project, options);
        Guard.null(options);
    }

    /**
     * Export project to VoTT JSON format
     */
    public async export(): Promise<void> {
        const results = await this.getAssetsForExport();
        const exportFolderName = `${this.project.name.replace(/\s/g, "-")}-power-ai-export`;
        // tslint:disable-next-line:max-line-length
        let isSubdirectories = false;
        try {
            isSubdirectories = JSON.parse(JSON.stringify(this.project.exportFormat.providerOptions))["subdirectories"];
        } catch (e) {
            console.error(e);
        }
        console.log(`是否分文件夹: ${isSubdirectories}`);
        await this.storageProvider.deleteContainer(exportFolderName);
        await this.storageProvider.createContainer(exportFolderName);
        // if (isSubdirectories) {
        //     console.log(`老子分文件夹，所以创建先`);
        //     await this.project.tags.mapAsync(async (v) => {
        //         await this.storageProvider.createContainer(path.normalize(`${exportFolderName}/${v.name}`));
        //     });
        // }
        const finalResults: IAsset[] = [];
        // console.log(`数据:${JSON.stringify(results)}`);
        // await this.storageProvider.writeText(`${exportFolderName}/数据.json`, JSON.stringify(results, null, 4));

        const exportObject = {...this.project};
        delete exportObject.sourceConnection;
        delete exportObject.targetConnection;
        delete exportObject.exportFormat;
        delete exportObject.trainFormat;
        delete exportObject.activeLearningSettings;
        delete exportObject.securityToken;
        delete exportObject.lastVisitedAssetId;
        delete exportObject.name;
        delete exportObject.id;

        await results.forEachAsync(async (assetMetadata) => {
            return new Promise<void>(async (resolve) => {
                try {
                    let setTagType: string = "";
                    console.log(`filename: ${decodeURI(assetMetadata.asset.name)}`);
                    const blob = await HtmlFileReader.getAssetTransferBlob(assetMetadata.asset);
                    if (blob == null) {
                        resolve();
                        return;
                    }
                    let assetFilePath = `${exportFolderName}/${assetMetadata.asset.name}`;
                    if (assetMetadata && assetMetadata.asset.state === AssetState.Tagged &&
                        assetMetadata.regions.length > 0) {

                        if (isSubdirectories) {
                            assetMetadata.regions.mapAsync(async (v) => {
                                if (setTagType === "") {
                                    setTagType = `${v.tags[0]}/`;
                                } else if (setTagType !== v.tags[0]) {
                                    setTagType = "multi-tag/";
                                }
                            });
                        }
                        // region 导出异常问题在这
                        // 已经找到问题所在 主要原因是个别图片对应的标文件不存在
                        console.log(`导出Power-ai ===========start=================`);
                        console.log(`导出Power-ai ${assetMetadata.asset.id}`);
                        console.log(`导出Power-ai assetMetadata: \n${JSON.stringify(assetMetadata)}`);
                        // const co = await this.storageProvider.readText(`${assetMetadata.asset.id}
                        // ${constants.assetMetadataFileExtension}`);
                        // console.log(`导出问题1${assetMetadata.asset.id}: ${content}`);
                        // const tagAsset = JSON.parse(content);
                        const changeTagAsset = {
                            ...assetMetadata,
                            asset: {
                                ...assetMetadata["asset"],
                                path: "file:${path}" + assetMetadata["asset"]["name"],
                            },
                        };
                        console.log(`导出Power-ai ${assetMetadata.asset.id}: ${JSON.stringify(changeTagAsset)}`);
                        await this.storageProvider.writeText(`${exportFolderName}/${setTagType}${assetMetadata.asset.id}${constants.assetMetadataFileExtension}`,
                            JSON.stringify(changeTagAsset, null, 4));
                        console.log(`导出Power-ai ${assetMetadata.asset.id}: 保存本地`);
                        assetFilePath = `${exportFolderName}/${setTagType}${assetMetadata.asset.name}`;
                        console.log(`导出Power-ai ===========end=================`);
                        // endregion
                    } else if (assetMetadata && assetMetadata.asset.state === AssetState.Visited) { // 这里保存ok的图片
                        if (isSubdirectories) {
                            assetFilePath = `${exportFolderName}/ok/${assetMetadata.asset.name}`;
                            setTagType = "ok";
                        }
                    } else if (assetMetadata && assetMetadata.asset.state === AssetState.NotVisited) { // 这里保存未查看过的
                        if (isSubdirectories) {
                            assetFilePath = `${exportFolderName}/not-visited/${assetMetadata.asset.name}`;
                            setTagType = "not-visited";
                        }
                    }
                    const fileReader = new FileReader();
                    fileReader.onload = async () => {
                        try {
                            const buffer = Buffer.from(fileReader.result as ArrayBuffer);
                            await this.storageProvider.writeBinary(decodeURI(assetFilePath), buffer);
                            console.log(`fuck:2   ${assetMetadata.asset.id}`);
                            resolve();
                        } catch (e) {
                            console.error(e);
                        }
                    };
                    fileReader.readAsArrayBuffer(blob);

                    const tempAssetMetadata: IAssetMetadata = {
                        ...assetMetadata,
                        asset: {
                            ...assetMetadata.asset,
                            path: "file:${path}" + assetMetadata.asset.name,
                            tagType: setTagType === "" ? undefined : setTagType.replace("/", ""),
                        },
                    };
                    finalResults.push(tempAssetMetadata.asset);
                } catch (e) {
                    await this.storageProvider.writeText(`${exportFolderName}/error-${decodeURI(assetMetadata.asset.name)}.log`, e);
                }
            });
        });
        try {
            if (!isSubdirectories) {
                exportObject.assets = _.keyBy(finalResults, (asset) => asset.id) as any;
                // We don't need these fields in the export JSON
                const fileName = `${exportFolderName}/${constants.importFileExtension}`;
                await this.storageProvider.writeText(fileName, JSON.stringify(exportObject, null, 4));
            } else {
                await this.project.tags.mapAsync(async (v) => {
                    const tempResult = finalResults.filter((asset) => asset.tagType === v.name);
                    exportObject.assets = _.keyBy(tempResult, (asset) => asset.id) as any;
                    console.log(`导出啦 ${exportObject.assets.toLocaleString().length}`);
                    console.log(`导出啦 ${JSON.stringify(exportObject.assets).length}`)
                    if ( JSON.stringify(exportObject.assets).length > 2 ) {
                        console.log("导出啦" + "\n" + JSON.stringify(exportObject.assets));
                        const fileName = `${exportFolderName}/${v.name}/${constants.importFileExtension}`;
                        await this.storageProvider.writeText(fileName, JSON.stringify(exportObject, null, 4));
                    }
                });

                exportObject.assets = _.keyBy(
                    finalResults.filter((asset) => asset.tagType !== undefined && asset.tagType === "ok"),
                    (asset) => asset.id) as any;
                await this.storageProvider.writeText(`${exportFolderName}/ok/${constants.importFileExtension}`,
                    JSON.stringify(exportObject, null, 4));

                exportObject.assets = _.keyBy(
                    finalResults.filter((asset) => asset.tagType !== undefined && asset.tagType === "not-visited"),
                    (asset) => asset.id) as any;
                await this.storageProvider.writeText(`${exportFolderName}/not-visited/${constants.importFileExtension}`,
                    JSON.stringify(exportObject, null, 4));

                exportObject.assets = _.keyBy(
                    finalResults.filter((asset) => asset.tagType !== undefined && asset.tagType === "multi-tag"),
                    (asset) => asset.id) as any;
                await this.storageProvider.writeText(`${exportFolderName}/multi-tag/${constants.importFileExtension}`,
                    JSON.stringify(exportObject, null, 4));
                //region 根目录生成import.power-ai文件
                // exportObject.name = "isSubdirectories";
                // delete exportObject.assets;
                // await this.storageProvider.writeText(`${exportFolderName}/${constants.importFileExtension}`,
                //     JSON.stringify(exportObject, null, 4));
                //endregion
            }
        } catch (e) {
            await this.storageProvider.writeText(`${exportFolderName}/error.log`, e);
        }
    }
}
