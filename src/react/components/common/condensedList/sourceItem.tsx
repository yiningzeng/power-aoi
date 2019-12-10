import React from "react";

export default function SourceItem({ item, openDir, onClick, onDelete }) {
    const nameTemp = `${item.folderPath}`;
    let name = nameTemp.slice(nameTemp.lastIndexOf("\\") + 1);
    // console.log("name: windows" + name);
    name = name.slice(name.lastIndexOf("/") + 1);
    // console.log("name: linux" + name);
    return (
        <li className={openDir === item ? "editor-page-sidebar-tree-item" : ""}>
            <a onClick={onClick} title={nameTemp}>
                {/*<i className="fas fa-folder-open"></i>*/}
                { item === "已处理" ?
                    <i className="fa fa-archive"></i> :
                    openDir === item ? <i className="fas fa-folder-open"></i> : <i className="fa fa-folder"></i>
                }
                <span className="px-2">{name}</span>
                {item !== "已处理" &&
                <div className="float-right delete-btn" onClick={onDelete}><i className="fas fa-trash"></i></div>}
            </a>
        </li>
    );
}
