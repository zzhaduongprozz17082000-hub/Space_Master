import React from 'react';
import { Path } from '../types';

interface BreadcrumbProps {
    path: Path[];
    onBreadcrumbClick: (folderId: string | null, index: number) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onBreadcrumbClick }) => {
    return (
        <nav className="breadcrumb-nav" aria-label="breadcrumb">
            {path.map((item, index) => (
                <React.Fragment key={item.id || 'root'}>
                    {index > 0 && <span className="breadcrumb-separator">/</span>}
                    {index < path.length - 1 ? (
                        <button onClick={() => onBreadcrumbClick(item.id, index)} className="breadcrumb-link">
                            {item.name}
                        </button>
                    ) : (
                        <span className="breadcrumb-item" aria-current="page">{item.name}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
