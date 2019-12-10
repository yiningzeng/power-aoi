import React, {Fragment, ReactElement} from "react";
import * as shortid from "shortid";
import {CanvasTools} from "powerai-ct";
import {RegionData, RegionDataType} from "powerai-ct/lib/js/CanvasTools/Core/RegionData";
import {
    EditorMode,
    IAssetMetadata,
    IPoint,
    IProject,
    IRegion,
    IZoomMode,
    RegionType,
} from "../../../../models/applicationState";
import CanvasHelpers from "./canvasHelpers";
import {AssetPreview, ContentSource} from "../../common/assetPreview/assetPreview";
import {Editor} from "powerai-ct/lib/js/CanvasTools/CanvasTools.Editor";
import Clipboard from "../../../../common/clipboard";
import Confirm from "../../common/confirm/confirm";
import {strings} from "../../../../common/strings";
import {SelectionMode} from "powerai-ct/lib/js/CanvasTools/Interface/ISelectorSettings";
import {Rect} from "powerai-ct/lib/js/CanvasTools/Core/Rect";
import {createContentBoundingBox} from "../../../../common/layout";
import {Point2D} from "powerai-ct/lib/js/CanvasTools/Core/Point2D";
import RotatingCalipers from "rotating-calipers";
import getBounds from "bound-points";
export interface ICanvasProps extends React.Props<Canvas> {
    selectedAsset: IAssetMetadata;
    editorMode: EditorMode;
    selectionMode: SelectionMode;
    project: IProject;
    isDrawPolygon2MinBox: boolean;
    lockedTags: string[];
    children?: ReactElement<AssetPreview>;
    zoomModeChange?: number|string;
    onAssetMetadataChanged?: (assetMetadata: IAssetMetadata) => void;
    onSelectedRegionsChanged?: (regions: IRegion[]) => void;
    onCanvasRendered?: (canvas: HTMLCanvasElement) => void;
}

export interface ICanvasState {
    currentAsset: IAssetMetadata;
    contentSource: ContentSource;
    enabled: boolean;
}

export default class Canvas extends React.Component<ICanvasProps, ICanvasState> {
    public static defaultProps: ICanvasProps = {
        selectionMode: SelectionMode.NONE,
        editorMode: EditorMode.Select,
        selectedAsset: null,
        project: null,
        isDrawPolygon2MinBox: false,
        lockedTags: [],
    };

    public editor: Editor;

    public state: ICanvasState = {
        currentAsset: this.props.selectedAsset,
        contentSource: null,
        enabled: false,
    };

    private canvasZone: React.RefObject<HTMLDivElement> = React.createRef();
    private clearConfirm: React.RefObject<Confirm> = React.createRef();

    private template: Rect = new Rect(20, 20);

