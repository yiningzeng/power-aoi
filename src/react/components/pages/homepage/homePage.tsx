import React, { SyntheticEvent } from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { bindActionCreators } from "redux";
import { strings, interpolate } from "../../../../common/strings";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import IApplicationActions, * as applicationActions from "../../../../redux/actions/applicationActions";
import { CloudFilePicker } from "../../common/cloudFilePicker/cloudFilePicker";
import CondensedList from "../../common/condensedList/condensedList";
import Confirm from "../../common/confirm/confirm";
import FilePicker from "../../common/filePicker/filePicker";
import "./homePage.scss";
import RecentProjectItem from "./recentProjectItem";
import { constants } from "../../../../common/constants";
import {
    IApplicationState, IConnection, IProject, IFileInfo,
    ErrorCode, AppError, IAppError, IAppSettings, IAsset, IProviderOptions,
} from "../../../../models/applicationState";
import ImportService from "../../../../services/importService";
import { IAssetMetadata } from "../../../../models/applicationState";
import { toast } from "react-toastify";
import moment from "moment";
import MessageBox from "../../common/messageBox/messageBox";
import { isElectron } from "../../../../common/hostProcess";
import {ILocalFileSystemProxyOptions, LocalFileSystemProxy} from "../../../../providers/storage/localFileSystemProxy";
import * as connectionActions from "../../../../redux/actions/connectionActions";
import trainService from "../../../../services/trainService";

export interface IHomePageProps extends RouteComponentProps, React.Props<HomePage> {
    recentProjects: IProject[];
    connections: IConnection[];
    actions: IProjectActions;
    applicationActions: IApplicationActions;
    appSettings: IAppSettings;
    project: IProject;
}

export interface IHomePageState {
    cloudPickerOpen: boolean;
}

