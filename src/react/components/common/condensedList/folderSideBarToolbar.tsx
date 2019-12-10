import React, { SyntheticEvent } from "react";
import { strings } from "../../../../common/strings";
/** Properties for tag input toolbar */
export interface IFolderSideBarToolbarProps {
    /** Function to call when add tags button is clicked */
    onAddFolder: () => void;
    onImportTaggedAssetsFolder: () => void;
}

interface IFolderSideBarToolbarItemProps {
    displayName: string;
    className: string;
    icon: string;
    handler: () => void;
    accelerators?: string[];
}

export default class FolderSideBarToolbar extends React.Component<IFolderSideBarToolbarProps> {
    public render() {
        return (
            <div className="condensed-list-header-toolbar">
                {
                    this.getToolbarItems().map((itemConfig) =>
                        <a title={itemConfig.displayName} key={itemConfig.displayName} className={`tag-input-toolbar-item ${itemConfig.className}`}
                            onClick={(e) => this.onToolbarItemClick(e, itemConfig)}>
                            <i className={`tag-input-toolbar-icon fas ${itemConfig.icon}`} />
                        </a>,
                    )
                }
            </div>
        );
    }

    private onToolbarItemClick = (e: SyntheticEvent, itemConfig: IFolderSideBarToolbarItemProps): void => {
        e.stopPropagation();
        itemConfig.handler();
    }

    private getToolbarItems = (): IFolderSideBarToolbarItemProps[] => {
        return [
            {
                displayName: strings.assetsFolderBar.addFolder,
                className: "plus",
                icon: "fa-plus-circle",
                handler: this.handleAdd,
            },
            {
                displayName: strings.assetsFolderBar.importAssets,
                className: "plus",
                icon: "fa-file-import",
                handler: this.handleImport,
            },
        ];
    }

    private handleAdd = () => {
        this.props.onAddFolder();
    }

    private handleImport = () => {
        this.props.onImportTaggedAssetsFolder();
    }
}
