import React, { useState, useRef, useEffect } from 'react';
import { Item, Folder, AppFile } from '../types';
import { formatDate } from '../utils/formatDate';
import { FolderIcon, FileIcon, MoreIcon } from './icons';
import firebase from 'firebase/compat/app';

interface GridItemProps {
    item: Item;
    user: firebase.User;
    currentView: 'my-drive' | 'shared-with-me';
    onItemClick: (item: Folder) => void;
    onShare: (item: Item) => void;
    onRename: (item: Item) => void;
    onDelete: (item: Item) => void;
}

const GridItem: React.FC<GridItemProps> = ({ item, user, currentView, onItemClick, onShare, onRename, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isOwner = item.ownerId === user.uid;

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = () => {
        if (item.type === 'folder') {
            onItemClick(item as Folder);
        }
    };
    
    return (
        <div 
            className={`grid-item ${item.type}-item`} 
            role="button" 
            tabIndex={0} 
            title={item.name}
            onClick={handleItemClick}
        >
            <div className="item-header">
                {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
            </div>
            
            <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-date">{formatDate(item.createdAt)}</span>
            </div>
            
            <div className="item-actions-menu" ref={menuRef}>
                <button aria-label="More options" onClick={toggleMenu}><MoreIcon /></button>
                {isMenuOpen && (
                    <div className="item-dropdown-menu">
                        <button onClick={(e) => { e.stopPropagation(); onShare(item); setIsMenuOpen(false); }}>Share</button>
                        {isOwner && currentView === 'my-drive' && (
                             <>
                                <button onClick={(e) => { e.stopPropagation(); onRename(item); setIsMenuOpen(false); }}>Rename</button>
                                <button 
                                    className="delete-btn"
                                    onClick={(e) => { e.stopPropagation(); onDelete(item); setIsMenuOpen(false); }}
                                >
                                    Delete
                                </button>
                             </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GridItem;
