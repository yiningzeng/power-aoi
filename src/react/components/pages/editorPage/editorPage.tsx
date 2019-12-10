import _ from "lodash";
import React, {RefObject} from "react";
import {connect} from "react-redux";
import {Route, RouteComponentProps, Switch} from "react-router-dom";
import SplitPane from "react-split-pane";
import {bindActionCreators} from "redux";
import {SelectionMode} from "powerai-ct/lib/js/CanvasTools/Interface/ISelectorSettings";
import HtmlFileReader from "../../../../common/htmlFileReader";
import {strings, interpolate} from "../../../../common/strings";
import {
    AppError,
    AssetState,
    AssetType,
    EditorMode,
    ErrorCode,
    IAdditionalPageSettings,
    IApplicationState,
    IAppSettings,
    IAsset,
    IAssetMetadata, IConnection,
    IProject, IProviderOptions,
    IRegion, ISecureString,
    ISize,
    ITag,
    IZoomMode,
} from "../../../../models/applicationState";
import {IToolbarItemRegistration, ToolbarItemFactory} from "../../../../providers/toolbar/toolbarItemFactory";
import IApplicationActions, * as applicationActions from "../../../../redux/actions/applicationActions";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import {ToolbarItemName} from "../../../../registerToolbar";
import {AssetService} from "../../../../services/assetService";
import {AssetPreview} from "../../common/assetPreview/assetPreview";
import {KeyboardBinding} from "../../common/keyboardBinding/keyboardBinding";
import {KeyEventType} from "../../common/keyboardManager/keyboardManager";
import {TagInput} from "../../common/tagInput/tagInput";
import {ToolbarItem} from "../../toolbar/toolbarItem";
import Canvas from "./canvas";
import CanvasHelpers from "./canvasHelpers";
import "./editorPage.scss";
import EditorSideBar from "./editorSideBar";
import {EditorToolbar} from "./editorToolbar";
import Alert from "../../common/alert/alert";
import Confirm from "../../common/confirm/confirm";
import {ActiveLearningService} from "../../../../services/activeLearningService";
import {toast} from "react-toastify";
import CondensedList from "../../common/condensedList/condensedList";
import SourceItem from "../../common/condensedList/sourceItem";
import {Rnd} from "react-rnd";
import Zoom from "../../common/zoom/zoom";
import {ILocalFileSystemProxyOptions, LocalFileSystemProxy} from "../../../../providers/storage/localFileSystemProxy";
import {async} from "q";
import * as connectionActions from "../../../../redux/actions/connectionActions";
import {IpcRendererProxy} from "../../../../common/ipcRendererProxy";

