import {DBModels} from "../../interface";


export abstract class DbConnectionManager {
    // get connection from database
    abstract getConnection(): Promise<DBModels>
}
