import React, { useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import { firestore, storage, serverTimestamp } from '../firebase';
import { useFileBrowser } from '../hooks/useFileBrowser';
import { Item, Folder, Path, AppFile } from '../types';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FileBrowser from '../components/FileBrowser';
import ShareModal from '../components/ShareModal';

interface MySpaceProps {
    user: firebase.User;
    handleLogout: () => void;
}

const MySpace: React.FC<MySpaceProps> = ({ user, handleLogout }) => {
    const [isUploading, setIsUploading] = useState(false);
    
    // Navigation State
    const [currentView, setCurrentView] = useState<'my-drive' | 'shared-with-me'>('my-drive');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [path, setPath] = useState<Path[]>([{ id: null, name: 'My Drive' }]);

    // Fetched data from custom hook
    const { folders, files, loading } = useFileBrowser(user, currentView, currentFolderId);

    // Sharing Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingItem, setSharingItem] = useState<Item | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ACTION HANDLERS
    const handleViewChange = (view: 'my-drive' | 'shared-with-me') => {
        setCurrentView(view);
        setCurrentFolderId(null);
        setPath(view === 'my-drive' ? [{ id: null, name: 'My Drive' }] : []);
    };

    const handleFolderClick = (folder: Folder) => {
        if (currentView === 'shared-with-me') {
            alert("Duyệt thư mục lồng nhau trong 'Shared with me' chưa được hỗ trợ.");
            return;
        }
        setCurrentFolderId(folder.id);
        setPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
    };
    
    const handleBreadcrumbClick = (folderId: string | null, index: number) => {
        setCurrentFolderId(folderId);
        setPath(prevPath => prevPath.slice(0, index + 1));
    };

    const handleCreateFolder = async () => {
        const folderName = prompt("Nhập tên thư mục mới:");
        if (folderName && folderName.trim() !== '') {
            try {
                await firestore.collection('folders').add({
                    name: folderName.trim(),
                    ownerId: user.uid,
                    parentId: currentFolderId,
                    createdAt: serverTimestamp(),
                });
            } catch (error) {
                console.error("Lỗi khi tạo thư mục:", error);
            }
        }
    };

    const handleUploadClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsUploading(true);
        const uploadPromises = Array.from(selectedFiles).map((file) => {
            const filePath = `files/${user.uid}/${currentFolderId || 'root'}/${Date.now()}-${file.name}`;
            const storageRef = storage.ref(filePath);
            const uploadTask = storageRef.put(file);

            return uploadTask.then(async snapshot => {
                const downloadURL = await snapshot.ref.getDownloadURL();
                await firestore.collection('files').add({
                    name: file.name,
                    ownerId: user.uid,
                    parentId: currentFolderId,
                    createdAt: serverTimestamp(),
                    url: downloadURL,
                    path: filePath,
                    size: file.size,
                    fileType: file.type,
                });
            });
        });

        try {
            await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Lỗi khi tải tệp lên:", error);
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) { fileInputRef.current.value = ''; }
        }
    };
    
    const openShareModal = (item: Item) => {
        setSharingItem(item);
        setIsShareModalOpen(true);
    };

    const handleRenameItem = async (item: Item) => {
        const newName = prompt(`Nhập tên mới cho "${item.name}":`, item.name);
        if (newName && newName.trim() !== '' && newName !== item.name) {
            const collection = item.type === 'folder' ? 'folders' : 'files';
            await firestore.collection(collection).doc(item.id).update({ name: newName.trim() });
        }
    };

    const deleteFolderAndContents = async (folderId: string) => {
        const itemsToDelete = await firestore.collection('folders').where('parentId', '==', folderId).get();
        for (const doc of itemsToDelete.docs) {
            await deleteFolderAndContents(doc.id);
        }
        const filesToDelete = await firestore.collection('files').where('parentId', '==', folderId).get();
        for (const doc of filesToDelete.docs) {
            const fileData = doc.data() as AppFile;
            await storage.ref(fileData.path).delete();
            await firestore.collection('files').doc(doc.id).delete();
        }
        await firestore.collection('folders').doc(folderId).delete();
    };

    const handleDeleteItem = async (item: Item) => {
        const confirmation = window.confirm(`Bạn có chắc muốn xóa "${item.name}"? Hành động này không thể hoàn tác.`);
        if (!confirmation) return;
        
        try {
            if (item.type === 'folder') {
                await deleteFolderAndContents(item.id);
            } else {
                const file = item as AppFile;
                await storage.ref(file.path).delete();
                await firestore.collection('files').doc(file.id).delete();
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert("Đã xảy ra lỗi khi xóa.");
        }
    };

    return (
        <div className="spacemaster-layout">
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            
            {isShareModalOpen && sharingItem && (
                 <ShareModal 
                    item={sharingItem} 
                    user={user}
                    onClose={() => setIsShareModalOpen(false)} 
                />
            )}

            <Sidebar 
                currentView={currentView}
                isUploading={isUploading}
                onViewChange={handleViewChange}
                onCreateFolder={handleCreateFolder}
                onUploadClick={handleUploadClick}
            />
            
            <main className="main-content">
                <Header user={user} handleLogout={handleLogout} />
                <FileBrowser
                    folders={folders}
                    files={files}
                    loading={loading}
                    path={path}
                    user={user}
                    currentView={currentView}
                    onBreadcrumbClick={handleBreadcrumbClick}
                    onItemClick={handleFolderClick}
                    onShare={openShareModal}
                    onRename={handleRenameItem}
                    onDelete={handleDeleteItem}
                />
            </main>
        </div>
    );
};

export default MySpace;
