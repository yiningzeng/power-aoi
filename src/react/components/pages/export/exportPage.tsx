import React, {Fragment} from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router-dom";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import ExportForm from "./exportForm";
import { IProject, IApplicationState, IExportFormat } from "../../../../models/applicationState";
import { strings } from "../../../../common/strings";
import DraggableDialog from "../../common/draggableDialog/draggableDialog";
import { ExportAssetState } from "../../../../providers/export/exportProvider";
import { toast } from "react-toastify";
import Confirm from "../../common/confirm/confirm";

/**
 * Properties for Export Page
 * @member project - Project being edited
 * @member recentProjects - Array of projects recently viewed/edited
 * @member actions - Project actions
 */
export interface IExportPageProps extends RouteComponentProps, React.Props<ExportPage> {
    project: IProject;
    recentProjects: IProject[];
    actions: IProjectActions;
}

function mapStateToProps(state: IApplicationState) {
    return {
        project: state.currentProject,
        recentProjects: state.recentProjects,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(projectActions, dispatch),
    };
}

/**
 * @name - Export Page
 * @description - Page for adding/editing/removing export configurations
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class ExportPage extends React.Component<IExportPageProps> {
    private emptyExportFormat: IExportFormat = {
        providerType: "",
        providerOptions: {
            assetState: ExportAssetState.All,
        },
    };

    private draggableDialog: React.RefObject<DraggableDialog> = React.createRef();

    constructor(props, context) {
        super(props, context);

        const projectId = this.props.match.params["projectId"];
        if (!this.props.project && projectId) {
            const project = this.props.recentProjects.find((project) => project.id === projectId);
            this.props.actions.loadProject(project);
        }

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormCancel = this.onFormCancel.bind(this);
    }

    public render() {
        const exportFormat = this.props.project && this.props.project.exportFormat
            ? this.props.project.exportFormat
            : { ...this.emptyExportFormat };

        return (
            <div className="m-3">
                <DraggableDialog
                    title={strings.export.messages.title}
                    ref={this.draggableDialog}
                    content={strings.export.messages.content}
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth={true}
                    onDone={() => this.props.history.goBack()}
                    onCancel={() => this.draggableDialog.current.close()}
                />
                <h3>
                    <i className="fas fa-sliders-h fa-1x"></i>
                    <span className="px-2">
                        {strings.export.settings}
                    </span>
                </h3>
                <div className="m-3">
                    <ExportForm
                        settings={exportFormat}
                        onSubmit={this.onFormSubmit}
                        onCancel={this.onFormCancel} />
                </div>
            </div>
        );
    }

    private onFormSubmit = async (exportFormat: IExportFormat) => {

        this.draggableDialog.current.open();
        const projectToUpdate: IProject = {
            ...this.props.project,
            exportFormat,
        };

        await this.props.actions.saveProject(projectToUpdate);
        // region 导出
        // const infoId = toast.info(`Started export for ${this.props.project.name}...`, { autoClose: false });
        const exportTrain = await this.props.actions.exportTrainConfig(this.props.project);
        // if (!exportTrain || exportTrain ) {
            // toast.success(`导出训练配置文件成功`);
        // }
        // const res = await this.props.actions.packageProject(projectToUpdate);
        // this.draggableDialog.current.change("导出", JSON.stringify(res));
        const results = await this.props.actions.exportProject(this.props.project);
        // toast.dismiss(infoId);
        if (!results || (results && results.errors.length === 0)) {
            this.draggableDialog.current.change("导出完成", "导出成功，确定返回上一页", true, true);
        } else if (results && results.errors.length > 0) {
            this.draggableDialog.current.change("导出不全",
                `成功的导出了 ${results.completed.length}/${results.count} 素材，但导出不全，请检查`, true, true);
            // toast.warn(`成功的导出了 ${results.completed.length}/${results.count} 素材，但导出不全，请检查`);
        }
        // endregion
        // this.props.history.goBack();
    }

    private onFormCancel() {
        this.props.history.goBack();
    }
}
