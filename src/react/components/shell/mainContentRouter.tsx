import React from "react";
import { Switch, Route } from "react-router-dom";
import HomePage from "../pages/homepage/homePage";
import Login from "../pages/login/login";
import ActiveLearningPage from "../pages/activeLearning/activeLearningPage";
// import TrainSettingsPage from "../pages/trainSettings/trainSettingsPage";
import TrainPage from "../pages/train/trainPage";
import RemoteTrainPage from "../pages/remoteTrain/remoteTrainPage";
import AppSettingsPage from "../pages/appSettings/appSettingsPage";
import ConnectionPage from "../pages/connections/connectionsPage";
import Manage from "../pages/webManage/manage";
import EditorPage from "../pages/editorPage/editorPage";
import ExportPage from "../pages/export/exportPage";
import ProjectSettingsPage from "../pages/projectSettings/projectSettingsPage";
import AiTestSettingsPage from "../pages/aitest/testSettingsPage";

/**
 * @name - Main Content Router
 * @description - Controls main content pane based on route
 */
export default function MainContentRouter() {
    return (
        <div className="app-content text-light">
            <Switch>
                <Route path="/" exact component={Login} />
                <Route path="/settings" component={AppSettingsPage} />
                <Route path="/connections/:connectionId" component={ConnectionPage} />
                <Route path="/connections" exact component={ConnectionPage} />
                <Route path="/web-manage" exact component={Manage} />
                <Route path="/projects/:projectId/edit" component={EditorPage} />
                <Route path="/projects/create" component={ProjectSettingsPage} />
                <Route path="/projects/:projectId/settings" component={ProjectSettingsPage} />
                <Route path="/projects/:projectId/export" component={ExportPage} />
                <Route path="/projects/:projectId/active-learning" component={ActiveLearningPage} />
                {/*<Route path="/projects/:projectId/train-settings" component={TrainSettingsPage} />*/}
                <Route path="/projects/:projectId/train" component={TrainPage} />
                <Route path="/projects/:projectId/remote-train-page" component={RemoteTrainPage} />
                <Route path="/projects/:projectId/remote-test-page" component={AiTestSettingsPage} />
                <Route component={HomePage} />
            </Switch>
        </div>
    );
}
