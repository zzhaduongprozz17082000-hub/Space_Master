import React from 'react';
import { FolderIcon, SharedIcon, RecentIcon, StarredIcon, TrashIcon } from './icons';

interface SidebarProps {
    currentView: 'my-drive' | 'shared-with-me';
    isUploading: boolean;
    onViewChange: (view: 'my-drive' | 'shared-with-me') => void;
    onCreateFolder: () => void;
    onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, isUploading, onViewChange, onCreateFolder, onUploadClick }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">Space Master</div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <button onClick={() => onViewChange('my-drive')} className={currentView === 'my-drive' ? 'active' : ''}>
                            <FolderIcon className="nav-icon" /> My Drive
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onViewChange('shared-with-me')} className={currentView === 'shared-with-me' ? 'active' : ''}>
                            <SharedIcon /> Shared with me
                        </button>
                    </li>
                    <li><a href="#"><RecentIcon /> Recent</a></li>
                    <li><a href="#"><StarredIcon /> Starred</a></li>
                    <li><a href="#"><TrashIcon /> Trash</a></li>
                </ul>
            </nav>
            <div className="sidebar-actions">
                <button onClick={onCreateFolder} className="button new-folder-btn" disabled={currentView !== 'my-drive'}>
                    New folder
                </button>
                <button onClick={onUploadClick} className="button" disabled={isUploading || currentView !== 'my-drive'}>
                    {isUploading ? 'Uploading...' : 'Upload file'}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