    // region 画笔
    private isMouseDown: boolean = false;
    private drawFlag: number = 0;
    private pointX: number;
    private pointY: number;
    private pencilPoints: Point2D[] = [];
    private anticlockwisePencilPoints: Point2D[] = [];
    private clockwisePencilPoints: Point2D[] = [];
    private minPoint: Point2D;
    private maxPoint: Point2D;
    // endregion
    public componentDidMount = () => {
        const sz = document.getElementById("editor-zone") as HTMLDivElement;
        this.editor = new CanvasTools.Editor(sz);
        this.editor.autoResize = true;
        this.editor.onSelectionEnd = this.onSelectionEnd;
        this.editor.onRegionMoveEnd = this.onRegionMoveEnd;
        this.editor.onRegionDelete = this.onRegionDelete;
        this.editor.onRegionSelected = this.onRegionSelected;
        this.editor.AS.setSelectionMode({ mode: this.props.selectionMode });

        window.addEventListener("resize", this.onWindowResize);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize);
    }

    public componentDidUpdate = async (prevProps: Readonly<ICanvasProps>, prevState: Readonly<ICanvasState>) => {
        // Handles asset changing
        if (this.props.selectedAsset !== prevProps.selectedAsset) {
            this.setState({ currentAsset: this.props.selectedAsset });
        }

        // Handle selection mode changes
        if (this.props.selectionMode !== prevProps.selectionMode) {
            const options = (this.props.selectionMode === SelectionMode.COPYRECT) ? this.template : null;
            this.editor.AS.setSelectionMode({ mode: this.props.selectionMode, template: options });
        }

        const assetIdChanged = this.state.currentAsset.asset.id !== prevState.currentAsset.asset.id;

        // When the selected asset has changed but is still the same asset id
        if (!assetIdChanged && this.state.currentAsset !== prevState.currentAsset) {
            console.log("updateAssetRegions: 多标记的时候造成卡顿， 去掉下面这行就不卡");
            // this.refreshCanvasToolsRegions();
        }
        if (this.props.zoomModeChange !== prevProps.zoomModeChange) {
            console.log(`缩放重置${this.props.zoomModeChange}`);
            // this.setContentSource(this.state.contentSource);
            this.positionCanvas(this.state.contentSource);
        }
        // When the project tags change re-apply tags to regions
        if (this.props.project.tags !== prevProps.project.tags) {
            this.updateCanvasToolsRegionTags();
        }
        // this.positionCanvas(this.state.contentSource);
        // Handles when the canvas is enabled & disabled
        if (prevState.enabled !== this.state.enabled) {
            // When the canvas is ready to display
            if (this.state.enabled) {
                this.refreshCanvasToolsRegions();
                this.setContentSource(this.state.contentSource);
                this.editor.AS.setSelectionMode(this.props.selectionMode);
                this.editor.AS.enable();

                if (this.props.onSelectedRegionsChanged) {
                    this.props.onSelectedRegionsChanged(this.getSelectedRegions());
                }
            } else { // When the canvas has been disabled
                this.editor.AS.disable();
                this.clearAllRegions();
                this.editor.AS.setSelectionMode(SelectionMode.NONE);
            }
        }
        // this.positionCanvas(this.state.contentSource);
    }

    public render = () => {
        const className = this.state.enabled ? "canvas-enabled" : "canvas-disabled";
        return (
            <Fragment>
                <Confirm title={strings.editorPage.canvas.removeAllRegions.title}
                         ref={this.clearConfirm as any}
                         message={strings.editorPage.canvas.removeAllRegions.confirmation}
                         confirmButtonColor="danger"
                         onConfirm={this.removeAllRegions}
                />
                <div id="ct-zone" ref={this.canvasZone} className={className} onClick={(e) => e.stopPropagation()}>
                    <div id="selection-zone">
                        <div id="editor-zone" className="full-size"/>
                    </div>
                </div>
                {this.renderChildren()}
            </Fragment>
        );
    }

    public enableCanvas = (b): void => {
       this.setState({
           ...this.state,
           enabled: b,
       });
    }

    public drawPolygon2MinBox = (minPoint: Point2D, maxPoint: Point2D, points: Point2D[]) => {
        alert(JSON.stringify(minPoint));
        alert(JSON.stringify(maxPoint));
        alert(JSON.stringify(points));
        const id = shortid.generate();
        const lockedTags = this.props.lockedTags;
        const myRegionData = new RegionData(minPoint.x,
            minPoint.y,
            maxPoint.x - minPoint.x,
            maxPoint.y - minPoint.y,
            points,
            RegionDataType.Polygon);
        alert(JSON.stringify(myRegionData));
        const scaledRegionData = this.editor.scaleRegionToSourceSize(myRegionData,
            this.state.currentAsset.asset.size.width,
            this.state.currentAsset.asset.size.height,
        );
        const newRegion = {
            id,
            type: this.editorModeToType(EditorMode.Polygon),
            tags: lockedTags || [],
            boundingBox: {
                height: scaledRegionData.height,
                width: scaledRegionData.width,
                left: scaledRegionData.x,
                top: scaledRegionData.y,
            },
            points: scaledRegionData.points,
        };
        if (lockedTags && lockedTags.length) {
            this.editor.RM.updateTagsById(id,
                CanvasHelpers.getTagsDescriptor(this.props.project.tags, newRegion));
        }
        this.updateAssetRegions([...this.state.currentAsset.regions, newRegion]);
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged([newRegion]);
        }
    }

    /**
     * Toggles tag on all selected regions
     * @param selectedTag Tag name
     */
    public applyTag = (tag: string) => {
        const selectedRegions = this.getSelectedRegions();
        const lockedTags = this.props.lockedTags;
        const lockedTagsEmpty = !lockedTags || !lockedTags.length;
        const regionsEmpty = !selectedRegions || !selectedRegions.length;
        if ((!tag && lockedTagsEmpty) || regionsEmpty) {
            return;
        }
        let transformer: (tags: string[], tag: string) => string[];
        if (lockedTagsEmpty) {
            // Tag selected while region(s) selected
            transformer = CanvasHelpers.toggleTag;
        } else if (lockedTags.find((t) => t === tag)) {
            // Tag added to locked tags while region(s) selected
            transformer = CanvasHelpers.addIfMissing;
        } else {
            // Tag removed from locked tags while region(s) selected
            transformer = CanvasHelpers.removeIfContained;
        }
        for (const selectedRegion of selectedRegions) {
            selectedRegion.tags = [tag];
        }
        console.log(`fuckselectedRegions: ${JSON.stringify(selectedRegions)}========= ${JSON.stringify(transformer)}`);
        this.updateRegions(selectedRegions);
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged(selectedRegions);
        }
    }

    public copyRegions = async () => {
        await Clipboard.writeObject(this.getSelectedRegions());
    }

    public cutRegions = async () => {
        const selectedRegions = this.getSelectedRegions();
        await Clipboard.writeObject(selectedRegions);
        this.deleteRegions(selectedRegions);
    }

    public pasteRegions = async () => {
        const regionsToPaste: IRegion[] = await Clipboard.readObject();
        const asset = this.state.currentAsset;
        const duplicates = CanvasHelpers.duplicateRegionsAndMove(
            regionsToPaste,
            asset.regions,
            asset.asset.size.width,
            asset.asset.size.height,
        );
        console.log(`加载啦啦: 复制 ${JSON.stringify(duplicates)}`);
        this.addRegions(duplicates);
    }

    public confirmRemoveAllRegions = () => {
        this.clearConfirm.current.open();
    }

    public getSelectedRegions = (): IRegion[] => {
        console.log(`加载啦啦 getSelectedRegions`);
        const startTime = new Date().valueOf(); // 开始时间
        const selectedRegions = this.editor.RM.getSelectedRegionsBounds().map((rb) => rb.id);
        return this.state.currentAsset.regions.filter((r) => selectedRegions.find((id) => r.id === id));
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 getSelectedRegions ${(endTime - startTime).toString()} 毫秒`);
    }

    public updateCanvasToolsRegionTags = (): void => {
        console.log(`加载啦啦 updateCanvasToolsRegionTags`);
        const startTime = new Date().valueOf(); // 开始时间
        for (const region of this.state.currentAsset.regions) {
            this.editor.RM.updateTagsById(
                region.id,
                CanvasHelpers.getTagsDescriptor(this.props.project.tags, region),
            );
        }
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 updateCanvasToolsRegionTags ${(endTime - startTime).toString()} 毫秒`);
    }

    public forceResize = (): void => {
        this.onWindowResize();
    }

    public removeAllRegions = () => {
        const ids = this.state.currentAsset.regions.map((r) => r.id);
        for (const id of ids) {
            this.editor.RM.deleteRegionById(id);
        }
        this.deleteRegionsFromAsset(this.state.currentAsset.regions);
    }

    private addRegions = (regions: IRegion[]) => {
        console.log(`加载啦啦 addRegions`);
        const startTime = new Date().valueOf(); // 开始时间
        this.addRegionsToCanvasTools(regions);
        this.addRegionsToAsset(regions);
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 addRegions ${(endTime - startTime).toString()} 毫秒`);
    }

    private addRegionsToAsset = (regions: IRegion[]) => {
        console.log(`加载啦啦 addRegionsToAsset`);
        const startTime = new Date().valueOf(); // 开始时间
        this.updateAssetRegions(
            this.state.currentAsset.regions.concat(regions),
        );
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 addRegionsToAsset ${(endTime - startTime).toString()} 毫秒`);
    }

    private addRegionsToCanvasTools = (regions: IRegion[]) => {
        console.log(`加载啦啦 addRegionsToCanvasTools`);
        const startTime = new Date().valueOf(); // 开始时间
        for (const region of regions) {
            const regionData = CanvasHelpers.getRegionData(region);
            const scaledRegionData = this.editor.scaleRegionToFrameSize(
                regionData,
                this.state.currentAsset.asset.size.width,
                this.state.currentAsset.asset.size.height);
            this.editor.RM.addRegion(
                region.id,
                scaledRegionData,
                CanvasHelpers.getTagsDescriptor(this.props.project.tags, region),
            );
        }
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 addRegionsToCanvasTools ${(endTime - startTime).toString()} 毫秒`);
    }

    private deleteRegions = (regions: IRegion[]) => {
        this.deleteRegionsFromCanvasTools(regions);
        this.deleteRegionsFromAsset(regions);
    }

    private deleteRegionsFromAsset = (regions: IRegion[]) => {
        const filteredRegions = this.state.currentAsset.regions.filter((assetRegion) => {
            return !regions.find((r) => r.id === assetRegion.id);
        });
        this.updateAssetRegions(filteredRegions);
    }

    private deleteRegionsFromCanvasTools = (regions: IRegion[]) => {
        for (const region of regions) {
            this.editor.RM.deleteRegionById(region.id);
        }
    }

    /**
     * Method that gets called when a new region is drawn
     * @param {RegionData} regionData the RegionData of created region
     * @returns {void}
     */
    private onSelectionEnd = (regionData: RegionData) => {
        if (CanvasHelpers.isEmpty(regionData) ) {
            return;
        }
        if (CanvasHelpers.isAreaEmpty(regionData)) {
            return;
        }
        let newRegionData = regionData;
        const id = shortid.generate();
        // region 最小外接框代码
        if (this.props.isDrawPolygon2MinBox) {
            console.log("最小框，true");
            try {
                console.log(`onSelectedRegionsChanged： onSelectedRegionsChanged\n
                变变变points: ${JSON.stringify(newRegionData.points)}`);
                const points = newRegionData.points.map((value) => [value.x, value.y]);
                const rotatingCalipers = new RotatingCalipers(points);
                const minBboxs: Point2D[] = []; // 最小边框4个点的Point2d 数组 用于画图在界面上
                const minBboxsNotP = []; // 最小边框4个点的[] 数组 用于后面计算轴对称的边框
                let isOut = false; // 表示是否超出边界
                rotatingCalipers.minAreaEnclosingRectangle().vertices.map(
                    (value) => {
                        const x = +value[0].toFixed();
                        const y = +value[1].toFixed();
                        if (x < 0 || y < 0) {
                            console.log(`最小框，超出边界判断,有一个小于0了 x: ${x}  y: ${y}`);
                            isOut = true;
                        }
                        minBboxs.push(new Point2D(x, y));
                        minBboxsNotP.push([x, y]);
                    },
                );
                console.log(`变变变我是最小点${JSON.stringify(minBboxs)}`);
                console.log(`变变变我是最小点${JSON.stringify(minBboxsNotP)}`);
                if (!isOut) {
                    console.log("最小框，没有超出边界了");
                    const bboxs = getBounds(minBboxsNotP);
                    console.log(`变变变RegionData: ${JSON.stringify(regionData)}\n\nbbox${JSON.stringify(bboxs)}`);
                    newRegionData = new RegionData(
                        bboxs[0][0],
                        bboxs[0][1],
                        bboxs[1][0] - bboxs[0][0],
                        bboxs[1][1] - bboxs[0][1],
                        minBboxs);
                } else {
                    console.log("最小框，超出边界了");
                    const bb: Point2D[] = [];
                    bb.push(new Point2D(regionData.x, regionData.y));
                    bb.push(new Point2D(regionData.x + regionData.width, regionData.y));
                    bb.push(new Point2D(regionData.x + regionData.width, regionData.y + regionData.height));
                    bb.push(new Point2D(regionData.x, regionData.y + regionData.height));
                    newRegionData = new RegionData(
                        newRegionData.x,
                        newRegionData.y,
                        newRegionData.width,
                        newRegionData.height,
                        bb);
                }
            } catch (e) {
                console.log(`变变变${e}`);
            }
            const scaledRegionData = this.editor.scaleRegionToSourceSize(
                newRegionData,
                this.state.currentAsset.asset.size.width,
                this.state.currentAsset.asset.size.height,
            );
            const myRegion = {
                id,
                type: this.editorModeToType(this.props.editorMode),
                tags: this.props.lockedTags || [],
                boundingBox: {
                    height: scaledRegionData.height,
                    width: scaledRegionData.width,
                    left: scaledRegionData.x,
                    top: scaledRegionData.y,
                },
                points: scaledRegionData.points,
            };
            this.addRegions([myRegion]);
            return;
        }
        // endregion 最小外接框代码
        this.editor.RM.addRegion(id, newRegionData, null);

        this.template = new Rect(newRegionData.width, newRegionData.height);

        // RegionData not serializable so need to extract data
        const scaledRegionData = this.editor.scaleRegionToSourceSize(
            newRegionData,
            this.state.currentAsset.asset.size.width,
            this.state.currentAsset.asset.size.height,
        );

        const lockedTags = this.props.lockedTags;
        const newRegion = {
            id,
            type: this.editorModeToType(this.props.editorMode),
            tags: lockedTags || [],
            boundingBox: {
                height: scaledRegionData.height,
                width: scaledRegionData.width,
                left: scaledRegionData.x,
                top: scaledRegionData.y,
            },
            points: scaledRegionData.points,
        };
        console.log(`加载啦啦onSelectionEnd： onSelectionEnd\n points: ${JSON.stringify(newRegion)}`);

        // console.log(`画笔： onSelectionEnd->regionData(初始数据) ${JSON.stringify(regionData)}`);
        // console.log(`画笔： onSelectionEnd->scaledRegionData(转换后数据) ${JSON.stringify(scaledRegionData)}`);
        // console.log(`画笔： onSelectionEnd->newRegion ${JSON.stringify(newRegion)}`);
        if (lockedTags && lockedTags.length) {
            this.editor.RM.updateTagsById(id, CanvasHelpers.getTagsDescriptor(this.props.project.tags, newRegion));
        }
        // region 造成数据多卡顿的问题
        this.updateAssetRegions([...this.state.currentAsset.regions, newRegion]);
        // endregion
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged([newRegion]);
        }
    }

    /**
     * Update regions within the current asset
     * @param regions
     * @param selectedRegions
     */
    private updateAssetRegions = (regions: IRegion[]) => {
        const currentAsset: IAssetMetadata = {
            ...this.state.currentAsset,
            regions,
        };
        this.setState({
            currentAsset,
        }, () => {
            this.props.onAssetMetadataChanged(currentAsset);
        });
    }

    /**
     * Method called when moving a region already in the editor
     * @param {string} id the id of the region that was moved
     * @param {RegionData} regionData the RegionData of moved region
     * @returns {void}
     */
    private onRegionMoveEnd = (id: string, regionData: RegionData) => {
        const currentRegions = this.state.currentAsset.regions;
        const movedRegionIndex = currentRegions.findIndex((region) => region.id === id);
        const movedRegion = currentRegions[movedRegionIndex];
        const scaledRegionData = this.editor.scaleRegionToSourceSize(
            regionData,
            this.state.currentAsset.asset.size.width,
            this.state.currentAsset.asset.size.height,
        );

        if (movedRegion) {
            movedRegion.points = scaledRegionData.points;
            movedRegion.boundingBox = {
                height: scaledRegionData.height,
                width: scaledRegionData.width,
                left: scaledRegionData.x,
                top: scaledRegionData.y,
            };
        }
        currentRegions[movedRegionIndex] = movedRegion;
        this.updateAssetRegions(currentRegions);
    }

    /**
     * Method called when deleting a region from the editor
     * @param {string} id the id of the deleted region
     * @returns {void}
     */
    private onRegionDelete = (id: string) => {
        // Remove from Canvas Tools
        this.editor.RM.deleteRegionById(id);

        // Remove from project
        const currentRegions = this.state.currentAsset.regions;
        const deletedRegionIndex = currentRegions.findIndex((region) => region.id === id);
        currentRegions.splice(deletedRegionIndex, 1);

        this.updateAssetRegions(currentRegions);
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged([]);
        }
    }

    /**
     * Method called when deleting a region from the editor
     * 从编辑器中删除区域时调用的方法
     * @param {string} id the id of the selected region
     * @param {boolean} multiSelect boolean whether region was selected with multi selection
     * @returns {void}
     */
    private onRegionSelected = (id: string, multiSelect: boolean) => {
        const selectedRegions = this.getSelectedRegions();
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged(selectedRegions);
        }
        // Gets the scaled region data
        const selectedRegionsData = this.editor.RM.getSelectedRegionsBounds().find((region) => region.id === id);

        if (selectedRegionsData) {
            this.template = new Rect(selectedRegionsData.width, selectedRegionsData.height);
        }

        if (this.props.lockedTags && this.props.lockedTags.length) {
            for (const selectedRegion of selectedRegions) {
                selectedRegion.tags = CanvasHelpers.addAllIfMissing(selectedRegion.tags, this.props.lockedTags);
            }
            this.updateRegions(selectedRegions);
        }
    }

    private renderChildren = () => {
        return React.cloneElement(this.props.children, {
            onAssetChanged: this.onAssetChanged,
            onLoaded: this.onAssetLoaded,
            onError: this.onAssetError,
            onActivated: this.onAssetActivated,
            onDeactivated: this.onAssetDeactivated,
        });
    }

    /**
     * Raised when the asset bound to the asset preview has changed
     */
    private onAssetChanged = () => {
        this.setState({ enabled: false });
    }

    /**
     * Raised when the underlying asset has completed loading
     */
    private onAssetLoaded = (contentSource: ContentSource) => {
        console.log(`加载啦啦 onAssetLoaded`);
        const startTime = new Date().valueOf(); // 开始时间
        this.setState({ contentSource });
        this.positionCanvas(contentSource);
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 onAssetLoaded ${(endTime - startTime).toString()} 毫秒`);
    }

    private onAssetError = () => {
        this.setState({
            enabled: false,
        });
    }

    /**
     * Raised when the asset is taking control over the rendering
     */
    private onAssetActivated = () => {
        this.setState({ enabled: false });
    }

    /**
     * Raise when the asset is handing off control of rendering
     */
    private onAssetDeactivated = (contentSource: ContentSource) => {
        this.setState({
            contentSource,
            enabled: true,
        });
    }

    /**
     * Set the loaded asset content source into the canvas tools canvas
     * 将加载的资产内容源设置到画布工具画布中
     */
    private setContentSource = async (contentSource: ContentSource) => {
        console.log(`加载啦啦 setContentSource`);
        const startTime = new Date().valueOf(); // 开始时间
        try {
            await this.editor.addContentSource(contentSource as any);

            if (this.props.onCanvasRendered) {
                const canvas = this.canvasZone.current.querySelector("canvas");
                this.props.onCanvasRendered(canvas);
            }
        } catch (e) {
            console.warn(e);
        }
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 setContentSource ${(endTime - startTime).toString()} 毫秒`);
    }

    private mousedown = (e) => {
        this.isMouseDown = true;
        this.pointX = e.offsetX;
        this.pointY = e.offsetY;
        this.pencilPoints = [];
        this.anticlockwisePencilPoints = [];
        this.clockwisePencilPoints = [];
        this.pencilPoints.push(new Point2D(e.offsetX, e.offsetY));
        this.anticlockwisePencilPoints.push(new Point2D(e.offsetX, e.offsetY));
        this.clockwisePencilPoints.push(new Point2D(e.offsetX, e.offsetY));
        this.minPoint = this.maxPoint = new Point2D(e.offsetX, e.offsetY);
        console.log(`画笔： ${this.pointX}  ${this.pointY}`);
    }
    private mouseup = (e) => {
        this.isMouseDown = false;
        this.drawFlag = 0;

        // region 绘画 最小矩形边框
        // const context = this.editor.contentCanvas.getContext("2d");
        // context.rect(this.minPoint.x, this.minPoint.y,
        //     this.maxPoint.x - this.minPoint.x, this.maxPoint.y - this.minPoint.y);
        // context.stroke();
        // endregion

        const id = shortid.generate();
        const lockedTags = this.props.lockedTags;
        for (let i = this.clockwisePencilPoints.length - 1; i >= 0; i--) {
            this.anticlockwisePencilPoints.push(this.clockwisePencilPoints[i]);
        }
        const pencilRegionData = new RegionData(this.minPoint.x,
            this.minPoint.y,
            this.maxPoint.x - this.minPoint.x,
            this.maxPoint.y - this.minPoint.y,
            this.anticlockwisePencilPoints,
            RegionDataType.Polygon);
        const scaledRegionData = this.editor.scaleRegionToSourceSize(pencilRegionData,
            this.state.currentAsset.asset.size.width,
            this.state.currentAsset.asset.size.height,
        );
        const newRegion = {
            id,
            type: this.editorModeToType(EditorMode.Polygon),
            tags: lockedTags || [],
            boundingBox: {
                height: scaledRegionData.height,
                width: scaledRegionData.width,
                left: scaledRegionData.x,
                top: scaledRegionData.y,
            },
            points: scaledRegionData.points,
        };
        if (lockedTags && lockedTags.length) {
            this.editor.RM.updateTagsById(id,
                CanvasHelpers.getTagsDescriptor(this.props.project.tags, newRegion));
        }
        this.updateAssetRegions([...this.state.currentAsset.regions, newRegion]);
        if (this.props.onSelectedRegionsChanged) {
            this.props.onSelectedRegionsChanged([newRegion]);
        }

        console.log(`画笔： 结束绘画，终点: {${e.offsetX}, ${e.offsetY}} 取到的点 ${JSON.stringify(this.pencilPoints)}`);
        this.pencilPoints = [];
        this.pencilPoints.push(new Point2D(e.offsetX, e.offsetY));
    }
    private mousemove = (e) => {
        if (this.isMouseDown) {
            console.log(`画笔： 正在绘画`);
            // const context = this.editor.contentCanvas.getContext("2d");
            // const context1 = this.editor.contentCanvas.getContext("2d");
            // const context2 = this.editor.contentCanvas.getContext("2d");
            if (this.drawFlag) {
                // context.beginPath();
                // context1.beginPath();
                // context2.beginPath();
                if ((e.offsetX % 5) === 0 || (e.offsetY % 5) === 0) {
                    const temp = this.pencilPoints.filter((v) => v.x === e.offsetX && v.y === e.offsetY);
                    if (temp.length === 0) {
                        if (e.offsetX < this.minPoint.x) {
                            this.minPoint = new Point2D(e.offsetX, this.minPoint.y);
                        }
                        if (e.offsetY < this.minPoint.y) {
                            this.minPoint = new Point2D(this.minPoint.x, e.offsetY);
                        }
                        if (e.offsetX > this.maxPoint.x) {
                            this.maxPoint = new Point2D(e.offsetX, this.maxPoint.y);
                        }
                        if (e.offsetY > this.maxPoint.y) {
                            this.maxPoint = new Point2D(this.maxPoint.x, e.offsetY);
                        }
                        const origin = this.pencilPoints[this.pencilPoints.length - 1];
                        const differPoint: IPoint = {
                            // x: e.offsetX - origin.x,
                            // y: e.offsetY - origin.y,
                            x: 3,
                            y: 3,
                        };
                        console.log(`画笔： 两点的差值(${JSON.stringify(differPoint)})`);
                        const anticlockwisePoint: IPoint = {x: -differPoint.y, y: differPoint.x}; // 逆时针转的点
                        const clockwisePoint: IPoint = {x: differPoint.y, y: -differPoint.x}; // 顺时针转的点

                        const point1 = this.anticlockwisePencilPoints[
                        this.anticlockwisePencilPoints.length - 1];
                        const point2 = this.clockwisePencilPoints[
                        this.clockwisePencilPoints.length - 1];
                        // context1.moveTo(point1.x, point1.y);
                        // context1.lineTo(origin.x + anticlockwisePoint.x, origin.y + anticlockwisePoint.y);
                        // context2.moveTo(point2.x, point2.y);
                        // context2.lineTo(origin.x + clockwisePoint.x, origin.y + clockwisePoint.y);
                        // context1.stroke();
                        // context2.stroke();
                        // 逆时针点新增
                        this.anticlockwisePencilPoints.push(
                            new Point2D(origin.x + anticlockwisePoint.x, origin.y + anticlockwisePoint.y),
                        );
                        // 逆时针点新增
                        this.clockwisePencilPoints.push(
                            new Point2D(origin.x + clockwisePoint.x, origin.y + clockwisePoint.y),
                        );
                        this.pencilPoints.push(new Point2D(e.offsetX, e.offsetY));
                    }
                    // console.log(`画笔： 查询是否有重复的 ${JSON.stringify(temp)}`);
                    // console.log(`画笔： 最终的 ${JSON.stringify(this.pencilPoints)}`);
                    // context.lineWidth = 5;
                    // context.strokeStyle = "blue";
                } else {
                    // context.lineWidth = 2;
                    // context.strokeStyle = "red";
                }
            }
            // context.moveTo(this.pointX, this.pointY);
            // context.lineTo(e.offsetX, e.offsetY);
            // context.stroke();
            if (this.drawFlag !== 0) {
                this.pointX = e.offsetX;
                this.pointY = e.offsetY;
            }
            this.drawFlag++;
        }
    }
    /**
     * Positions the canvas tools drawing surface to be exactly over the asset content
     * 将画布工具绘图表面放置在资源内容的正上方
     */
    private positionCanvas = (contentSource: ContentSource) => {
        if (!contentSource) {
            return;
        }

        const canvas = this.canvasZone.current;
        if (canvas) {
            // console.log(`画笔： ${this.props.editorMode}@@@ ${this.props.editorMode !== EditorMode.Pencil}`);
            // region 去掉画笔
            // if (this.props.editorMode !== EditorMode.Pencil) {
            //     canvas.removeEventListener("mousedown", this.mousedown);
            //     canvas.removeEventListener("mouseup", this.mouseup);
            //     canvas.removeEventListener("mousemove", this.mousemove);
            //     console.log("removeeeeeeeeeee");
            // } else {
            //     canvas.addEventListener("mousedown", this.mousedown);
            //     canvas.addEventListener("mouseup", this.mouseup);
            //     canvas.addEventListener("mousemove", this.mousemove);
            //     console.log("addddddddddddd");
            // }
            // endregion 去掉画笔
            // canvas.addEventListener("click", (e) => { alert(e.offsetX + " " + e.offsetY); });
            const boundingBox = createContentBoundingBox(contentSource);
            canvas.style.top = `${boundingBox.top}px`;
            canvas.style.left = `${boundingBox.left}px`;
            canvas.style.width = `${boundingBox.width}px`;
            canvas.style.height = `${boundingBox.height}px`;
            this.editor.resize(boundingBox.width, boundingBox.height);
        }
    }

    /**
     * Resizes and re-renders the canvas when the application window size changes
     */
    private onWindowResize = async () => {
        if (!this.state.contentSource) {
            return;
        }
        this.positionCanvas(this.state.contentSource);
    }

    /**
     * Updates regions in both Canvas Tools and the asset data store
     * @param updates Regions to be updated
     * @param updatedSelectedRegions Selected regions with any changes already applied
     */
    private updateRegions = (updates: IRegion[]) => {
        console.log(`加载啦啦 updateRegions`);
        const startTime = new Date().valueOf(); // 开始时间
        const updatedRegions = CanvasHelpers.updateRegions(this.state.currentAsset.regions, updates);
        for (const update of updates) {
            this.editor.RM.updateTagsById(update.id, CanvasHelpers.getTagsDescriptor(this.props.project.tags, update));
        }
        this.updateAssetRegions(updatedRegions);
        // this.updateCanvasToolsRegionTags();
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`加载啦啦 updateRegions ${(endTime - startTime).toString()} 毫秒`);
    }

    /**
     * Updates the background of the canvas and draws the asset's regions
     */
    private clearAllRegions = () => {
        this.editor.RM.deleteAllRegions();
    }

    private refreshCanvasToolsRegions = () => {
        this.clearAllRegions();

        if (!this.state.currentAsset.regions || this.state.currentAsset.regions.length === 0) {
            return;
        }

        // Add regions to the canvas
        // 加载卡顿基本问题定位在这里
        this.state.currentAsset.regions.forEach((region: IRegion) => {
            const loadedRegionData = CanvasHelpers.getRegionData(region);
            this.editor.RM.addRegion(
                region.id,
                this.editor.scaleRegionToFrameSize(
                    loadedRegionData,
                    this.state.currentAsset.asset.size.width,
                    this.state.currentAsset.asset.size.height,
                ),
                CanvasHelpers.getTagsDescriptor(this.props.project.tags, region));
        });
    }

    private editorModeToType = (editorMode: EditorMode) => {
        let type;
        switch (editorMode) {
            case EditorMode.CopyRect:
            case EditorMode.Rectangle:
                type = RegionType.Rectangle;
                break;
            case EditorMode.Pencil:
            case EditorMode.Polygon:
                type = RegionType.Polygon;
                break;
            case EditorMode.Point:
                type = RegionType.Point;
                break;
            case EditorMode.Polyline:
                type = RegionType.Polyline;
                break;
            default:
                break;
        }
        return type;
    }
}
