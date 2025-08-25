import React from 'react';
import { Folder, AppFile, Path, Item } from '../types';
import GridItem from './GridItem';
import Breadcrumb from './Breadcrumb';
import firebase from 'firebase/compat/app';


interface FileBrowserProps {
    folders: Folder[];
    files: AppFile[];
    loading: boolean;
    path: Path[];
    user: firebase.User;
    currentView: 'my-drive' | 'shared-with-me';
    onBreadcrumbClick: (folderId: string | null, index: number) => void;
    onItemClick: (item: Folder) => void;
    onShare: (item: Item) => void;
    onRename: (item: Item) => void;
    onDelete: (item: Item) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = (props) => {
    const { folders, files, loading, path, currentView, onBreadcrumbClick } = props;
    
    const contentHeader = currentView === 'my-drive' 
        ? path[path.length - 1].name
        : 'Shared with me';

    return (
        <section className="content-area">
            <h2 className="content-header">{contentHeader}</h2>
            
            {currentView === 'my-drive' && (
                 <Breadcrumb path={path} onBreadcrumbClick={onBreadcrumbClick} />
            )}

            <div className="file-browser">
                {loading ? (
                    <div className="loading-spinner-small"></div>
                ) : folders.length === 0 && files.length === 0 ? (
                    <p className="placeholder-text">Thư mục này trống.</p>
                ) : (
                    <div className="grid-view">
                        {folders.map(folder => (
                            <GridItem key={folder.id} item={folder} {...props} />
                        ))}
                        {files.map(file => (
                            <GridItem key={file.id} item={file} {...props} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FileBrowser;
