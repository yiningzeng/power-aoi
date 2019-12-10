import { ToolbarItem } from "./toolbarItem";
import { toast } from "react-toastify";

/**
 * @name - Export Project
 * @description - Toolbar item to export current project
 */
export class ExportProject extends ToolbarItem {
    protected onItemClick = async () => {
        const infoId = toast.info(`Started export for ${this.props.project.name}...`, { autoClose: false });
        const exportTrain = await this.props.actions.exportTrainConfig(this.props.project);
        if (!exportTrain || exportTrain ) {
            toast.success(`导出训练配置文件成功`);
        }
        const results = await this.props.actions.exportProject(this.props.project);
        toast.dismiss(infoId);

        if (!results || (results && results.errors.length === 0)) {
            toast.success(`Export completed successfully!`);
        } else if (results && results.errors.length > 0) {
            toast.warn(`Successfully exported ${results.completed.length}/${results.count} assets`);
        }
    }
}
