
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type NotificationsModalProps = {
  open: boolean;
  onClose: () => void;
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Notifications</DialogTitle>
        <DialogDescription>
          You have no new notifications.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-2 space-y-2 text-sm">
        <div className="text-muted-foreground">No recent activity yet.</div>
      </div>
    </DialogContent>
  </Dialog>
);

export default NotificationsModal;
