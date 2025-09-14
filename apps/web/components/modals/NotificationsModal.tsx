
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthContext';

type Notification = {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
};

type NotificationsModalProps = {
  open: boolean;
  onClose: () => void;
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    fetch(`/api/notifications?userid=${user.id}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {loading ? "Loading..." : notifications.length === 0 ? "You have no new notifications." : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2 text-sm max-h-60 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={`p-2 rounded ${n.read ? "bg-gray-100" : "bg-accent"}`}>
                <div className="">{n.message}</div>
                <span className="block text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            ))
          ) : (
            !loading && <div className="text-muted-foreground">No recent activity yet.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
