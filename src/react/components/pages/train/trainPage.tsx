import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router-dom";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import TrainForm from "./trainForm";
import {IProject, IApplicationState, IExportFormat, ITrainFormat} from "../../../../models/applicationState";
import { strings } from "../../../../common/strings";
import { ExportAssetState } from "../../../../providers/export/exportProvider";
import { toast } from "react-toastify";
import {IYoloV3} from "../../../../models/trainConfig";
import {IpcRendererProxy} from "../../../../common/ipcRendererProxy";
import DraggableDialog from "../../common/draggableDialog/draggableDialog";
/**
 * Properties for Export Page
 * @member project - Project being edited
 * @member recentProjects - Array of projects recently viewed/edited
 * @member actions - Project actions
 */
export interface ITrainPageProps extends RouteComponentProps, React.Props<TrainPage> {
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

const trainSettingsYolov3: IYoloV3 = {
    gpu_numb: 0,
    yolov3net: {
        batch: 64,
        subdivisions: 16,
        width: 608,
        height: 608,
        channels: 3,
        momentum: 0.9,
        decay: 0.0005,
        angle: 0,
        saturation: 1.5,
        exposure: 1.5,
        hue: .1,
        learning_rate: 0.001,
        burn_in: 1000,
        max_batches: 500200,
        policy: "steps",
        steps: "400000,450000",
        scales: ".1,.1",
    },
};
/**
 * @name - Export Page
 * @description - Page for adding/editing/removing export configurations
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class TrainPage extends React.Component<ITrainPageProps> {
    private emptyTrainFormat: ITrainFormat = {
        ip: "localhost",
        providerType: "yolov3",
        providerOptions: trainSettingsYolov3,
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
        const trainFormat = this.props.project && this.props.project.trainFormat
            ? this.props.project.trainFormat
            : { ...this.emptyTrainFormat };

        return (
            <div className="m-3">
                <DraggableDialog
                    title={strings.export.messages.title}
                    ref={this.draggableDialog}
                    content={strings.export.messages.content}
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth={true}
                    onDone={() => this.props.history.push(`/web-manage`)}
                    onCancel={() => this.props.history.push(`/web-manage`)}
                />
                <h3>
                    <i className="fas fa-sliders-h fa-1x"></i>
                    <span className="px-2">
                        {strings.train.settings}
                    </span>
                </h3>
                <div className="m-3">
                    <TrainForm
                        settings={trainFormat}
                        onSubmit={this.onFormSubmit}
                        onCancel={this.onFormCancel} />
                </div>
            </div>
        );
    }

    private onFormSubmit = async (trainFormat: ITrainFormat) => {
        this.draggableDialog.current.open();
        const projectToUpdate: IProject = {
            ...this.props.project,
            trainFormat,
        };
        await this.props.actions.saveProject(projectToUpdate);
        // toast.success(strings.export.messages.saveSuccess);

        // region 开始训练
        // const infoId = toast.info(`开始导出 ${this.props.project.name} ...`);
        // const results = await this.props.actions.exportProject(this.props.project);
        // const resultsTrainConfig = await this.props.actions.exportTrainConfig(this.props.project);
        // toast.dismiss(infoId);
        //
        // if (!resultsTrainConfig || (resultsTrainConfig && resultsTrainConfig.success)) {
        //     toast.success(`导出成功!`);
        // } else if (resultsTrainConfig && !resultsTrainConfig.success) {
        // }
        // if (!results || (results && results.errors.length === 0)) {
        //     toast.success(`导出成功!`);
        // } else if (results && results.errors.length > 0) {
        //     toast.warn(`成功导出部分 ${results.completed.length}/${results.count} 资源`);
        // }

        // toast.info(`开始配置训练...`);
        this.draggableDialog.current.change("导出配置文件", "请耐心等待，去喝杯咖啡再来吧");
        await this.props.actions.exportTrainConfig(this.props.project);
        // toast.dismiss(infoId);
        // IpcRendererProxy.send(`TrainingSystem:${this.props.project.trainFormat.providerType}`, [this.props.project])
        //     .then((data) => {
        //     console.log(data);
        // });
        // alert("232323");
        // endregion

        this.draggableDialog.current.change("正在打包", "请耐心等待，去喝杯咖啡再来吧");
        const packageRes = await this.props.actions.trainPackageProject(this.props.project);
        if (packageRes.success) {
            const updateProject = {
                ...this.props.project,
                trainFormat: {
                    ...this.props.project.trainFormat,
                    tarBaseName: packageRes.tarBaseName,
                },
            };
            await this.props.actions.saveProject(updateProject);
            this.draggableDialog.current.change(`正在上传`, "请耐心等待，去喝杯咖啡再来吧");
            const upload = await this.props.actions.trainUploadProject(this.props.project, packageRes);
            if (upload.success) {
                this.draggableDialog.current.change(`正在加入训练队列`, "请耐心等待，去喝杯咖啡再来吧");
                const res = await this.props.actions.trainAddQueueProject(this.props.project, packageRes);
                if (res.success) {
                    await this.props.actions.trainAddSql(this.props.project, packageRes);
                    this.draggableDialog.current.change("已成功加入训练队列",
                        "项目等待训练中...在后台管理页面可以查看训练最新状态", true);
                } else {
                    this.draggableDialog.current.change("加入队列失败", res.msg, true);
                }
            } else {
                this.draggableDialog.current.change("上传失败", upload.msg, true);
            }
        } else {
            this.draggableDialog.current.change("打包失败", packageRes.msg, true);
        }
    }

    private onFormCancel() {
        this.props.history.goBack();
    }
}
