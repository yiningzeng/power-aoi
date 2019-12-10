import React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { bindActionCreators } from "redux";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import IApplicationActions, * as applicationActions from "../../../../redux/actions/applicationActions";
import "./homePage.scss";
import {
    IApplicationState, IConnection, IProject, IFileInfo,
    ErrorCode, AppError, IAppError, IAppSettings, IAsset, IProviderOptions,
} from "../../../../models/applicationState";
import { toast } from "react-toastify";
import LoginInput from "./components/loginInput";
// @ts-ignore
import ProgressButton from "./components/progressButton";
import MD5 from "md5.js";
export interface ILoginProps extends RouteComponentProps, React.Props<Login> {
    recentProjects: IProject[];
    connections: IConnection[];
    actions: IProjectActions;
    applicationActions: IApplicationActions;
    appSettings: IAppSettings;
    project: IProject;
}

export interface ILoginState {
    username: string;
    password: string;
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
export default class Login extends React.Component<ILoginProps, ILoginState> {
    public state: ILoginState = {
        username: "",
        password: "",
    };
    constructor(props, context) {
        super(props, context);
    }

    public render() {
        // this.props.actions.test();
        return (
            <div>
                <LoginInput
                    label={"用户名"}
                    onChange={(v) => {
                        this.setState({
                            ...this.state,
                            username: v.target.value,
                        });
                    }}
                />
                <LoginInput
                    password
                    label={"密码"}
                    onChange={(v) => {
                        this.setState({
                            ...this.state,
                            password: v.target.value,
                        });
                    }}
                />
                <ProgressButton
                    label={"登  录"}
                    onButtonClick={ (value) => {
                        if (this.state.username === "" || this.state.password === "") {
                            toast.error("用户名和密码不可为空");
                            return false;
                        }
                        toast.info(`用户名: ${this.state.username}\n 密码: ${this.state.password}\n 密码md5: ${new MD5().update(this.state.password).digest("hex")}`);
                        return true;
                    }}
                />
            </div>
        );
    }
}
