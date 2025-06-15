
-// ... keep existing code (imports and props and state logic) the same ...
+import { useAuth } from "@/components/AuthContext";
+import { supabase } from "@/integrations/supabase/client";
+import { useEffect, useState } from "react";
 
-const Header = () => {
-  const [notifOpen, setNotifOpen] = useState(false);
-  const [profileOpen, setProfileOpen] = useState(false);
+const Header = () => {
+  const [notifOpen, setNotifOpen] = useState(false);
+  const [profileOpen, setProfileOpen] = useState(false);
+  const [notificationCount, setNotificationCount] = useState(0);
+  const { user } = useAuth();
+  
+  // Fetch unread notification count
+  useEffect(() => {
+    if (!user) return setNotificationCount(0);
+    // We'll use a simple fetch, assumes a notifications table with user_id, read fields.
+    fetch(`/api/notifications/count?userid=${user.id}`)
+      .then((r) => r.json())
+      .then((d) => setNotificationCount(d.count || 0))
+      .catch(() => setNotificationCount(0));
+  }, [user]);
 
-  return (
-    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
-      <div className="flex h-16 items-center justify-between px-6">
-        // ... keep existing code (logo, nav, links) ...
-          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(true)}>
-            <Bell className="h-5 w-5" />
-            <span className="absolute -top-1 -right-1 h-3 w-3 bg-security-critical rounded-full text-xs flex items-center justify-center text-white">
-              3
-            </span>
-          </Button>
-         // ... keep existing code ...
-      </div>
-      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
-    </header>
-  );
+  return (
+    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
+      <div className="flex h-16 items-center justify-between px-6">
+        <div className="flex items-center space-x-4">
+          {/* ... keep logo section ... */}
+          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
+            <Shield className="h-8 w-8 text-primary" />
+            <div>
+              <h1 className="text-xl font-bold text-foreground">SecureFlow</h1>
+              <p className="text-xs text-muted-foreground">DevSecOps Pipeline</p>
+            </div>
+          </a>
+        </div>
+        <div className="flex items-center space-x-4 relative">
+          <div className="hidden md:flex items-center space-x-2 text-sm">
+            <div className="h-2 w-2 rounded-full bg-security-secure animate-pulse-security"></div>
+            <span className="text-muted-foreground">Pipeline Status:</span>
+            <span className="text-security-secure font-medium">Secure</span>
+          </div>
+          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(true)}>
+            <Bell className="h-5 w-5" />
+            {notificationCount > 0 && (
+              <span className="absolute -top-1 -right-1 h-3 w-3 bg-security-critical rounded-full text-xs flex items-center justify-center text-white">
+                {notificationCount}
+              </span>
+            )}
+          </Button>
+          <Button variant="ghost" size="icon" onClick={() => setProfileOpen((v) => !v)}>
+            <User className="h-5 w-5" />
+          </Button>
+          <a href="/settings">
+            <Button variant="ghost" size="icon">
+              <Settings className="h-5 w-5" />
+            </Button>
+          </a>
+          <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
+        </div>
+      </div>
+      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
+    </header>
+  );
 };
 
 export default Header;
