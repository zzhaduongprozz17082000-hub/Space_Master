import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { firestore } from './firebase';

// Interfaces
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

// SVG Icons
const FolderIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "item-icon"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
    </svg>
);
const FileIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "item-icon"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const SharedIcon: React.FC = () => <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-2.331 4.368-2.331 4.938 0m-9.107 4.287A9.09 9.09 0 0 1 8.344 18.72m0 0a9.09 9.09 0 0 0 5.176 0m-5.176 0a9.09 9.09 0 0 1-5.176 0M12 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const RecentIcon: React.FC = () => <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const StarredIcon: React.FC = () => <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const TrashIcon: React.FC = () => <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const UserIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>;
const SearchIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const MoreIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>;

const MySpace: React.FC<MySpaceProps> = ({ user, handleLogout }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [path, setPath] = useState<{ id: string | null; name: string }[]>([
        { id: null, name: 'My Drive' }
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
        <div className="spacemaster-layout">
            <aside className="sidebar">
                <div className="sidebar-header">Space Master</div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#" className="active"><FolderIcon className="nav-icon"/> My Drive</a></li>
                        <li><a href="#"><SharedIcon /> Shared with me</a></li>
                        <li><a href="#"><RecentIcon /> Recent</a></li>
                        <li><a href="#"><StarredIcon /> Starred</a></li>
                        <li><a href="#"><TrashIcon /> Trash</a></li>
                    </ul>
                </nav>
                <div className="sidebar-actions">
                    <button className="button new-folder-btn">New folder</button>
                    <button className="button">Upload file</button>
                </div>
            </aside>
            <main className="main-content">
                <header className="main-header">
                    <div className="search-bar">
                        <span className="search-icon"><SearchIcon/></span>
                        <input type="text" placeholder="Search in Drive" className="search-input" />
                    </div>
                    <div className="header-controls">
                        <div className="user-profile">
                            <span>{user.displayName || user.email}</span>
                            <UserIcon />
                             <button onClick={handleLogout} className="toggle-auth">Đăng xuất</button>
                        </div>
                    </div>
                </header>
                <section className="content-area">
                    <h2 className="content-header">{path[path.length - 1].name}</h2>
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
                                {(folders.length === 0 && files.length === 0) ? (
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
                                                <div className="item-header">
                                                    <FolderIcon />
                                                    <div className="item-actions">
                                                        <button aria-label="More options"><MoreIcon/></button>
                                                    </div>
                                                </div>
                                                <div className="item-details">
                                                    <span className="item-name">{folder.name}</span>
                                                    <span className="item-date">2025-08-25</span>
                                                </div>
                                            </div>
                                        ))}
                                        {files.map(file => (
                                            <div key={file.id} className="grid-item file-item" role="button" tabIndex={0} title={file.name}>
                                                 <div className="item-header">
                                                    <FileIcon />
                                                    <div className="item-actions">
                                                        <button aria-label="More options"><MoreIcon/></button>
                                                    </div>
                                                </div>
                                                <div className="item-details">
                                                    <span className="item-name">{file.name}</span>
                                                     <span className="item-date">2025-08-25</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MySpace;
