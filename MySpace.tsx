import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { firestore } from './firebase';

interface Folder {
    id: string;
    name: string;
    parentId: string | null;
}

interface File {
    id: string;
    name: string;
    parentId: string | null;
}

interface MySpaceProps {
    user: firebase.User;
    handleLogout: () => void;
}

const FolderIcon: React.FC = () => (
    <svg className="item-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
    </svg>
);

const FileIcon: React.FC = () => (
    <svg className="item-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
);


const MySpace: React.FC<MySpaceProps> = ({ user, handleLogout }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [path, setPath] = useState<{ id: string | null; name: string }[]>([
        { id: null, name: 'My Space' }
    ]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const fetchFolders = firestore.collection('folders')
            .where('userId', '==', user.uid)
            .where('parentId', '==', currentFolderId)
            .onSnapshot(
                snapshot => {
                    const userFolders = snapshot.docs.map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                        parentId: doc.data().parentId,
                    }));
                    setFolders(userFolders);
                    setLoading(false);
                },
                error => {
                    console.error("Lỗi khi tải thư mục:", error);
                    setLoading(false);
                }
            );

        const fetchFiles = firestore.collection('files')
            .where('userId', '==', user.uid)
            .where('parentId', '==', currentFolderId)
            .onSnapshot(
                snapshot => {
                    const userFiles = snapshot.docs.map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                        parentId: doc.data().parentId,
                    }));
                    setFiles(userFiles);
                },
                error => {
                    console.error("Lỗi khi tải tệp:", error);
                }
            );

        return () => {
            fetchFolders();
            fetchFiles();
        };

    }, [user, currentFolderId]);

    const handleFolderClick = (folder: Folder) => {
        setCurrentFolderId(folder.id);
        setPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
    };
    
    const handleBreadcrumbClick = (folderId: string | null, index: number) => {
        setCurrentFolderId(folderId);
        setPath(prevPath => prevPath.slice(0, index + 1));
    };


    return (
        <div className="myspace-container">
            <header className="myspace-header">
                <div className="user-info">
                    <p>Chào mừng, <strong>{user.email}</strong></p>
                </div>
                <nav className="myspace-nav">
                    <button onClick={handleLogout} className="button logout-btn">Đăng xuất</button>
                </nav>
            </header>
            
            <nav className="breadcrumb-nav" aria-label="breadcrumb">
                {path.map((item, index) => (
                    <React.Fragment key={item.id || 'root'}>
                        {index > 0 && <span className="breadcrumb-separator">/</span>}
                        {index < path.length - 1 ? (
                            <button onClick={() => handleBreadcrumbClick(item.id, index)} className="breadcrumb-link">
                                {item.name}
                            </button>
                        ) : (
                            <span className="breadcrumb-item" aria-current="page">{item.name}</span>
                        )}
                    </React.Fragment>
                ))}
            </nav>

            <div className="file-browser">
                 {loading ? (
                    <div className="loading-spinner-small"></div>
                ) : (
                    <>
                        {folders.length === 0 && files.length === 0 ? (
                             <p className="placeholder-text">Thư mục này trống.</p>
                        ) : (
                            <div className="grid-view">
                                {folders.map(folder => (
                                    <div 
                                        key={folder.id} 
                                        className="grid-item folder-item" 
                                        role="button" 
                                        tabIndex={0} 
                                        title={folder.name}
                                        onClick={() => handleFolderClick(folder)}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFolderClick(folder)}
                                    >
                                        <FolderIcon />
                                        <span className="item-name">{folder.name}</span>
                                    </div>
                                ))}
                                {files.map(file => (
                                    <div key={file.id} className="grid-item file-item" role="button" tabIndex={0} title={file.name}>
                                        <FileIcon />
                                        <span className="item-name">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MySpace;
