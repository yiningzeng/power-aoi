import shortid from "shortid";
import Guard from "../common/guard";
import {IConnection, IProject} from "../models/applicationState";
import { AssetProviderFactory } from "../providers/storage/assetProviderFactory";
import {IStartTrainResults, ITrainConfigResults} from "../providers/export/exportProvider";
import {IpcRendererProxy} from "../common/ipcRendererProxy";
/**
 * Functions required for a connection service
 * @member save - Save a connection
 */
export interface ITrainService {
    trainPackageProject(project: IProject): Promise<ITrainConfigResults>;
    trainUploadProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults>;
    trainAddQueueProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults>;
    test(): void;
}

/**
 * @name - Connection Service
 * @description - Functions for dealing with project connections
 */
export default class TrainService implements ITrainService {
    /**
     * Save a connection
     * @param connection - Connection to save
     */

    public async trainPackageProject(project: IProject): Promise<IStartTrainResults> {
        Guard.null(project);
        return await IpcRendererProxy.send(`TrainingSystem:trainPackageProject`, [project]);
    }

    public async trainUploadProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        Guard.null(project);
        return await IpcRendererProxy.send(`TrainingSystem:trainUploadProject`, [project, source]);
    }

    public async trainAddQueueProject(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        Guard.null(project);
        return await IpcRendererProxy.send(`TrainingSystem:trainAddQueueProject`, [project, source]);
    }
    public async trainAddSql(project: IProject, source: IStartTrainResults): Promise<IStartTrainResults> {
        Guard.null(project);
        return await IpcRendererProxy.send(`TrainingSystem:trainAddSql`, [project, source]);
    }
    public async test(): Promise<void> {
        console.log("进来了");

        // cv.readImage("/home/baymin/图片/1964668478.jpg", function (err, im) {
        //     // im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
        //     //     for (var i=0;i<faces.length; i++){
        //     //         var x = faces[i]
        //     //         im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
        //     //     }
        //     //     im.save("/home/baymin/图片/out.jpg");
        //     // });
        //     im.save("/home/baymin/图片/out.jpg");
        // });
        await IpcRendererProxy.send("FILE_WATCH");
        await IpcRendererProxy.send(`TrainingSystem:opencvTest`);
    }
}
