import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";

export interface IDraggableDialogProps {
    title?: string;
    content?: string;
    disableBackdropClick?: boolean;
    disableEscapeKeyDown?: boolean;
    fullWidth?: boolean;
    onDone?: () => void;
    onCancel?: () => void;
}

export interface IDraggableDialogState {
    open: boolean;
    done: boolean;
    change: boolean;
    title?: string;
    content?: string;
    showCancel?: boolean;
}

function PaperComponent(props: PaperProps) {
    return (
        <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
    </Draggable>
);
}

export default class DraggableDialog extends React.Component<IDraggableDialogProps, IDraggableDialogState> {

    constructor(props, context) {
        super(props, context);

        this.state = {
            open: false,
            done: false,
            change: false,
        };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        // this.messageBox = React.createRef<MessageBox>();
        //
        // this.open = this.open.bind(this);
        // this.close = this.close.bind(this);
        // this.onConfirmClick = this.onConfirmClick.bind(this);
        // this.onCancelClick = this.onCancelClick.bind(this);
    }
    public render() {
        return (
            <div>
                <Dialog
                    fullWidth={this.props.fullWidth}
                    disableBackdropClick={this.props.disableBackdropClick}
                    disableEscapeKeyDown={this.props.disableEscapeKeyDown}
                    open={this.state.open}
                    onClose={this.close}
                    PaperComponent={PaperComponent}
                    aria-labelledby="draggable-dialog-title"
                >
                    <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
                        {this.state.change ?
                            this.state.title === undefined ? "处理完成" : this.state.title :
                            this.props.title === undefined ? "请耐心等待" : this.props.title}
                    </DialogTitle>
                    <DialogContent>
                        {this.state.done ? undefined : <LinearProgress />}
                        <DialogContentText style={{marginTop: "20px"}}>
                            {this.state.change ?
                                this.state.content === undefined ? "已经处理完成，确定返回上一页" : this.state.content :
                                this.props.content === undefined ? "正在处理" : this.props.content}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {this.state.done ? <Button onClick={(e) => this.props.onDone()} color="primary" >
                            确定
                        </Button> : undefined}
                        {this.state.showCancel ? <Button onClick={(e) => this.props.onCancel()} color="primary" >
                            取消
                        </Button> : undefined}
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    public open = () => {
        this.setState({open: true, done: false, change: false});
    }

    public change = (title, content, done = false, showCancel= false, change= true) => {
        this.setState({
            change,
            showCancel,
            done,
            title,
            content,
        });
    }

    public close = () => {
        this.setState({open: false});
    }
}
