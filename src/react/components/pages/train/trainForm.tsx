import React from "react";
import _ from "lodash";
import Form, { Widget, FormValidation, IChangeEvent, ISubmitEvent } from "react-jsonschema-form";
import { getDefaultFormState } from "react-jsonschema-form/lib/utils";
import { addLocValues, strings } from "../../../../common/strings";
import { ITrainFormat} from "../../../../models/applicationState";
import { TrainProviderFactory } from "../../../../providers/trainSettings/trainProviderFactory";
import TrainProviderPicker from "../../common/trainProviderPicker/trainProviderPicker";
import CustomFieldTemplate from "../../common/customField/customFieldTemplate";
import ExternalPicker from "../../common/externalPicker/externalPicker";
import { ProtectedInput } from "../../common/protectedInput/protectedInput";
import Checkbox from "rc-checkbox";
import "rc-checkbox/assets/index.css";
import { CustomWidget } from "../../common/customField/customField";
import { Slider } from "../../common/slider/slider";

// tslint:disable-next-line:no-var-requires
const formSchema = addLocValues(require("./trainForm.json"));
// tslint:disable-next-line:no-var-requires
const uiSchema = addLocValues(require("./trainForm.ui.json"));

/**
 * Properties for Export Form
 * @member settings - Current settings for Export
 * @member onSubmit - Function to call on form submission
 * @member onCancel - Function to call on form cancellation
 */
export interface ITrainFormProps extends React.Props<TrainForm> {
    settings: ITrainFormat;
    onSubmit: (exportFormat: ITrainFormat) => void;
    onCancel?: () => void;
}

/**
 * State for Export Form
 * @member classNames - Class names for HTML form component
 * @member providerName - Name of export provider
 * @member formSchema - JSON Form Schema for export form
 * @member uiSchema - JSON Form UI Schema for export form
 * @member formData - Current state of form data as Export Format
 */
export interface ITrainFormState {
    classNames: string[];
    providerName: string;
    formSchema: any;
    uiSchema: any;
    formData: ITrainFormat;
}

/**
 * @name - Export Form
 * @description - Form to view/edit settings for exporting of project
 */
export default class TrainForm extends React.Component<ITrainFormProps, ITrainFormState> {
    public state: ITrainFormState = {
        classNames: ["needs-validation"],
        providerName: this.props.settings ? this.props.settings.providerType : null,
        formSchema: { ...formSchema },
        uiSchema: { ...uiSchema },
        formData: this.props.settings,
    };

    private widgets = {
        externalPicker: (ExternalPicker as any) as Widget,
        exportProviderPicker: (TrainProviderPicker as any) as Widget,
        protectedInput: (ProtectedInput as any) as Widget,
        slider: (Slider as any) as Widget,
        checkbox: CustomWidget(Checkbox, (props) => ({
            checked: props.value,
            onChange: (value) => props.onChange(value.target.checked),
            disabled: props.disabled,
        })),
    };

    public componentDidMount() {
        console.log("train+" + JSON.stringify(this.props));
        if (this.props.settings) {
            this.bindForm(this.props.settings);
        }
    }

    public componentDidUpdate(prevProps: ITrainFormProps) {
        console.log("train+2" + JSON.stringify(prevProps));
        if (prevProps.settings !== this.props.settings) {
            this.bindForm(this.props.settings);
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
                widgets={this.widgets}
                formContext={this.state.formData}
                schema={this.state.formSchema}
                uiSchema={this.state.uiSchema}
                formData={this.state.formData}
                onChange={this.onFormChange}
                onSubmit={this.onFormSubmit}>
                <div>
                    <button className="btn btn-success mr-1" type="submit">{strings.export.saveSettings}</button>
                    <button className="btn btn-secondary btn-cancel"
                        type="button"
                        onClick={this.onFormCancel}>{strings.common.cancel}</button>
                </div>
            </Form>
        );
    }

    private onFormChange = (args: IChangeEvent<ITrainFormat>) => {
        const providerType = args.formData.providerType;

        if (providerType !== this.state.providerName) {
            this.bindForm(args.formData, true);
        } else {
            this.bindForm(args.formData, false);
        }
    }

    private onFormValidate = (exportFormat: ITrainFormat, errors: FormValidation): FormValidation => {
        if (this.state.classNames.indexOf("was-validated") === -1) {
            this.setState({
                classNames: [...this.state.classNames, "was-validated"],
            });
        }

        return errors;
    }

    private onFormSubmit = (args: ISubmitEvent<ITrainFormat>): void => {
        this.props.onSubmit(args.formData);
    }

    private onFormCancel = (): void => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    private bindForm = (exportFormat: ITrainFormat, resetProviderOptions: boolean = false): void => {
        // If no provider type was specified on bind, pick the default provider
        const providerType = (exportFormat && exportFormat.providerType)
            ? exportFormat.providerType
            : TrainProviderFactory.defaultProvider.name;

        console.log("bindForm:" + providerType);
        let newFormSchema: any = this.state.formSchema;
        let newUiSchema: any = this.state.uiSchema;

        if (providerType) {
            const providerSchema = addLocValues(require(`../../../../providers/trainSettings/${providerType}.json`));
            const providerUiSchema = require(`../../../../providers/trainSettings/${providerType}.ui.json`);

            newFormSchema = { ...formSchema };
            newFormSchema.properties["providerOptions"] = providerSchema;

            newUiSchema = { ...uiSchema };
            newUiSchema["providerOptions"] = providerUiSchema;
        }

        const formData = { ...exportFormat };
        const providerOptions = resetProviderOptions ? {} : exportFormat.providerOptions;
        const providerDefaults = getDefaultFormState(newFormSchema.properties.providerOptions, providerOptions);

        formData.providerType = providerType; // 这里要改
        // formData.providerTrainOptions = providerDefaults as IExportProviderOptions;

        this.setState({
            providerName: providerType,
            formSchema: newFormSchema,
            uiSchema: newUiSchema,
            formData,
        });
    }
}
