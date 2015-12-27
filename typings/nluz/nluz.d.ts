/// <reference path="../../typings/cordova/plugins/FileTransfer.d.ts" />

declare class DownloadItem {
    public id : string;
    public downloadId : string;
    public title: string;
    public url : string;
    public path : string;
    public filename : string;
    public progress : number;
    public downloadStatus : string;
    public errorCode : number;
    public transfer : FileTransfer;
    public status : string;
}