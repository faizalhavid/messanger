
type FileUploadStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
type AllowedFileType = 'image' | 'video' | 'document' | 'audio';

export type AllowedFile = {
    format: AllowedFileType;
    maxSize: number; // in bytes
}

export type ImageType = {
    url: string;
    width: number;
    height: number;
    format: AllowedFile;
};

export type FileType = {
    name: string;
    url: string;
    size: number; // in bytes
    type: AllowedFile;
    createdAt: Date;
};
