import { ToolbarItem } from "./toolbarItem";
import { toast } from "react-toastify";

/**
 * @name - Save Project
 * @description - Toolbar item to save current project
 */
export class SaveProject extends ToolbarItem {
    protected onItemClick = async () => {
        try {
            await this.props.actions.saveProject(this.props.project);
            toast.success(`${this.props.project.name} 保存成功!`);
        } catch (e) {
            toast.error(`保存 ${this.props.project.name} 失败`);
        }
    }
}
