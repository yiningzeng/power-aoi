import React from "react";
import Form, { FormValidation, ISubmitEvent, IChangeEvent, Widget } from "react-jsonschema-form";
import { ITagsInputProps, TagEditorModal, TagsInput } from "vott-react";
import { addLocValues, strings } from "../../../../common/strings";
import {
    IConnection,
    IProject,
    ITag,
    IAppSettings,
    IProviderOptions,
    ISecureString
} from "../../../../models/applicationState";
import { StorageProviderFactory } from "../../../../providers/storage/storageProviderFactory";
import { ConnectionPickerWithRouter } from "../../common/connectionPicker/connectionPicker";
import { CustomField } from "../../common/customField/customField";
import CustomFieldTemplate from "../../common/customField/customFieldTemplate";
import { ISecurityTokenPickerProps, SecurityTokenPicker } from "../../common/securityTokenPicker/securityTokenPicker";
import "vott-react/dist/css/tagsInput.css";
import { IConnectionProviderPickerProps } from "../../common/connectionProviderPicker/connectionProviderPicker";
import LocalFolderPicker from "../../common/localFolderPicker/localFolderPicker";
import IConnectionActions, * as connectionActions from "../../../../redux/actions/connectionActions";
import {ILocalFileSystemProxyOptions} from "../../../../providers/storage/localFileSystemProxy";

// tslint:disable-next-line:no-var-requires
const formSchema = addLocValues(require("./projectForm.json"));
// tslint:disable-next-line:no-var-requires
const uiSchema = addLocValues(require("./projectForm.ui.json"));
// const okTag: ITag = {
//     name: "OK",
//     color: "#FFFFF0",
// };
/**
 * Required properties for Project Settings form
 * @member project - Current project to fill form
 * @member connections - Array of connections to use in project
 * @member onSubmit - Function to call on form submission
 * @member onCancel - Function to call on form cancellation
 */
export interface IProjectFormProps extends React.Props<ProjectForm> {
    project: IProject;
    connections: IConnection[];
    appSettings: IAppSettings;
    onSubmit: (project: IProject) => void;
    onChange?: (project: IProject) => void;
    onCancel?: () => void;
}

/**
 * Project Form State
 * @member classNames - Class names for HTML form element
 * @member formData - data containing details of project
 * @member formSchema - json schema of form
 * @member uiSchema - json UI schema of form
 */
export interface IProjectFormState {
    classNames: string[];
    formData: IProject;
    formSchema: any;
    uiSchema: any;
}

/**
 * @name - Project Form
 * @description - Form for editing or creating VoTT projects
 */
export default class ProjectForm extends React.Component<IProjectFormProps, IProjectFormState> {
    private widgets = {
        localFolderPicker: (LocalFolderPicker as any) as Widget,
    };

    private tagsInput: React.RefObject<TagsInput>;
    private tagEditorModal: React.RefObject<TagEditorModal>;

    constructor(props, context) {
        super(props, context);
        this.state = {
            classNames: ["needs-validation"],
            uiSchema: { ...uiSchema },
            formSchema: { ...formSchema },
            formData: {
                ...this.props.project,
            },
        };
        this.tagsInput = React.createRef<TagsInput>();
        this.tagEditorModal = React.createRef<TagEditorModal>();

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormCancel = this.onFormCancel.bind(this);
        this.onFormValidate = this.onFormValidate.bind(this);
        this.onTagShiftClick = this.onTagShiftClick.bind(this);
        this.onTagModalOk = this.onTagModalOk.bind(this);
    }
    /**
     * Updates state if project from properties has changed
     * @param prevProps - previously set properties
     */
    public componentDidUpdate(prevProps: IProjectFormProps) {
        if (prevProps.project !== this.props.project) {
            this.setState({
                formData: { ...this.props.project },
            });
        }
    }