// import "antd/lib/tree/style/css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import { makeStyles } from "@material-ui/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import {constants} from "../../../../common/constants";
import DraggableDialog from "../../common/draggableDialog/draggableDialog";
import {IStartTestResults} from "../../../../providers/export/exportProvider";
import AiTestSettingsPage from "../aitest/testSettingsPage";
import * as omnizoom from "omnizoom";
import {Point2D} from "powerai-ct/lib/js/CanvasTools/Core/Point2D";
function PaperComponent(props: PaperProps) {
    return (
        <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}


let projectId;

const emptyZoomMode: IZoomMode = {
    disableDrag: true,
    x: 0,
    y: 0,
    miniWidth: 500,
    miniHeight: 500,
    width: "auto",
    height: "auto",
    zoomCenterX: 0,
    zoomCenterY: 0,
};
/**
 * Properties for Editor Page
 * @member project - Project being edited
 * @member recentProjects - Array of projects recently viewed/edited
 * @member actions - Project actions
 * @member applicationActions - Application setting actions
 */
export interface IEditorPageProps extends RouteComponentProps, React.Props<EditorPage> {
    project: IProject;
    recentProjects: IProject[];
    appSettings: IAppSettings;
    actions: IProjectActions;
    applicationActions: IApplicationActions;
}

/**
 * State for Editor Page
 */
export interface IEditorPageState {
    treeList: IProviderOptions[] | ISecureString[];
    /** Array of assets in project */
    assets: IAsset[];
    /** The editor mode to set for canvas tools */
    editorMode: EditorMode;
    /** The selection mode to set for canvas tools */
    selectionMode: SelectionMode;
    /** The selected asset for the primary editing experience */
    selectedAsset?: IAssetMetadata;
    /** Currently selected region on current asset */
    selectedRegions?: IRegion[];
    /** The child assets used for nest asset typs */
    childAssets?: IAsset[];
    /** Additional settings for asset previews */
    additionalSettings?: IAdditionalPageSettings;
    /** Most recently selected tag */
    selectedTag: string;
    /** Tags locked for region labeling */
    lockedTags: string[];
    /** Size of the asset thumbnails to display in the side bar */
    thumbnailSize: ISize;
    /**
     * Whether or not the editor is in a valid state
     * State is invalid when a region has not been tagged
     */
    isValid: boolean;
    /** Whether the show invalid region warning alert should display */
    showInvalidRegionWarning: boolean;
    zoomMode: IZoomMode;
    dialog: boolean;
    isDrawPolygon2MinBox: boolean;
}

function mapStateToProps(state: IApplicationState) {
    return {
        recentProjects: state.recentProjects,
        project: state.currentProject,
        appSettings: state.appSettings,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(projectActions, dispatch),
        applicationActions: bindActionCreators(applicationActions, dispatch),
    };
}

/**
 * @name - Editor Page
 * @description - Page for adding/editing/removing tags to assets
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class EditorPage extends React.Component<IEditorPageProps, IEditorPageState> {
    public state: IEditorPageState = {
        treeList: [],
        selectedTag: null,
        lockedTags: [],
        selectionMode: SelectionMode.RECT,
        assets: [],
        childAssets: [],
        editorMode: EditorMode.Rectangle,
        additionalSettings: {
            videoSettings: (this.props.project) ? this.props.project.videoSettings : null,
            activeLearningSettings: (this.props.project) ? this.props.project.activeLearningSettings : null,
        },
        thumbnailSize: this.props.appSettings.thumbnailSize || { width: 350, height: 90 },
        isValid: true,
        showInvalidRegionWarning: false,
        zoomMode: emptyZoomMode,
        dialog: false,
        isDrawPolygon2MinBox: false,
    };
    private localFileSystem: LocalFileSystemProxy;

    private activeLearningService: ActiveLearningService = null;
    private loadingProjectAssets: boolean = false;
    private toolbarItems: IToolbarItemRegistration[] = ToolbarItemFactory.getToolbarItems();
    private canvas: RefObject<Canvas> = React.createRef();
    private renameTagConfirm: React.RefObject<Confirm> = React.createRef();
    private deleteTagConfirm: React.RefObject<Confirm> = React.createRef();
    private deleteSourceProviderConfirm: React.RefObject<Confirm> = React.createRef();
    private deleteConfirm: React.RefObject<Confirm> = React.createRef();
    private draggableDialog: React.RefObject<DraggableDialog> = React.createRef();
    private myZoomDom: React.RefObject<Rnd> = React.createRef();

    constructor(props, context) {
        super(props, context);
        this.localFileSystem = new LocalFileSystemProxy();
        const ipcRenderer = (window as any & typeof globalThis).require("electron").ipcRenderer;
        ipcRenderer.on("FILE_WATCH", (event, arg) => {
            console.log(arg);
        });
    }

    public async componentDidMount() {
        projectId = this.props.match.params["projectId"];
        if (this.props.project) {
            await this.loadProjectAssets();
        } else if (projectId) {
            const project = this.props.recentProjects.find((project) => project.id === projectId);
            await this.props.actions.loadProject(project);
        }
        this.setState({
            treeList: this.props.project.sourceConnection.providerOptionsOthers,
        });
        // console.log("editorPage: project" + JSON.stringify(this.props.project));
        this.activeLearningService = new ActiveLearningService(this.props.project.activeLearningSettings);
    }

    public async componentDidUpdate(prevProps: Readonly<IEditorPageProps>) {
        if (this.props.project && this.state.assets.length === 0) {
            await this.loadProjectAssets();
        }
        // console.log("editorPage: componentDidUpdate this.props.project: " + JSON.stringify(this.props.project));
        // Navigating directly to the page via URL (ie, http://vott/projects/a1b2c3dEf/edit) sets the default state
        // before props has been set, this updates the project and additional settings to be valid once props are
        // retrieved.
        // console.log("editorPage: componentDidUpdate prevProps: " + JSON.stringify(prevProps));
        if (this.props.project && !prevProps.project) {
            console.log("componentDidUpdate: project");
            this.setState({
                treeList: this.props.project.sourceConnection.providerOptionsOthers,
                additionalSettings: {
                    videoSettings: (this.props.project) ? this.props.project.videoSettings : null,
                    activeLearningSettings: (this.props.project) ? this.props.project.activeLearningSettings : null,
                },
            });
        }
        // console.log("editorPage: componentDidUpdate this.state" + JSON.stringify(this.state));
        if (this.props.project && prevProps.project && this.props.project.tags !== prevProps.project.tags) {
            console.log("componentDidUpdate: tags");
            this.updateRootAssets();
        }
    }

    public render() {
        // console.log(document.getElementById("ct-zone").offsetWidth);
        // if (this.state.zoomMode.width === "auto") {
        //     this.setState({
        //         zoomMode: {
        //             ...this.state.zoomMode,
        //             width: Number(document.getElementById("ct-zone")),
        //             height: Number(document.getElementById("ct-zone").style.height),
        //         },
        //     });
        // }
        const { project } = this.props;
        const { treeList, assets, selectedAsset } = this.state;
        const rootAssets = assets.filter((asset) => !asset.parent);
        // console.log("editorPage: render project ", project);
        // console.log("editorPage: render rootAssets ", JSON.stringify(rootAssets));
        // console.log("editorPage: render selectedAsset ", selectedAsset);
        if (!project) {
            return (<div>Loading...</div>);
        }
        const handleClickOpen = () => {
            this.setState({dialog: true});
        };

        const handleClose = () => {
           this.setState({dialog: false});
        };
        // const folderPath = project.sourceConnection.providerOptions["folderPath"];
        // console.log("editorPage: render folderPath ", folderPath);
        // console.log("editorPage: render treeList ", treeList);
        return (
            <div className="editor-page">
                {[...Array(10).keys()].map((index) => {
                    return (<KeyboardBinding
                        displayName={strings.editorPage.tags.hotKey.apply}
                        key={index}
                        keyEventType={KeyEventType.KeyDown}
                        accelerators={[`${index}`]}
                        icon={"fa-tag"}
                        handler={this.handleTagHotKey} />);
                })}
                {[...Array(10).keys()].map((index) => {
                    return (<KeyboardBinding
                        displayName={strings.editorPage.tags.hotKey.lock}
                        key={index}
                        keyEventType={KeyEventType.KeyDown}
                        accelerators={[`CmdOrCtrl+${index}`]}
                        icon={"fa-lock"}
                        handler={this.handleCtrlTagHotKey} />);
                })}
                <SplitPane split="vertical"
                    defaultSize={this.state.thumbnailSize.width}
                    minSize={350}
                    maxSize={500}
                    paneStyle={{ display: "flex" }}
                    onChange={this.onSideBarResize}
                    onDragFinished={this.onSideBarResizeComplete}>
                    <div className="editor-page-sidebar bg-lighter-1">
                        <div>
                            <Dialog
                                fullWidth={true}
                                disableBackdropClick={true}
                                open={this.state.dialog}
                                onClose={handleClose}
                                PaperComponent={PaperComponent}
                                aria-labelledby="draggable-dialog-title"
                            >
                                <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
                                   请耐心等待...
                                </DialogTitle>
                                <DialogContent>
                                    <LinearProgress />
                                    <DialogContentText>
                                        正在努力打包上传...
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    {/*<Button onClick={handleClose} color="primary">*/}
                                       {/*取消 */}
                                    {/*</Button>*/}
                                    {/*<Button onClick={handleClose} color="primary">*/}
                                        {/*Subscribe*/}
                                    {/*</Button>*/}
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div className="editor-page-sidebar-tree bg-lighter-1">
                            <CondensedList
                                title="素材文件夹"
                                Component={SourceItem}
                                items={this.state.treeList}
                                onImportTaggedAssetsFolder={this.onImportTaggedAssets}
                                onAddClick={async () => {
                                    console.log("新增文件夹");
                                    const filePath = await this.localFileSystem.selectContainer();
                                    if (filePath === undefined) { return; }
                                    const provider: ILocalFileSystemProxyOptions = {
                                        folderPath: filePath,
                                    };
                                    const newSource: IConnection = {
                                        id: new Date().getTime().toString(),
                                        name: new Date().getTime().toString(),
                                        providerType: "localFileSystemProxy",
                                        providerOptions: provider,
                                    };
                                    connectionActions.saveConnection(newSource);

                                    const newProject: IProject = {
                                        ...project,
                                        sourceConnection: {
                                            ...project.sourceConnection,
                                            providerOptionsOthers: [
                                                ...project.sourceConnection.providerOptionsOthers,
                                                provider,
                                            ],
                                        },
                                    };
                                    await this.props.applicationActions.ensureSecurityToken(newProject);
                                    await this.props.actions.saveProject(newProject);
                                    this.setState({
                                        treeList: newProject.sourceConnection.providerOptionsOthers,
                                    });
                                }}
                                onClick={ async (item) => {
                                    const newProject: IProject = {
                                        ...project,
                                        sourceConnection: {
                                            ...project.sourceConnection,
                                            providerOptions: item,
                                        },
                                    };
                                    await this.props.applicationActions.ensureSecurityToken(newProject);
                                    await this.props.actions.saveProject(newProject);
                                    this.loadingProjectAssets = false;
                                    this.setState({
                                        assets: [],
                                    });
                                    this.loadProjectAssets();
                                }}
                                onDelete={async (item) => {
                                   this.deleteSourceProviderConfirm.current.open(project, item);
                                    // let aa: string[];
                                    // aa = project.sourceListConnection;
                                    // aa.splice(aa.indexOf(item), 1);
                                    // project.sourceListConnection = aa;
                                    // await this.props.applicationActions.ensureSecurityToken(project);
                                    // await this.props.actions.saveProject(project);
                                }}
                                showToolbar={true}/>
                            <TagInput
                                tags={this.props.project.tags}
                                lockedTags={this.state.lockedTags}
                                selectedRegions={this.state.selectedRegions}
                                onChange={this.onTagsChanged}
                                onLockedTagsChange={this.onLockedTagsChanged}
                                onTagClick={this.onTagClicked}
                                onCtrlTagClick={this.onCtrlTagClicked}
                                onTagRenamed={this.confirmTagRenamed}
                                onTagDeleted={this.confirmTagDeleted}
                            />
                        </div>
                        <EditorSideBar
                            assets={rootAssets}
                            selectedAsset={selectedAsset ? selectedAsset.asset : null}
                            // selectedAsset={null}
                            onBeforeAssetSelected={this.onBeforeAssetSelected}
                            onAssetSelected={this.selectAsset}
                            thumbnailSize={this.state.thumbnailSize}
                        />
                    </div>
                    <div className="editor-page-content" onClick={this.onPageClick}>
                        <div className="editor-page-content-main">
                            <div className="editor-page-content-main-header">
                                <EditorToolbar project={this.props.project}
                                    items={this.toolbarItems}
                                    actions={this.props.actions}
                                    onToolbarItemSelected={this.onToolbarItemSelected} />
                            </div>
                            <div className="editor-page-content-main-body">
                                {selectedAsset &&
                                <Rnd
                                    id="fuck"
                                    ref={this.myZoomDom}
                                    disableDragging={this.state.zoomMode.disableDrag}
                                    size={{ width: this.state.zoomMode.width,  height: this.state.zoomMode.height }}
                                    position={{ x: this.state.zoomMode.x, y: this.state.zoomMode.y }}
                                    onDragStop={(e, d) => {
                                        this.setState({
                                            zoomMode: {
                                                ...this.state.zoomMode,
                                                x: d.x,
                                                y: d.y,
                                            },
                                        });
                                    }}
                                    onResize={(e, direction, ref, delta, position) => {
                                        this.setState({
                                            zoomMode: {
                                                ...this.state.zoomMode,
                                                ...position,
                                                width: ref.offsetWidth,
                                                height: ref.offsetHeight,
                                                zoomCenterX: ref.offsetWidth / 2,
                                                zoomCenterY: ref.offsetHeight / 2,
                                            },
                                        });
                                    }}
                                    onMouseDown={(e) => {
                                        const zone = document.getElementById("ct-zone");
                                        console.log(this.myZoomDom.current.getOffsetFromParent().left);
                                        console.log(this.myZoomDom.current.getSelfElement().offsetLeft);
                                        console.log(this.myZoomDom.current.getSelfElement().style.marginLeft);
                                        console.log(this.myZoomDom.current.getSelfElement().style.left);
                                        console.log(this.myZoomDom.current.getSelfElement().style.paddingLeft);
                                        console.log(`zone.offsetLeft : ${e.pageX} ${e.screenX}我是鼠标点击x: ${e.clientX} 我是鼠标点击Y: ${e.pageY}`);
                                        this.setState({
                                            zoomMode: {
                                                ...this.state.zoomMode,
                                                zoomCenterX: e.clientX,
                                                zoomCenterY: e.clientY,
                                            },
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        // console.log(e);
                                        // console.log(`我是鼠标点x: ${e.} 我是鼠标点y: ${e.offsetY}`);
                                        // this.setState({
                                        //     zoomMode: {
                                        //         ...this.state.zoomMode,
                                        //         zoomCenterX: e.clientX,
                                        //         zoomCenterY: e.clientY,
                                        //     },
                                        // });
                                    }}
                                    onWheel={ (e) => Zoom(e, (deltaY) => {
                                        const zone = document.getElementById("ct-zone");
                                        console.log(`我是图像左上角点x: ${this.myZoomDom.current.getDraggablePosition().x} 我是图像左上角点y: ${this.myZoomDom.current.getDraggablePosition().y}`);
                                        const w = zone.offsetWidth;
                                        const h = zone.offsetHeight;
                                        if ((h - deltaY) < this.state.zoomMode.miniHeight) { return; }
                                        this.setState({
                                            zoomMode: {
                                                ...this.state.zoomMode,
                                                width: ( w - deltaY * 2),
                                                height: ( h - deltaY * 2),
                                                x: this.state.zoomMode.x + deltaY,
                                                y: this.state.zoomMode.x + deltaY,
                                            },
                                        });
                                        if (this.state.zoomMode.height === "auto") {
                                            this.setState({
                                                zoomMode: {
                                                    ...this.state.zoomMode,
                                                    height: document.getElementById("ct-zone").offsetHeight,
                                                },
                                            });
                                        }
                                    })}
                                >
                                    <Canvas
                                        ref={this.canvas}
                                        selectedAsset={this.state.selectedAsset}
                                        onAssetMetadataChanged={this.onAssetMetadataChanged}
                                        onCanvasRendered={this.onCanvasRendered}
                                        onSelectedRegionsChanged={this.onSelectedRegionsChanged}
                                        editorMode={this.state.editorMode}
                                        zoomModeChange={this.state.zoomMode.width}
                                        selectionMode={this.state.selectionMode}
                                        project={this.props.project}
                                        isDrawPolygon2MinBox={this.state.isDrawPolygon2MinBox}
                                        lockedTags={this.state.lockedTags}>
                                        <AssetPreview
                                            additionalSettings={this.state.additionalSettings}
                                            autoPlay={true}
                                            controlsEnabled={this.state.isValid}
                                            onBeforeAssetChanged={this.onBeforeAssetSelected}
                                            onChildAssetSelected={this.onChildAssetSelected}
                                            asset={this.state.selectedAsset.asset}
                                            childAssets={this.state.childAssets} />
                                    </Canvas>
                                </Rnd>
                                }
                            </div>
                        </div>
                        {/*<div className="editor-page-right-sidebar">*/}
                        {/*    <TagInput*/}
                        {/*        tags={this.props.project.tags}*/}
                        {/*        lockedTags={this.state.lockedTags}*/}
                        {/*        selectedRegions={this.state.selectedRegions}*/}
                        {/*        onChange={this.onTagsChanged}*/}
                        {/*        onLockedTagsChange={this.onLockedTagsChanged}*/}
                        {/*        onTagClick={this.onTagClicked}*/}
                        {/*        onCtrlTagClick={this.onCtrlTagClicked}*/}
                        {/*        onTagRenamed={this.confirmTagRenamed}*/}
                        {/*        onTagDeleted={this.confirmTagDeleted}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        <Confirm title={strings.editorPage.tags.rename.title}
                            ref={this.renameTagConfirm}
                            message={strings.editorPage.tags.rename.confirmation}
                            confirmButtonColor="danger"
                            onConfirm={this.onTagRenamed} />
                        <Confirm title={strings.editorPage.tags.delete.title}
                            ref={this.deleteTagConfirm}
                            message={strings.editorPage.tags.delete.confirmation}
                            confirmButtonColor="danger"
                            onConfirm={this.onTagDeleted} />
                        <Confirm title={strings.projectSettings.sourceConnection.removeProvider.title}
                                 ref={this.deleteSourceProviderConfirm}
                                 message={strings.projectSettings.sourceConnection.removeProvider.confirmation}
                                 confirmButtonColor="danger"
                                 onConfirm={this.onSourceProviderDeleted} />
                        <Confirm title={strings.editorPage.canvas.deleteAsset.title}
                                 ref={this.deleteConfirm as any}
                                 message={strings.editorPage.canvas.deleteAsset.confirmation}
                                 confirmButtonColor="danger"
                                 onConfirm={this.onAssetDeleted}/>
                    </div>
                </SplitPane>
                <Alert show={this.state.showInvalidRegionWarning}
                    title={strings.editorPage.messages.enforceTaggedRegions.title}
                    // tslint:disable-next-line:max-line-length
                    message={strings.editorPage.messages.enforceTaggedRegions.description}
                    closeButtonColor="info"
                    onClose={() => this.setState({ showInvalidRegionWarning: false })} />
                <DraggableDialog
                    title={strings.editorPage.assetsFolderBar.importTaggedAssets.progress.title}
                    ref={this.draggableDialog}
                    content={strings.editorPage.assetsFolderBar.importTaggedAssets.progress.content}
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth={true}
                    onDone={() => {
                        this.draggableDialog.current.close();
                        location.reload();
                    }}
                    onCancel={() => this.draggableDialog.current.close()}
                />
            </div>
        );
    }

    private onPageClick = () => {
        this.setState({
            selectedRegions: [],
        });
    }

    private onSourceProviderDeleted = async (project: IProject, item: IProviderOptions|ISecureString):
        Promise<void> => {
        const newProject: IProject = {
            ...project,
            sourceConnection: {
                ...project.sourceConnection,
                providerOptionsOthers:
                    project.sourceConnection.providerOptionsOthers.filter(
                        (i) => i !== item,
                    ),
            },
        };
        await this.props.applicationActions.ensureSecurityToken(newProject);
        await this.props.actions.saveProject(newProject);
        this.setState({
            treeList: this.state.treeList.filter((i) => i !== item),
        });
    }

    /**
     * Remove asset and projects and saves files
     * @param tagName Name of tag to be deleted
     */
    private onAssetDeleted = async (): Promise<void> => {
        const { selectedAsset } = this.state;
        // await this.localFileSystem.deleteDirectory(decodeURI(selectedAsset.asset.path.replace("file:", "")));
        // this.props.project.assets[selectedAsset.asset.id].
        this.canvas.current.removeAllRegions();
        const finalProject = await this.props.actions.deleteAsset(this.props.project, selectedAsset.asset);
        await this.props.actions.saveProject(finalProject);
        // console.log(`删除素材fuck：${JSON.stringify(this.props.project)}`);
        toast.success(`成功删除`);
        this.goToRootAsset(1);
        await this.deleteAssetsAndRefreshProjectAssets(finalProject);
        // console.log(`删除素材fuck 222：${JSON.stringify(this.props.project)}`);
        // this.updateRootAssets();
    }

    /**
     * 导入已经标记的素材
     */
    private onImportTaggedAssets = async (): Promise<void> => {
        const fileFolder = await this.localFileSystem.importTaggedContainer();
        if (!fileFolder) { return; }
        this.draggableDialog.current.open();
        const folder = fileFolder.toString().split(",");
        const allNum = folder.length;
        let i = 0;
        await folder.mapAsync(async (item) => {
            try {
                console.log(`导入已经标记的素材: ${item}`);
                const updateProject = await this.props.actions.importTaggedAssets(this.props.project, item);
                await this.props.actions.saveProject(updateProject);
                i++;
            } catch (e) {
                console.error(e);
            }
        });
        if (i >= allNum) {
            this.draggableDialog.current.change(strings.editorPage.assetsFolderBar.importTaggedAssets.done.title,
                strings.editorPage.assetsFolderBar.importTaggedAssets.done.content,
                true);
        } else if (i > 0 && i < allNum) {
            this.draggableDialog.current.change(strings.editorPage.assetsFolderBar.importTaggedAssets.errorPart.title,
                interpolate(strings.editorPage.assetsFolderBar.importTaggedAssets.errorPart.content, { part: `${i}/${allNum}`}),
                true);
        } else {
            this.draggableDialog.current.change(strings.editorPage.assetsFolderBar.importTaggedAssets.error.title,
                strings.editorPage.assetsFolderBar.importTaggedAssets.error.content,
                true);
        }
    }

    /**
     * Called when the asset side bar is resized
     * @param newWidth The new sidebar width
     */
    private onSideBarResize = (newWidth: number) => {
        this.setState({
            thumbnailSize: {
                width: newWidth,
                height: newWidth / (4 / 3),
            },
        }, () => this.canvas.current.forceResize());
    }

    /**
     * Called when the asset sidebar has been completed
     */
    private onSideBarResizeComplete = () => {
        const appSettings = {
            ...this.props.appSettings,
            thumbnailSize: this.state.thumbnailSize,
        };

        this.props.applicationActions.saveAppSettings(appSettings);
    }

    /**
     * Called when a tag from footer is clicked
     * @param tag Tag clicked
     */
    private onTagClicked = (tag: ITag): void => {
        console.log("editorPage: onTagClicked: " + JSON.stringify(tag));

        this.setState({
            selectedTag: tag.name,
            lockedTags: [],
        }, () => this.canvas.current.applyTag(tag.name));
        // this.setState({
        //         selectedTag: tag.name,
        //         lockedTags: [],
        //         selectedAsset: {
        //             ...this.state.selectedAsset,
        //             asset: {
        //                 ...this.state.selectedAsset.asset,
        //                 state: AssetState.Tagged,
        //             },
        //         },
        //     }, () => this.canvas.current.applyTag(tag.name));
    }

    /**
     * Open confirm dialog for tag renaming
     */
    private confirmTagRenamed = (tagName: string, newTagName: string): void => {
        this.renameTagConfirm.current.open(tagName, newTagName);
    }

    /**
     * Renames tag in assets and project, and saves files
     * @param tagName Name of tag to be renamed
     * @param newTagName New name of tag
     */
    private onTagRenamed = async (tagName: string, newTagName: string): Promise<void> => {
        const assetUpdates = await this.props.actions.updateProjectTag(this.props.project, tagName, newTagName);
        const selectedAsset = assetUpdates.find((am) => am.asset.id === this.state.selectedAsset.asset.id);

        if (selectedAsset) {
            if (selectedAsset) {
                this.setState({ selectedAsset });
            }
        }
    }

    /**
     * Open Confirm dialog for tag deletion
     */
    private confirmTagDeleted = (tagName: string): void => {
        this.deleteTagConfirm.current.open(tagName);
    }

    /**
     * Removes tag from assets and projects and saves files
     * @param tagName Name of tag to be deleted
     */
    private onTagDeleted = async (tagName: string): Promise<void> => {
        const assetUpdates = await this.props.actions.deleteProjectTag(this.props.project, tagName);
        const selectedAsset = assetUpdates.find((am) => am.asset.id === this.state.selectedAsset.asset.id);

        if (selectedAsset) {
            this.setState({ selectedAsset });
        }
    }

    private onCtrlTagClicked = (tag: ITag): void => {
        const locked = this.state.lockedTags;
        this.setState({
            selectedTag: tag.name,
            lockedTags: CanvasHelpers.toggleTag(locked, tag.name),
        }, () => this.canvas.current.applyTag(tag.name));
    }

    private getTagFromKeyboardEvent = (event: KeyboardEvent): ITag => {
        let key = parseInt(event.key, 10);
        if (isNaN(key)) {
            try {
                key = parseInt(event.key.split("+")[1], 10);
            } catch (e) {
                return;
            }
        }
        let index: number;
        const tags = this.props.project.tags;
        if (key === 0 && tags.length >= 10) {
            index = 9;
        } else if (key < 10) {
            index = key - 1;
        }
        if (index < tags.length) {
            return tags[index];
        }
        return null;
    }

    /**
     * Listens for {number key} and calls `onTagClicked` with tag corresponding to that number
     * @param event KeyDown event
     */
    private handleTagHotKey = (event: KeyboardEvent): void => {
        const tag = this.getTagFromKeyboardEvent(event);
        if (tag) {
            this.onTagClicked(tag);
        }
    }

    private handleCtrlTagHotKey = (event: KeyboardEvent): void => {
        const tag = this.getTagFromKeyboardEvent(event);
        if (tag) {
            this.onCtrlTagClicked(tag);
        }
    }

    /**
     * Raised when a child asset is selected on the Asset Preview
     * ex) When a video is paused/seeked to on a video
     */
    private onChildAssetSelected = async (childAsset: IAsset) => {
        if (this.state.selectedAsset && this.state.selectedAsset.asset.id !== childAsset.id) {
            await this.selectAsset(childAsset);
        }
    }

    /**
     * Returns a value indicating whether the current asset is taggable
     */
    private isTaggableAssetType = (asset: IAsset): boolean => {
        return asset.type !== AssetType.Unknown && asset.type !== AssetType.Video;
    }

    /**
     * Raised when the selected asset has been changed.
     * This can either be a parent or child asset
     */
    private onAssetMetadataChanged = async (assetMetadata: IAssetMetadata): Promise<void> => {
        console.log(`editorpage加载啦啦 onAssetMetadataChanged`);

        const startTime = new Date().valueOf(); // 开始时间
        // If the asset contains any regions without tags, don't proceed.
        const regionsWithoutTags = assetMetadata.regions.filter((region) => region.tags.length === 0);

        if (regionsWithoutTags.length > 0) {
            this.setState({ isValid: false });
            return;
        }

        const initialState = assetMetadata.asset.state;

        // The root asset can either be the actual asset being edited (ex: VideoFrame) or the top level / root
        // asset selected from the side bar (image/video).
        const rootAsset = { ...(assetMetadata.asset.parent || assetMetadata.asset) };
        // console.log("assetMetadata: " + JSON.stringify(assetMetadata));
        if (this.isTaggableAssetType(assetMetadata.asset)) {
            if (assetMetadata.asset.state === AssetState.OkTagged) {
                assetMetadata.asset.state = AssetState.OkTagged;
            } else {
                assetMetadata.asset.state = assetMetadata.regions.length > 0 ? AssetState.Tagged : AssetState.Visited;
            }
            // console.log("assetMetadata " + JSON.stringify(assetMetadata));
        } else if (assetMetadata.asset.state === AssetState.NotVisited) {
            assetMetadata.asset.state = AssetState.Visited;
        }

        // Update root asset if not already in the "Tagged" state
        // This is primarily used in the case where a Video Frame is being edited.
        // We want to ensure that in this case the root video asset state is accurately
        // updated to match that state of the asset.
        if (rootAsset.id === assetMetadata.asset.id) {
            rootAsset.state = assetMetadata.asset.state;
        } else {
            const rootAssetMetadata = await this.props.actions.loadAssetMetadata(this.props.project, rootAsset);

            if (rootAssetMetadata.asset.state !== AssetState.Tagged) {
                rootAssetMetadata.asset.state = assetMetadata.asset.state;
                await this.props.actions.saveAssetMetadata(this.props.project, rootAssetMetadata);
            }

            rootAsset.state = rootAssetMetadata.asset.state;
        }

        // Only update asset metadata if state changes or is different
        if (initialState !== assetMetadata.asset.state || this.state.selectedAsset !== assetMetadata) {
            await this.props.actions.saveAssetMetadata(this.props.project, assetMetadata);
        }

        await this.props.actions.saveProject(this.props.project);

        const assetService = new AssetService(this.props.project);
        const childAssets = assetService.getChildAssets(rootAsset);

        // Find and update the root asset in the internal state
        // This forces the root assets that are displayed in the sidebar to
        // accurately show their correct state (not-visited, visited or tagged)
        const assets = [...this.state.assets];
        const assetIndex = assets.findIndex((asset) => asset.id === rootAsset.id);
        if (assetIndex > -1) {
            assets[assetIndex] = {
                ...rootAsset,
            };
        }

        this.setState({ childAssets, assets, isValid: true });
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`editorpage加载啦啦 onAssetMetadataChanged end ${(endTime - startTime).toString()} 毫秒`);
    }

    /**
     * Raised when the asset binary has been painted onto the canvas tools rendering canvas
     */
    private onCanvasRendered = async (canvas: HTMLCanvasElement) => {
        console.log(`变变变editorpage加载啦啦 onCanvasRendered`);
        const startTime = new Date().valueOf(); // 开始时间
        // When active learning auto-detect is enabled
        // run predictions when asset changes
        if (this.props.project.activeLearningSettings.autoDetect && !this.state.selectedAsset.asset.predicted) {
            await this.predictRegions(canvas);
        }
        const endTime = new Date().valueOf(); // 结束时间
        console.log(`变变变editorpage加载啦啦 onCanvasRendered ${(endTime - startTime).toString()} 毫秒`);
    }

    private onSelectedRegionsChanged = (selectedRegions: IRegion[]) => {
        this.setState({ selectedRegions });
    }

    private onTagsChanged = async (tags) => {
        const project = {
            ...this.props.project,
            tags,
        };

        await this.props.actions.saveProject(project);
    }

    private onLockedTagsChanged = (lockedTags: string[]) => {
        this.setState({ lockedTags });
    }

    private onToolbarItemSelected = async (toolbarItem: ToolbarItem): Promise<void> => {
        let w;
        let zoomDelta;
        switch (toolbarItem.props.name) {
            case ToolbarItemName.DrawWithPencil:
                if (this.props.appSettings.zengyining) {
                    this.setState({
                        selectionMode: SelectionMode.NONE,
                        editorMode: EditorMode.Pencil,
                        zoomMode: {
                            ...this.state.zoomMode,
                            disableDrag: true,
                        },
                        isDrawPolygon2MinBox: false,
                    });
                } else {
                    toast.warn("试用版本未开放");
                }
                this.canvas.current.enableCanvas(true);
                // this.canvas.current.editor.AS.enable();
                // this.canvas.current.editor.AS.show();
                break;
            case ToolbarItemName.DrawRectangle:
                this.setState({
                    ...this.state,
                    selectionMode: SelectionMode.RECT,
                    editorMode: EditorMode.Rectangle,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: true,
                    },
                    isDrawPolygon2MinBox: false,
                });
                this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.DrawPolygon:
                this.setState({
                    selectionMode: SelectionMode.POLYGON,
                    editorMode: EditorMode.Polygon,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: true,
                    },
                    isDrawPolygon2MinBox: false,
                });
                this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.DrawPolygon2MinBox:
                this.setState({
                    selectionMode: SelectionMode.POLYGON,
                    editorMode: EditorMode.Polygon,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: true,
                    },
                    isDrawPolygon2MinBox: true,
                });
                this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.CopyRectangle:
                this.setState({
                    selectionMode: SelectionMode.COPYRECT,
                    editorMode: EditorMode.CopyRect,
                    isDrawPolygon2MinBox: false,
                });
                this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.ShowAllRegions:
                break;
            case ToolbarItemName.HideAllRegions:
                break;
            case ToolbarItemName.SelectCanvas:
                this.setState({
                    selectionMode: SelectionMode.NONE,
                    editorMode: EditorMode.Select,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: false,
                    },
                    isDrawPolygon2MinBox: false,
                });
                this.canvas.current.enableCanvas(false);
                break;
            case ToolbarItemName.ZoomOutAsset: // 缩小
                w = document.getElementById("ct-zone").offsetWidth;
                zoomDelta = w - 100;
                if ( zoomDelta < this.state.zoomMode.miniWidth) { return; }
                this.setState({
                    zoomMode: {
                        ...this.state.zoomMode,
                        width: zoomDelta,
                    },
                });
                break;
            case ToolbarItemName.ZoomInAsset: // 放大
                w = document.getElementById("ct-zone").offsetWidth;
                zoomDelta = w + 100;
                if ( zoomDelta < this.state.zoomMode.miniWidth) { return; }
                this.setState({
                    zoomMode: {
                        ...this.state.zoomMode,
                        width: zoomDelta,
                    },
                });
                break;
            case ToolbarItemName.ZoomNormolAsset: // 正常
                this.setState({
                    ...this.state,
                    zoomMode: {
                        ...emptyZoomMode,
                        disableDrag: this.state.zoomMode.disableDrag,
                    },
                });
                break;
            case ToolbarItemName.PreviousAsset:
                await this.goToRootAsset(-1);
                this.setState({
                    ...this.state,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: true,
                    },
                });
                // this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.NextAsset:
                await this.goToRootAsset(1);
                this.setState({
                    ...this.state,
                    zoomMode: {
                        ...this.state.zoomMode,
                        disableDrag: true,
                    },
                });
                // this.canvas.current.enableCanvas(true);
                break;
            case ToolbarItemName.DeleteAsset:
                this.deleteConfirm.current.open();
                break;
            case ToolbarItemName.CopyRegions:
                this.canvas.current.enableCanvas(true);
                this.canvas.current.copyRegions();
                this.canvas.current.pasteRegions();
                break;
            // case ToolbarItemName.CutRegions:
            //     this.canvas.current.cutRegions();
            //     break;
            // case ToolbarItemName.PasteRegions:
            //     this.canvas.current.pasteRegions();
            //     break;
            case ToolbarItemName.RemoveAllRegions:
                this.canvas.current.confirmRemoveAllRegions();
                break;
            case ToolbarItemName.ActiveLearning:
                await this.predictRegions();
                break;
            case ToolbarItemName.SaveProject:
                await this.props.actions.saveProject(this.props.project);
                // toast.error("开始到处");
                // cv.readImage("/home/baymin/图片/crop9.bmp", (err, im) => {
                //     im.save("/home/baymin/图片/crop9.jpg");
                // });
                // const mat = cv.imread("/home/baymin/图片/1964668478.jpg");
                // toast.error("开始到处");
                // load image from file
                // imread ( filePath : string , flags : int = cv.IMREAD_COLOR ) : Result
                // const mat =  imread("/home/baymin/图片/1964668478.jpg", cv.IMREAD_COLOR);
                // cv.imreadAsync('./path/img.jpg', (err, mat) => {
                // ...
                // })

