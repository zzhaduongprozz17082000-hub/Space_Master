import firebase from 'firebase/compat/app';

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: firebase.firestore.Timestamp | null;
    type: 'folder';
    ownerId: string;
    path: string;
}

export interface AppFile {
    id:string;
    name: string;
    parentId: string | null;
    createdAt: firebase.firestore.Timestamp | null;
    type: 'file';
    ownerId: string;
    url: string;
    path: string;
    size: number;
    fileType: string;
}

export type Item = Folder | AppFile;

export interface Share {
    id: string;
    permission: 'view' | 'edit';
    sharedWithEmail: string;
    itemId: string;
    itemType: 'file' | 'folder';
    ownerId: string;
    sharedWithId: string;
}

export interface Path {
    id: string | null;
    name: string;
}