function mapStateToProps(state: IApplicationState) {
    return {
        recentProjects: state.recentProjects,
        connections: state.connections,
        appSettings: state.appSettings,
        project: state.currentProject,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(projectActions, dispatch),
        applicationActions: bindActionCreators(applicationActions, dispatch),
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class HomePage extends React.Component<IHomePageProps, IHomePageState> {
    public state: IHomePageState = {
        cloudPickerOpen: false,
    };

    private filePicker: React.RefObject<FilePicker> = React.createRef();
    private deleteConfirm: React.RefObject<Confirm> = React.createRef();
    private cloudFilePicker: React.RefObject<CloudFilePicker> = React.createRef();
    private importConfirm: React.RefObject<Confirm> = React.createRef();

    constructor(props, context) {
        super(props, context);
        // 试用版本使用这个
        // if (this.props.appSettings.zengyining === undefined || this.props.appSettings.zengyining === null) {
        //     toast.warn("您当前处于试用权限，有些功能会受限制", { autoClose: false });
        // } else {
        //     const newAppSettings = {
        //         ...this.props.appSettings,
        //         zengyining: undefined,
        //     };
        //     this.props.applicationActions.saveAppSettings(newAppSettings);
        //     toast.warn("您当前处于试用权限，有些功能会受限制", {autoClose: false});
        // }
        // if (this.props.appSettings.deadline === undefined || this.props.appSettings.deadline === null) {
        //     const newAppSettings = {
        //         ...this.props.appSettings,
        //         deadline: moment().add(90, "days").format("YYYY-MM-DD"),
        //     };
        //     this.props.applicationActions.saveAppSettings(newAppSettings);
        // }
        // 试用版本使用这个
        // 正式版使用这个
        if (this.props.appSettings.zengyining === undefined || this.props.appSettings.zengyining === null) {
            const newAppSettings = {
                ...this.props.appSettings,
                zengyining: true,
            };
            this.props.applicationActions.saveAppSettings(newAppSettings);
        }
        // 正式版使用这个
    }

    public render() {

        // this.props.actions.test();
        return (
            <div className="app-homepage">
                <div className="app-homepage-main">
                    <ul>
                        <li>
                            <a href="#" onClick={this.createNewProject} className="p-5 new-project">
                                <i className="fas fa-plus-circle fa-9x"></i>
                                <h6 style={{marginTop: "10px"}}>{strings.homePage.newProject}</h6>
                            </a>
                        </li>
                        {isElectron() &&
                        <li>
                            <a href="#" className="p-5 file-upload"
                               onClick={() => this.filePicker.current.upload()}>
                                <i className="fas fa-folder-open fa-9x"></i>
                                <h6 style={{marginTop: "10px"}}>{strings.homePage.openLocalProject.title}</h6>
                            </a>
                            <FilePicker ref={this.filePicker}
                                        onChange={this.onProjectFileUpload}
                                        onError={this.onProjectFileUploadError}/>
                        </li>
                        }
                        {/*{isElectron() &&*/}
                        {/*<li>*/}
                            {/*<a href="#" className="p-5 file-upload"*/}
                               {/*onClick={() => this.filePicker.current.upload()}>*/}
                                {/*<i className="fas fa-file-import fa-9x"></i>*/}
                                {/*<h6 style={{marginTop: "10px", marginLeft: "10px"}}>*/}
                                    {/*{strings.homePage.openTransferProject.title}</h6>*/}
                            {/*</a>*/}
                            {/*<FilePicker ref={this.filePicker}*/}
                                        {/*onChange={this.onProjectFileUpload}*/}
                                        {/*onError={this.onProjectFileUploadError}/>*/}
                        {/*</li>*/}
                        {/*}*/}
                        {/*<li>*/}
                        {/*<a href="#" onClick={this.handleOpenCloudProjectClick} className="p-5 cloud-open-project">*/}
                        {/*<i className="fas fa-cloud fa-9x"></i>*/}
                        {/*<h6>{strings.homePage.openCloudProject.title}</h6>*/}
                        {/*</a>*/}
                        {/*<CloudFilePicker*/}
                        {/*ref={this.cloudFilePicker}*/}
                        {/*connections={this.props.connections}*/}
                        {/*onSubmit={(content) => this.loadSelectedProject(JSON.parse(content))}*/}
                        {/*fileExtension={constants.projectFileExtension}*/}
                        {/*/>*/}
                        {/*</li>*/}
                    </ul>
                </div>
                {(this.props.recentProjects && this.props.recentProjects.length > 0) &&
                <div className="app-homepage-recent bg-lighter-1">
                    <CondensedList
                        title={strings.homePage.recentProjects}
                        Component={RecentProjectItem}
                        items={this.props.recentProjects}
                        onClick={this.loadSelectedProject}
                        onDelete={(project) => this.deleteConfirm.current.open(project)} showToolbar={false}/>
                </div>
                }
                <Confirm title="Delete Project"
                         ref={this.deleteConfirm as any}
                         message={(project: IProject) =>
                             `${strings.homePage.deleteProject.confirmation} ${project.name}?`}
                         confirmButtonColor="danger"
                         onConfirm={this.deleteProject}/>
                <Confirm title="Import Project"
                         ref={this.importConfirm as any}
                         message={(project: IFileInfo) =>
                             interpolate(strings.homePage.importProject.confirmation, {project})}
                         confirmButtonColor="danger"
                         onConfirm={this.convertProject}/>
            </div>
        );
    }

    private afterDeadLine = () => {
        if (this.props.appSettings.zengyining) {
            return false;
        }

        if (moment(moment().format("YYYY-MM-DD")).isAfter(this.props.appSettings.deadline)) {
            toast.warn("程序到期了，为了不影响您的正常使用，请联系轻蜓视觉", { autoClose: false });
            return true;
        } else {
            return false;
        }
    }

    private createNewProject = (e: SyntheticEvent) => {
        if (this.afterDeadLine()) {return; }
        this.props.actions.closeProject();
        this.props.history.push("/projects/create");

        e.preventDefault();
    }

    private handleOpenCloudProjectClick = () => {
        this.cloudFilePicker.current.open();
    }

    private onProjectFileUpload = async (e, project) => {
        if (this.afterDeadLine()) {return; }
        let projectJson: IProject;
        try {
            projectJson = JSON.parse(project.content);
        } catch (error) {
            throw new AppError(ErrorCode.ProjectInvalidJson, "Error parsing JSON");
        }
        // need a better check to tell if its v1
        if (projectJson.name === null || projectJson.name === undefined) {
            try {
                await this.importConfirm.current.open(project);
            } catch (e) {
                throw new Error(e.message);
            }
        } else {
            // if (projectJson.name.includes("-Transfer")) {
            //
            // }
            // 新增connect
            const connection: IConnection = projectJson.targetConnection;
            const provider: ILocalFileSystemProxyOptions = {
                folderPath: JSON.parse(JSON.stringify(connection.providerOptions))["folderPath"],
            };
            const newSource: IConnection = {
                id: connection.id,
                name: connection.id,
                providerType: "localFileSystemProxy",
                providerOptions: provider,
            };
            // projectJson = {
            //     ...projectJson,
            //     version: "yining",
            // };
            connectionActions.saveConnection(newSource);
            await this.loadSelectedProject(projectJson);
        }
    }

    private onProjectFileUploadError = (e, error: any) => {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(ErrorCode.ProjectUploadError, "Error uploading project file");
    }

    private loadSelectedProject = async (project: IProject) => {
        if (this.afterDeadLine()) {return; }
        await this.props.actions.loadProject(project);
        this.props.history.push(`/projects/${project.id}/edit`);
    }

    private deleteProject = async (project: IProject) => {
        if (this.afterDeadLine()) {return; }
        try {
            await this.props.actions.deleteProject(project);
            toast.info(interpolate(strings.homePage.messages.deleteSuccess, { project }));
        } catch (error) {
            throw new AppError(ErrorCode.ProjectDeleteError, "Error deleting project file");
        }
    }
    private convertProject = async (projectInfo: IFileInfo) => {
        if (this.afterDeadLine()) {return; }
        const importService = new ImportService();
        let generatedAssetMetadata: IAssetMetadata[];
        let project: IProject;

        try {
            project = await importService.convertProject(projectInfo);
        } catch (e) {
            throw new AppError(ErrorCode.V1ImportError, "Error converting v1 project file");
        }

        this.props.applicationActions.ensureSecurityToken(project);

        try {
            generatedAssetMetadata = await importService.generateAssets(projectInfo, project);
            await this.props.actions.saveProject(project);
            await this.props.actions.loadProject(project);
            await generatedAssetMetadata.mapAsync((assetMetadata) => {
                return this.props.actions.saveAssetMetadata(this.props.project, assetMetadata);
            });
        } catch (e) {
            throw new Error(`Error importing project information - ${e.message}`);
        }

        await this.props.actions.saveProject(this.props.project);
        await this.loadSelectedProject(this.props.project);
    }
}