// save image
//                 cv.imwrite("/home/baymin/图片/1964668478sssss.jpg", mat);
                // cv.imwriteAsync('./path/img.jpg', mat,(err) => {
                // ...
                // })

// show image
//                 cv.imshow("a window name", mat);
//                 cv.waitKey();
//                 this.props.history.push(`/projects/${projectId}/settings`);
                break;
            case ToolbarItemName.ExportProject:
                // toast.error("开始到处");
                this.props.history.push(`/projects/${projectId}/export`);
                break;
            case ToolbarItemName.TransferProject:
                if (this.props.appSettings.zengyining) {
                    await this.props.actions.transferProject(this.props.project);
                } else {
                    toast.warn("试用版本未开放");
                }
                // this.props.history.push(`/projects/${projectId}/export`);
                break;
            case ToolbarItemName.TrainAi:
                if (this.props.appSettings.zengyining) {
                    this.props.history.push(`/projects/${projectId}/train`);
                } else {
                    toast.warn("试用版本未开放");
                }
                // toast.error("开始到处");
                break;
            case ToolbarItemName.RemoteTrainAi:
                this.props.history.push(`/projects/${projectId}/remote-train-page`);
                // toast.error("开始远程训练");
                // IpcRendererProxy.send(`TrainingSystem:remoteTrain`, [this.props.project])
                //     .then(() => {
                //         toast.success(`配置成功`);
                //     });
                // this.props.history.push(`/projects/${projectId}/train`);
                break;
            case ToolbarItemName.OnlineTest:
                this.props.actions.test();
                // if (this.props.appSettings.zengyining) {
                //     this.props.history.push(`/projects/${projectId}/remote-test-page`);
                // } else {
                //     toast.warn("试用版本未开放");
                // }
                break;
        }
    }

    private predictRegions = async (canvas?: HTMLCanvasElement) => {
        canvas = canvas || document.querySelector("canvas");
        if (!canvas) {
            return;
        }

        // Load the configured ML model
        if (!this.activeLearningService.isModelLoaded()) {
            let toastId: number = null;
            try {
                toastId = toast.info(strings.activeLearning.messages.loadingModel, { autoClose: false });
                await this.activeLearningService.ensureModelLoaded();
            } catch (e) {
                toast.error(strings.activeLearning.messages.errorLoadModel);
                return;
            } finally {
                toast.dismiss(toastId);
            }
        }

        // Predict and add regions to current asset
        try {
            const updatedAssetMetadata = await this.activeLearningService
                .predictRegions(canvas, this.state.selectedAsset);

            await this.onAssetMetadataChanged(updatedAssetMetadata);
            this.setState({ selectedAsset: updatedAssetMetadata });
        } catch (e) {
            throw new AppError(ErrorCode.ActiveLearningPredictionError, "Error predicting regions");
        }
    }

    /**
     * Navigates to the previous / next root asset on the sidebar
     * @param direction Number specifying asset navigation
     */
    private goToRootAsset = async (direction: number) => {
        this.setState({
            ...this.state,
            zoomMode: {
                ...emptyZoomMode,
                disableDrag: this.state.zoomMode.disableDrag,
                width: "auto",
                height: "auto",
            },
        });
        const selectedRootAsset = this.state.selectedAsset.asset.parent || this.state.selectedAsset.asset;
        const currentIndex = this.state.assets
            .findIndex((asset) => asset.id === selectedRootAsset.id);
        if (direction > 0) {
            await this.selectAsset(this.state.assets[Math.min(this.state.assets.length - 1, currentIndex + 1)]);
        } else {
            await this.selectAsset(this.state.assets[Math.max(0, currentIndex - 1)]);
        }
    }

    private onBeforeAssetSelected = (): boolean => {
        if (!this.state.isValid) {
            this.setState({ showInvalidRegionWarning: true });
        }

        return this.state.isValid;
    }

    private selectAsset = async (asset: IAsset): Promise<void> => {

        // Nothing to do if we are already on the same asset.
        if (this.state.selectedAsset && this.state.selectedAsset.asset.id === asset.id) {
            return;
        }

        if (!this.state.isValid) {
            this.setState({ showInvalidRegionWarning: true });
            return;
        }

        const assetMetadata = await this.props.actions.loadAssetMetadata(this.props.project, asset);
        try {
            if (!assetMetadata.asset.size) {
                const assetProps = await HtmlFileReader.readAssetAttributes(asset);
                assetMetadata.asset.size = { width: assetProps.width, height: assetProps.height };
            }
        } catch (err) {
            console.warn("Error computing asset size");
        }

        this.setState({
            selectedAsset: assetMetadata,
        }, async () => {
            await this.onAssetMetadataChanged(assetMetadata);
        });
    }

    private loadProjectAssets = async (): Promise<void> => {
        if (this.loadingProjectAssets || this.state.assets.length > 0) {
            return;
        }

        this.loadingProjectAssets = true;

        // Get all root project assets
        const rootProjectAssets = _.values(this.props.project.assets)
            .filter((asset) => !asset.parent);

        // Get all root assets from source asset provider
        const sourceAssets = await this.props.actions.loadAssets(this.props.project);
        // Merge and uniquify
        const rootAssets = _(rootProjectAssets)
            .concat(sourceAssets)
            .uniqBy((asset) => asset.id)
            .value();
        const lastVisited = rootAssets.find((asset) => asset.id === this.props.project.lastVisitedAssetId);

        this.setState({
            assets: rootAssets,
        }, async () => {
            if (rootAssets.length > 0) {
                await this.selectAsset(lastVisited ? lastVisited : rootAssets[0]);
            }
            this.loadingProjectAssets = false;
        });

    }

    private deleteAssetsAndRefreshProjectAssets = async (finalProject): Promise<void> => {
        const newAssets = _.values(this.state.assets)
            .filter((asset) => asset.id !== this.state.selectedAsset.asset.id)
            .sort((a, b) => a.timestamp - b.timestamp);
        this.setState({
            assets: newAssets,
        });
        // await this.props.actions.saveProject(finalProject);
    }

    private loadProjectAssetsWithFolder = async (folder): Promise<void> => {
        if (this.loadingProjectAssets) {
            return;
        }

        this.loadingProjectAssets = true;

        // Get all root project assets
        const rootProjectAssets = _.values(this.props.project.assets)
            .filter((asset) => !asset.parent);
        // Get all root assets from source asset provider
        const sourceAssets = await this.props.actions.loadAssetsWithFolder(this.props.project, folder);
        // Merge and uniquify
        const rootAssets = sourceAssets;
        _(rootProjectAssets)
            .concat(sourceAssets)
            .uniqBy((asset) => asset.id)
            .value();
        const lastVisited = rootAssets.find((asset) => asset.id === this.props.project.lastVisitedAssetId);

        this.setState({
            assets: rootAssets,
        }, async () => {
            if (rootAssets.length > 0) {
                await this.selectAsset(lastVisited ? lastVisited : rootAssets[0]);
            }
            this.loadingProjectAssets = false;
        });
    }

    /**
     * Updates the root asset list from the project assets
     */
    private updateRootAssets = () => {
        const updatedAssets = [...this.state.assets];
        updatedAssets.forEach((asset) => {
            const projectAsset = this.props.project.assets[asset.id];
            if (projectAsset) {
                asset.state = projectAsset.state;
            }
        });

        this.setState({ assets: updatedAssets });
    }
}
