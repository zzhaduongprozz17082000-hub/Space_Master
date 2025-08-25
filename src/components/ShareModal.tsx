import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { firestore } from '../firebase';
import { Item, Share } from '../types';

interface ShareModalProps {
    item: Item;
    user: firebase.User;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ item, user, onClose }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [sharedUsers, setSharedUsers] = useState<Share[]>([]);
    const [loading, setLoading] = useState(true);
    const isOwner = item.ownerId === user.uid;

    useEffect(() => {
        const unsubscribe = firestore.collection('shares')
            .where('itemId', '==', item.id)
            .onSnapshot(snapshot => {
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Share));
                setSharedUsers(users);
                setLoading(false);
            });
        return () => unsubscribe();
    }, [item.id]);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!email) return;

        try {
            const userQuery = await firestore.collection('users').where('email', '==', email).limit(1).get();
            if (userQuery.empty) {
                alert("Không tìm thấy người dùng với email này.");
                return;
            }
            const sharedWithUser = userQuery.docs[0].data();
            if (sharedWithUser.uid === user.uid) {
                alert("Bạn không thể chia sẻ với chính mình.");
                return;
            }
            if (sharedUsers.some(u => u.sharedWithId === sharedWithUser.uid)) {
                alert("Mục này đã được chia sẻ với người dùng này.");
                return;
            }

            await firestore.collection('shares').add({
                itemId: item.id,
                itemType: item.type,
                ownerId: user.uid,
                sharedWithId: sharedWithUser.uid,
                sharedWithEmail: sharedWithUser.email,
                permission: permission
            });
            setEmail('');
        } catch (error) {
            console.error("Lỗi khi chia sẻ:", error);
            alert("Đã xảy ra lỗi khi chia sẻ.");
        }
    };

    const handleUpdatePermission = async (shareId: string, newPermission: 'view' | 'edit') => {
        await firestore.collection('shares').doc(shareId).update({ permission: newPermission });
    };

    const handleRemoveShare = async (shareId: string) => {
        if(window.confirm("Bạn có chắc muốn hủy chia sẻ?")) {
            await firestore.collection('shares').doc(shareId).delete();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chia sẻ "{item.name}"</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {isOwner && (
                        <form className="share-form" onSubmit={handleShare}>
                            <input 
                                type="email" 
                                className="input" 
                                placeholder="Nhập email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <select 
                                className="permission-select"
                                value={permission}
                                onChange={e => setPermission(e.target.value as 'view' | 'edit')}
                            >
                                <option value="view">Can view</option>
                                <option value="edit">Can edit</option>
                            </select>
                            <button type="submit" className="button">Share</button>
                        </form>
                    )}

                    <div className="shared-users-list">
                        <h4>Mọi người có quyền truy cập</h4>
                        {loading ? <p>Đang tải...</p> : 
                        <>
                            <div className="shared-user-item">
                                <div className="user-info">
                                     <span className="email">{user.email} (You)</span>
                                     <span className="role">Owner</span>
                                </div>
                            </div>
                            {sharedUsers.map(share => (
                                <div key={share.id} className="shared-user-item">
                                    <div className="user-info">
                                        <span className="email">{share.sharedWithEmail}</span>
                                    </div>
                                    <div className="user-actions">
                                        <select 
                                            className="permission-select"
                                            value={share.permission}
                                            onChange={e => handleUpdatePermission(share.id, e.target.value as 'view' | 'edit')}
                                            disabled={!isOwner}
                                        >
                                            <option value="view">Can view</option>
                                            <option value="edit">Can edit</option>
                                        </select>
                                        {isOwner && <button className="remove-btn" onClick={() => handleRemoveShare(share.id)}>&times;</button>}
                                    </div>
                                </div>
                            ))}
                        </>
                        }
                         {sharedUsers.length === 0 && !loading && <p>Chưa được chia sẻ với ai.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
