export interface FileType {
    mimeType: string;
    [key: string]: any;
}

export interface FormType {
    title: string;
    thumbnail: FileType;
    video: FileType;
    prompt: string;
    userId: string;
}
