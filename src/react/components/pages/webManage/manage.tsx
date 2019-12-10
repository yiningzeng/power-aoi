import React from "react";
import { connect } from "react-redux";
import { Route, RouteComponentProps } from "react-router-dom";
import { bindActionCreators } from "redux";
import { strings, interpolate } from "../../../../common/strings";
import { IApplicationState, IConnection } from "../../../../models/applicationState";
import IConnectionActions, * as connectionActions from "../../../../redux/actions/connectionActions";
import CondensedList from "../../common/condensedList/condensedList";
import Iframe from "react-iframe";
import { toast } from "react-toastify";

/**
 * Page for viewing/editing connections
 */
export default class Manage extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    public async componentDidMount() {

    }

    public render() {
        return (
            <div style={{height: "100%", width: "100%"}}>
                <Iframe url="http://192.168.31.75"
                        width="100%"
                        height="100%"
                        id="myId"
                        className="myClassname"
                        position="relative"/>
            </div>
        );
    }
}
