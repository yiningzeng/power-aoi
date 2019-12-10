import React from "react";
import _ from "lodash";
import { IProject, AssetState } from "../../../models/applicationState";
import { strings, interpolate } from "../../../common/strings";

export interface IStatusBarMetricsProps {
    project: IProject;
}

export class StatusBarMetrics extends React.Component<IStatusBarMetricsProps> {
    public render() {
        const { project } = this.props;

        if (!project) {
            return null;
        }

        const projectAssets = _.values(project.assets);
        const visitedAssets = projectAssets
            .filter((asset) => asset.state === AssetState.Visited || asset.state === AssetState.Tagged);
        const taggedAssets = projectAssets
            .filter((asset) => asset.state === AssetState.Tagged);
        const nowAssets = projectAssets
            .filter((asset) => asset.id === project.lastVisitedAssetId);
        return (
            <ul>
                {/*<li title={strings.projectSettings.targetConnection.title}>*/}
                    {/*<i className="fas fa-download"></i>*/}
                    {/*<span className="metric-target-connection-name">{project.targetConnection.name}</span>*/}
                {/*</li>*/}
                <li title={interpolate(strings.projectMetrics.taggedAssets, { count: taggedAssets.length })}>
                    <i className="fas fa-tag"></i>
                    <span className="metric-tagged-asset-count">{taggedAssets.length}</span>
                </li>
                <li title={interpolate(strings.projectMetrics.visitedAssets, { count: visitedAssets.length })}>
                    <i className="fas fa-eye"></i>
                    <span className="metric-visited-asset-count">{visitedAssets.length}</span>
                </li>
                <li title={strings.common.displayName}>
                    <i className="fas fa-project-diagram"></i>
                    <span className="metric-source-connection-name">{project.name}</span>
                </li>
                <li title={strings.projectMetrics.currentAsset.name}>
                    <i className="fas fa-coffee"></i>
                    <span className="metric-source-connection-name">{
                        nowAssets.length > 0 ? decodeURIComponent(nowAssets[0].name) : ""
                    }</span>
                </li>
                <li title={strings.projectMetrics.currentAsset.size}>
                    <i className="fas fa-flushed"></i>
                    <span className="metric-source-connection-name">{
                        nowAssets.length > 0 ? `${nowAssets[0].size.width} x ${nowAssets[0].size.height}` : ""
                    }</span>
                </li>
            </ul>
        );
    }
}