    public render() {
        return (
            <Form
                className={this.state.classNames.join(" ")}
                showErrorList={false}
                liveValidate={true}
                noHtml5Validate={true}
                FieldTemplate={CustomFieldTemplate}
                validate={this.onFormValidate}
                fields={this.fields()}
                widgets={this.widgets}
                schema={this.state.formSchema}
                uiSchema={this.state.uiSchema}
                formData={this.state.formData}
                onChange={this.onFormChange}
                onSubmit={this.onFormSubmit}>
                <div>
                    <button className="btn btn-success mr-1" type="submit">{strings.projectSettings.save}</button>
                    <button className="btn btn-secondary btn-cancel"
                        type="button"
                        onClick={this.onFormCancel}>{strings.common.cancel}</button>
                </div>
                <TagEditorModal
                    ref={this.tagEditorModal}
                    onOk={this.onTagModalOk}

                    tagNameText={strings.tags.modal.name}
                    tagColorText={strings.tags.modal.color}
                    saveText={strings.common.save}
                    cancelText={strings.common.cancel}
                />
            </Form>
        );
    }

    private fields() {
        return {
            securityToken: CustomField<ISecurityTokenPickerProps>(SecurityTokenPicker, (props) => ({
                id: props.idSchema.$id,
                schema: props.schema,
                value: props.formData,
                securityTokens: this.props.appSettings.securityTokens,
                onChange: props.onChange,
            })),
            // sourceConnection: CustomField<IConnectionProviderPickerProps>(ConnectionPickerWithRouter, (props) => {
            //     return {
            //         id: props.idSchema.$id,
            //         value: props.formData,
            //         connections: this.props.connections,
            //         onChange: props.onChange,
            //     };
            // }),
            targetConnection: CustomField<IConnectionProviderPickerProps>(ConnectionPickerWithRouter, (props) => {
                const targetConnections = this.props.connections
                    .filter((connection) => StorageProviderFactory.isRegistered(connection.providerType));

                return {
                    id: props.idSchema.$id,
                    value: props.formData,
                    connections: targetConnections,
                    onChange: props.onChange,
                };
            }),
            tagsInput: CustomField<ITagsInputProps>(TagsInput, (props) => {
                return {
                    tags: props.formData,
                    onChange: props.onChange,
                    placeHolder: strings.tags.placeholder,
                    onShiftTagClick: this.onTagShiftClick,
                    ref: this.tagsInput,
                };
            }),
        };
    }

    private onTagShiftClick(tag: ITag) {
        this.tagEditorModal.current.open(tag);
    }

    private onTagModalOk(oldTag: ITag, newTag: ITag) {
        this.tagsInput.current.updateTag(oldTag, newTag);
        this.tagEditorModal.current.close();
    }

    private onFormValidate(project: IProject, errors: FormValidation) {
        // if (Object.keys(project.sourceConnection).length === 0) {
        //     errors.sourceConnection.addError("is a required property");
        // }
        //

        if (this.state.classNames.indexOf("was-validated") === -1) {
            this.setState({
                classNames: [...this.state.classNames, "was-validated"],
            });
            errors.name.addError("必填");
        }

        return errors;
    }

    private onFormChange = (changeEvent: IChangeEvent<IProject>) => {
        if (this.props.onChange) {
            this.props.onChange(changeEvent.formData);
        }
    }

    private onFormSubmit(args: ISubmitEvent<IProject>) {
        // 默认添加OK的标签
        // this.tagsInput.current.state.tags.push(okTag);
        // let temp: ITag[];
        // console.log("projectForm: args.formData " + JSON.stringify(args.formData));
        // if ( args.formData.tags === undefined || args.formData.tags.length === 0) {
        //     temp = [okTag];
        // }
        const provider: ILocalFileSystemProxyOptions = {
            folderPath: args.formData.targetConnection + "",
        };
        const target: IConnection = {
            id: new Date().getTime().toString(),
            name: new Date().getTime().toString(),
            providerType: "localFileSystemProxy",
            providerOptions: provider,
            providerOptionsOthers: [provider],
        };

        connectionActions.saveConnection(target);
        // connectionActions.loadConnection(target);
        const project: IProject = {
            ...args.formData,
            // tags: temp === undefined ? args.formData.tags : temp,
            targetConnection: target,
            sourceConnection: target,
        };

        console.log("projectForm: " + JSON.stringify(project));
        this.props.onSubmit(project);
    }

    private onFormCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }
}
