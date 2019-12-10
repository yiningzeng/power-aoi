import {
    app, ipcMain, BrowserWindow, BrowserWindowConstructorOptions,
    Menu, MenuItemConstructorOptions,
} from "electron";
import { IpcMainProxy } from "./common/ipcMainProxy";
import LocalFileSystem from "./providers/storage/localFileSystem";
import TrainingSystem from "./providers/training/trainingSystem";
import TestingSystem from "./providers/testing/testingSystem";
import log from "electron-log";
import { updater } from "update-electron-app";
import { autoUpdater } from "electron-updater";
import chokidar from "chokidar";
// import { remote } from "electron";
//
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;
let ipcMainProxy: IpcMainProxy;

// const feedUrl = `http://192.168.31.157`; // 更新包位置

log.transports.file.level = "info";
autoUpdater.logger = log;
// autoUpdater.setFeedURL("http://192.168.31.157");
// tslint:disable-next-line:no-var-requires
const Sequelize = require("sequelize");
const Model = Sequelize.Model;
class UserTest extends Model {}

function createWindow() {
    // autoUpdater.setFeedURL(feedUrl);
    // region update
    autoUpdater.on("checking-for-update", () => {
        log.info("Checking for update...");
    });
    autoUpdater.on("update-available", (info) => {
        log.info("Update available.");
    });
    autoUpdater.on("update-not-available", (info) => {
        log.info("Update not available.");
    });
    autoUpdater.on("error", (err) => {
        log.error("Error in auto-updater. " + err);
    });
    autoUpdater.on("download-progress", (progressObj) => {
        let logMessage = "Download speed: " + progressObj.bytesPerSecond;
        logMessage = logMessage + " - Downloaded " + progressObj.percent + "%";
        logMessage = logMessage + " (" + progressObj.transferred + "/" + progressObj.total + ")";
        log.info(logMessage);
    });
    autoUpdater.on("update-downloaded", (info) => {
        log.info("Update downloaded");
        autoUpdater.quitAndInstall();
    });
    // endregion
    autoUpdater.checkForUpdates();

    app.getGPUInfo("complete").then((result) => {
        log.info(`获取GPU信息 ${JSON.stringify(result)}`);
    });
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 1024,
        height: 768,
        frame: process.platform === "linux",
        titleBarStyle: "hidden",
        backgroundColor: "#272B30",
        show: false,
        webPreferences: {
            contextIsolation: false,
            // nativeWindowOpen: true,
            // nodeIntegrationInWorker: true,
            nodeIntegration: true,
            plugins: true,
            webSecurity: true,
            webviewTag: true,
            // preload: __dirname + "/preload.js",
        },
    };

    // const mat = cv.imread("/home/baymin/图片/1964668478.jpg");
    // cv.imshow("a window name", mat);
    // console.log(mat);
    // cv.waitKey();
    const staticUrl = process.env.ELECTRON_START_URL || `file:///${__dirname}/index.html`;
    if (process.env.ELECTRON_START_URL) {
        windowOptions.webPreferences = {
            ...windowOptions.webPreferences,
            webSecurity: false,
        };
    }

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(staticUrl);
    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Provides a more graceful experience and eliminates the white screen on load
    // This event fires after the app first render
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    registerContextMenu(mainWindow);

    ipcMainProxy = new IpcMainProxy(ipcMain, mainWindow);
    ipcMainProxy.register("RELOAD_APP", onReloadApp);
    ipcMainProxy.register("FILE_WATCH", onFileWatch);
    ipcMainProxy.register("TOGGLE_DEV_TOOLS", onToggleDevTools);
    ipcMainProxy.registerProxy("TrainingSystem", new TrainingSystem(mainWindow));
    ipcMainProxy.registerProxy("TestingSystem", new TestingSystem(mainWindow));
    const localFileSystem = new LocalFileSystem(mainWindow);
    ipcMainProxy.registerProxy("LocalFileSystem", localFileSystem);

    try {
        // autoUpdater.checkForUpdates().then((result) => {
        //     log.info(`我检查了更新${autoUpdater.getFeedURL()}`);
        // });
        autoUpdater.checkForUpdatesAndNotify().then((() => {
            log.info(`我检查了更新${autoUpdater.getFeedURL()}`);
        }));

// 方法2: 传递连接 URI
        const sequelize = new Sequelize("mariadb://root:root@192.168.31.75:3306/aoi");
        sequelize
            .authenticate()
            .then(() => {
                log.info("Connection has been established successfully.");

                UserTest.init({
                    // 属性
                    firstName: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    lastName: {
                        type: Sequelize.STRING,
                        // allowNull 默认为 true
                    },
                }, {
                    sequelize,
                    modelName: "user_test",
                    // 参数
                });
            })
            .catch((err) => {
                log.error("Unable to connect to the database:", err);
            });
    } catch (e) {
        log.error(e);
    }

}

function onFileWatch() {
    chokidar.watch("/home/baymin/daily-work/test/aa/",
        { ignored: /(^|[\/\\])\..txt/, persistent: true}).on("all", (event, path) => {
        console.log(event, path);
        if (event === "add") {
            mainWindow.webContents.send("FILE_WATCH", path);
        }

    });
    return true;
}

function onReloadApp() {
    mainWindow.reload();
    return true;
}

function onToggleDevTools() {
    mainWindow.webContents.toggleDevTools();
}

/**
 * Adds standard cut/copy/paste/etc context menu comments when right clicking input elements
 * @param browserWindow The browser window to apply the context-menu items
 */
function registerContextMenu(browserWindow: BrowserWindow): void {
    const selectionMenu = Menu.buildFromTemplate([
        { role: "copy", accelerator: "CmdOrCtrl+C" },
        { type: "separator" },
    ]);

    const inputMenu = Menu.buildFromTemplate([
        { role: "undo", accelerator: "CmdOrCtrl+Z" },
        { role: "redo", accelerator: "CmdOrCtrl+Shift+Z" },
        { type: "separator" },
        { role: "cut", accelerator: "CmdOrCtrl+X" },
        { role: "copy", accelerator: "CmdOrCtrl+C" },
        { role: "paste", accelerator: "CmdOrCtrl+V" },
        { type: "separator" },
        { role: "minimize"},
        { role: "close"},
    ]);

    browserWindow.webContents.on("context-menu", (e, props) => {
        const { selectionText, isEditable } = props;
        if (isEditable) {
            inputMenu.popup({
                window: browserWindow,
            });
        } else if (selectionText && selectionText.trim() !== "") {
            selectionMenu.popup({
                window: browserWindow,
            });
        }
    });

    const menuItems: MenuItemConstructorOptions[] = [
        {
            label: "File", submenu: [
                { role: "quit" },
            ],
        },
        { role: "editMenu" },
        {
            label: "View", submenu: [
                { role: "reload" },
                { type: "separator" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
            ],
        },
        { role: "windowMenu" },
    ];
    const menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);
}
app.commandLine.appendSwitch("--disable-http-cache");
// 关闭 Console 安全警告
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
