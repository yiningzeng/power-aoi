import { BrowserWindow, dialog } from "electron";
import fs from "fs";
import ftp from "ftp";
import got from "got";
import archiver from "archiver";
import FormData from "form-data";
// const Client = require("ftp");
import path from "path";
import {IProject} from "../../../models/applicationState";
import child_process from "child_process";
import has = Reflect.has;
import {IStartTestResults, IStartTrainResults} from "../../../providers/export/exportProvider";
import Guard from "../../../common/guard";
const exec = child_process.exec;
// 任何你期望执行的cmd命令，ls都可以

// 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
// 子进程名称
let workerProcess;
export default class TestingSystem {

    constructor(private browserWindow: BrowserWindow) { }
    public testGetModel(project: IProject): Promise<IStartTestResults> {
        return new Promise<IStartTestResults>((resolve, reject) => {
            Guard.null(project);
            console.log("fuckckckclc");
            let res: IStartTestResults = {
                success: false,
                msg: "null",
            };
            const config = {
                host: "192.168.31.75", // project.trainFormat.ip,
                user: "ftpicubic",
                password: "ftpicubic-123",
            };
            const c = new ftp();
            c.on("ready", () => {
                console.log("ready成功");
                c.list("韵升彩色8-28龙哥那边整合的所有数据-增加曾伟数据/backup/", false, (err, list) => {
                    if (err) {
                        res = {...res, msg: "Ftp获取失败"};
                        return res;
                    }
                    res = {
                        success: true,
                        msg: "获取列表成功",
                        list,
                    };
                    // for (const item of list) {
                    //     console.log(item);
                    // }
                    // c.end();
                    resolve(res);
                });
            });
            // connect to localhost:21 as anonymous
            c.on("error", (err) => {
                console.log(err);
                res = {...res, msg: "Ftp获取失败"};
                resolve(res);
            });
            c.connect(config);
        });
    }

    public trainUploadProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        return new Promise<IStartTrainResults>((resolve, reject) => {
            Guard.null(project);
            Guard.null(source);
            let res: IStartTrainResults = {
                success: false,
                msg: "null",
            };
            const config = {
                host: project.trainFormat.ip,
                user: "ftpicubic",
                password: "ftpicubic-123",
            };
            const c = new ftp();
            c.on("ready", () => {
                c.put(source.tarPath, source.tarName, (err) => {
                    if (err) {
                        res = {...res, msg: "Ftp上传失败"};
                        return res;
                    }
                    c.end();
                    console.log("上传成功");
                    res = {
                        ...res,
                        success: true,
                        msg: `上传成功`,
                    };
                    resolve(res);

                    const packageInfo = {
                        projectId: project.id,
                        projectName: project.name,
                        packageDir: source.tarBaseName,
                        packageName: source.tarName,
                    };
                    const trainInfo = {
                        projectId: project.id,
                        projectName: project.name,
                        assetsDir: source.tarBaseName,
                        assetsType: project.exportFormat.providerType,
                        ...project.trainFormat,
                    };
                    // http://www.squaremobius.net/amqp.node/channel_api.html api文档
                    // rabbitmq
                    const trainExchange = "ai.train.topic";
                    const packageExchange = "ai.package.topic";
                    const amqplib = require("amqplib")
                        .connect(`amqp://baymin:baymin1024@${project.trainFormat.ip}:5672`);
                    // Publisher
                    amqplib.then((conn) => {
                        return conn.createChannel();
                    }).then((ch) => {
                        ch.publish(packageExchange,
                            `package.upload-done.${project.name}.${project.trainFormat.providerType}`,
                            Buffer.from(JSON.stringify(packageInfo)));
                        ch.publish(trainExchange,
                            `train.start.${project.name}.${project.trainFormat.providerType}`,
                            Buffer.from(JSON.stringify(trainInfo)));
                    }).catch(console.warn);
                });
            });
            // connect to localhost:21 as anonymous
            c.on("error", (err) => {
                res = {...res, msg: "Ftp上传失败"};
                resolve(res);
            });
            c.connect(config);
        });
    }

    public trainAddQueueProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        return new Promise<IStartTrainResults>((resolve, reject) => {
            let res: IStartTrainResults = {
                success: false,
                msg: "null",
            };
            Guard.null(project);
            Guard.null(source);
            const packageInfo = {
                projectId: project.id,
                projectName: project.name,
                packageDir: source.tarBaseName,
                packageName: source.tarName,
            };
            const trainInfo = {
                projectId: project.id,
                projectName: project.name,
                assetsDir: source.tarBaseName,
                assetsType: project.exportFormat.providerType,
                ...project.trainFormat,
            };
            const trainExchange = "ai.train.topic";
            const packageExchange = "ai.package.topic";
            const amqplib = require("amqplib")
                .connect(`amqp://baymin:baymin1024@${project.trainFormat.ip}:5672`);
            // Publisher
            amqplib.then((conn) => {
                return conn.createChannel();
            }).then((ch) => {
                ch.publish(packageExchange,
                    `package.upload-done.${project.name}.${project.trainFormat.providerType}`,
                    Buffer.from(JSON.stringify(packageInfo)));
                ch.publish(trainExchange,
                    `train.start.${project.name}.${project.trainFormat.providerType}`,
                    Buffer.from(JSON.stringify(trainInfo)));
                ch.close();
                res = {
                    ...res,
                    success: true,
                    msg: `成功加入训练队列`,
                };
                resolve(res);
            }).catch((err) => {
                res = {
                    ...res,
                    success: false,
                    msg: `加入训练队列失败，请咨询开发人员`,
                };
                resolve(res);
            });

            let win = new BrowserWindow({ width: 1800, height: 1000, show: false });
            win.on("closed", () => {
                win = null;
            });
            win.loadURL(`http://${project.trainFormat.ip}`);
            win.show();
        });
    }

    public trainAddSql(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        return new Promise<IStartTrainResults>((resolve, reject) => {
            let res: IStartTrainResults = {
                success: false,
                msg: "null",
            };
            const packageInfo = {
                projectId: project.id,
                projectName: project.name,
                packageDir: source.tarBaseName,
                packageName: source.tarName,
            };
            got("http://localhost:18888/power-ai-train", {
                body: packageInfo,
                method: "POST",
                json: true,
            }).then((response) => {
                if (response.res === "ok") {
                    res = {
                        ...res,
                        success: true,
                        msg: `成功加入训练队列`,
                    };
                }
                console.log(response.body);
            }).catch((error) => {
                res = {
                    ...res,
                    success: false,
                    msg: ``,
                };
            });
            resolve(res);
        });
    }
    /**
     * Gets the node file system stats for the specified path
     * @param  {string} path
     * @returns {Promise} Resolved path and stats
     */
    private getStats(path: string): Promise<{ path: string, stats: fs.Stats }> {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats: fs.Stats) => {
                if (err) {
                    reject(err);
                }

                resolve({
                    path,
                    stats,
                });
            });
        });
    }
}
