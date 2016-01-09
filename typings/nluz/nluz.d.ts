/// <reference path="../../typings/cordova/plugins/FileTransfer.d.ts" />

declare class DownloadItem {
    public id : string;
    public title: string;
    public url : string;
    public path : string;
    public filename : string;
    public progress : number;
    public statusDescription : string;
    public errorCode : number;
    public transfer : FileTransfer;
    public statusKey : string;
}

declare class AudioBook {
    public id : string;
    public title : string;
    public statusKey : string;
}