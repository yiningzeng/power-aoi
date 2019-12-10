import shortid from "shortid";
import Guard from "../common/guard";
import {IConnection, IProject} from "../models/applicationState";
import { AssetProviderFactory } from "../providers/storage/assetProviderFactory";
import {IStartTestResults, IStartTrainResults, ITrainConfigResults} from "../providers/export/exportProvider";
import {IpcRendererProxy} from "../common/ipcRendererProxy";
/**
 * Functions required for a connection service
 * @member save - Save a connection
 */
export interface ITestService {
    testGetModel(project: IProject): Promise<IStartTestResults>;
}

/**
 * @name - Connection Service
 * @description - Functions for dealing with project connections
 */
export default class TestService implements ITestService {
    public async testGetModel(project: IProject): Promise<IStartTestResults> {
        Guard.null(project);
        return await IpcRendererProxy.send(`TestingSystem:testGetModel`, [project]);
    }
}
