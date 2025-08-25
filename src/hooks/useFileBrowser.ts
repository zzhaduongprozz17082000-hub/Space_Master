import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { firestore } from '../firebase';
import { Folder, AppFile } from '../types';

type ViewType = 'my-drive' | 'shared-with-me';

export const useFileBrowser = (user: firebase.User | null, currentView: ViewType, currentFolderId: string | null) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<AppFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setFiles([]);
        setFolders([]);

        const cleanupFunctions: (() => void)[] = [];

        const fetchData = async () => {
            if (currentView === 'my-drive') {
                const foldersQuery = firestore.collection('folders')
                    .where('ownerId', '==', user.uid)
                    .where('parentId', '==', currentFolderId)
                    .orderBy('createdAt', 'desc');

                const unsubscribeFolders = foldersQuery.onSnapshot(snapshot => {
                    const userFolders = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Folder));
                    setFolders(userFolders);
                    setLoading(false);
                }, err => { console.error(err); setLoading(false); });

                const filesQuery = firestore.collection('files')
                    .where('ownerId', '==', user.uid)
                    .where('parentId', '==', currentFolderId)
                    .orderBy('createdAt', 'desc');

                const unsubscribeFiles = filesQuery.onSnapshot(snapshot => {
                    const userFiles = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as AppFile));
                    setFiles(userFiles);
                    setLoading(false);
                }, err => { console.error(err); setLoading(false); });
                
                cleanupFunctions.push(unsubscribeFolders, unsubscribeFiles);

            } else if (currentView === 'shared-with-me') {
                const sharesQuery = firestore.collection('shares').where('sharedWithId', '==', user.uid);
                
                const unsubscribeShares = sharesQuery.onSnapshot(async (snapshot) => {
                    if (snapshot.empty) {
                        setFiles([]);
                        setFolders([]);
                        setLoading(false);
                        return;
                    }
                    const shares = snapshot.docs.map(doc => doc.data());
                    const fileIds = shares.filter(s => s.itemType === 'file').map(s => s.itemId);
                    const folderIds = shares.filter(s => s.itemType === 'folder').map(s => s.itemId);

                    const fetchItems = async <T>(ids: string[], collection: string): Promise<T[]> => {
                        if (ids.length === 0) return [];
                        const itemRefs = ids.map(id => firestore.collection(collection).doc(id));
                        const itemDocs = await Promise.all(itemRefs.map(ref => ref.get()));
                        return itemDocs
                          .filter(doc => doc.exists)
                          .map(doc => ({ id: doc.id, ...doc.data() } as T));
                    };

                    const [sharedFiles, sharedFolders] = await Promise.all([
                        fetchItems<AppFile>(fileIds, 'files'),
                        fetchItems<Folder>(folderIds, 'folders')
                    ]);

                    setFiles(sharedFiles);
                    setFolders(sharedFolders);
                    setLoading(false);
                });
                cleanupFunctions.push(unsubscribeShares);
            }
        };

        fetchData();

        return () => {
            cleanupFunctions.forEach(fn => fn());
        };

    }, [user, currentFolderId, currentView]);

    return { folders, files, loading };
};
