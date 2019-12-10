import React, { MouseEvent } from "react";
import { ITag } from "../../../../models/applicationState";
import { SketchPicker } from "react-color";
import {Button, Popover} from "@material-ui/core";

export enum TagEditMode {
    Color = "color",
    Name = "name",
}

export interface ITagClickProps {
    ctrlKey?: boolean;
    altKey?: boolean;
    clickedColor?: boolean;
}

/**
 * Properties for tag input item
 */
export interface ITagInputItemProps {
    /** Tag represented by item */
    tag: ITag;
    /** Index of tag within tags array */
    index: number;
    /** Tag is currently being edited */
    isBeingEdited: boolean;
    /** Tag is currently locked for application */
    isLocked: boolean;
    /** Tag is currently selected */
    isSelected: boolean;
    /** Tag is currently applied to one of the selected regions */
    appliedToSelectedRegions: boolean;
    /** Function to call upon clicking item */
    onClick: (tag: ITag, props: ITagClickProps) => void;
    /** Apply updates to tag */
    onChange: (oldTag: ITag, newTag: ITag) => void;
}

export interface ITagInputItemState {
    /** Tag is currently being edited */
    isBeingEdited: boolean;
    /** Tag is currently locked for application */
    isLocked: boolean;
    /** Mode of tag editing (text or color) */
    tagEditMode: TagEditMode;
    showColorPicker: boolean;
    anchorEl: Element;
}

export default class TagInputItem extends React.Component<ITagInputItemProps, ITagInputItemState> {
    public state: ITagInputItemState = {
        isBeingEdited: false,
        isLocked: false,
        tagEditMode: null,
        showColorPicker: false,
        anchorEl: null,
    };

    public render() {
        const style: any = {
            background: this.props.tag.color,
        };
        return (
            <div className={"tag-item-block"}>
                {
                    this.props.tag &&
                    <li className={this.getItemClassName()} style={style}>
                        {/*<div*/}
                        {/*    className={`tag-color`}*/}
                        {/*    onClick={this.onColorClick}>*/}
                        {/*</div>*/}
                        <div>
                            {/*<i className="fas fa-fill-drip"></i>*/}
                            <a className="fas fa-quidditch" onClick={((event) => {
                                this.setState({
                                    ...this.state,
                                    showColorPicker: true,
                                    anchorEl: event.currentTarget,
                                });
                            })}></a>
                            <Popover
                                id={"colorrr"}
                                open={this.state.showColorPicker}
                                anchorEl={this.state.anchorEl}
                                onClose={() => this.setState({
                                    ...this.state,
                                    showColorPicker: false,
                                })}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "center",
                                }}
                            >
                                <SketchPicker
                                    disableAlpha={true}
                                    color={this.props.tag.color}
                                    onChange={ (color, event) => {
                                        console.log(`更改颜色: ${JSON.stringify(color)}`);
                                        this.props.onChange(this.props.tag, {
                                            ...this.props.tag,
                                            color: color.hex,
                                        });
                                        // this.setState({
                                        //     ...this.state,
                                        //     showColorPicker: false,
                                        // });
                                    }} />
                                <Button style={{width: "100%"}} onClick={(e) =>
                                    this.setState({
                                    ...this.state,
                                    showColorPicker: false,
                                    })
                                } color="primary" >
                                    关  闭
                                </Button>
                            </Popover>
                        </div>
                        <div
                            className={"tag-content"}
                            onClick={this.onNameClick}>
                            {this.getTagContent()}
                        </div>
                        {
                            this.state.isLocked &&
                            <div></div>
                        }
                    </li>
                }
            </div>
        );
    }

    public componentDidUpdate(prevProps: ITagInputItemProps) {
        if (prevProps.isBeingEdited !== this.props.isBeingEdited) {
            this.setState({
                isBeingEdited: this.props.isBeingEdited,
            });
        }

        if (prevProps.isLocked !== this.props.isLocked) {
            this.setState({
                isLocked: this.props.isLocked,
            });
        }
    }

    private onColorClick = (e: MouseEvent) => {
        e.stopPropagation();
        const ctrlKey = e.ctrlKey || e.metaKey;
        const altKey = e.altKey;
        this.setState({
            tagEditMode: TagEditMode.Color,
        }, () => this.props.onClick(this.props.tag, { ctrlKey, altKey, clickedColor: true }));
    }

    private onNameClick = (e: MouseEvent) => {
        e.stopPropagation();

        const ctrlKey = e.ctrlKey || e.metaKey;
        const altKey = e.altKey;
        this.setState({
            tagEditMode: TagEditMode.Name,
        }, () => this.props.onClick(this.props.tag, { ctrlKey, altKey }));
    }

    private getItemClassName = () => {
        const classNames = ["tag-item"];
        if (this.props.isSelected) {
            classNames.push("tag-item-selected");
        }
        if (this.props.appliedToSelectedRegions) {
            classNames.push("tag-item-applied");
        }
        return classNames.join(" ");
    }

    private getTagContent = () => {
        const displayIndex = this.getDisplayIndex();
        return (
            <div className={"tag-name-container"}>
                <div className="tag-name-body">
                    {
                        (this.state.isBeingEdited && this.state.tagEditMode === TagEditMode.Name)
                            ?
                            <input
                                className={`tag-name-editor ${this.getContentClassName()}`}
                                type="text"
                                defaultValue={this.props.tag.name}
                                onKeyDown={(e) => this.handleNameEdit(e)}
                                autoFocus={true}
                            />
                            :
                            <span title={this.props.tag.name} className={this.getContentClassName()}>
                                {this.props.tag.name}
                            </span>
                    }
                </div>
                <div className="tag-lock-icon">
                    {this.props.isLocked &&
                        <i className="fas fa-lock" />
                    }
                </div>
                <div className={"tag-index"}>
                    {(displayIndex !== null) && <span>[{displayIndex}]</span>}
                </div>
            </div>
        );
    }

    private handleNameEdit = (e) => {
        if (e.key === "Enter") {
            const newTagName = e.target.value;
            this.props.onChange(this.props.tag, {
                ...this.props.tag,
                name: newTagName,
            });
        } else if (e.key === "Escape") {
            this.setState({
                isBeingEdited: false,
            });
        }
    }

    private getContentClassName = () => {
        const classNames = ["tag-name-text px-2"];
        if (this.state.isBeingEdited && this.state.tagEditMode === TagEditMode.Color) {
            classNames.push(" tag-color-edit");
        }
        return classNames.join(" ");
    }

    private getDisplayIndex = () => {
        const index = this.props.index;
        const displayIndex = (index === 9) ? 0 : index + 1;
        return (displayIndex < 10) ? displayIndex : null;
    }
}
