import AccountTab from "./tabs/AccountTab";
import NotificationsTab from "./tabs/NotificationsTab";
import PrivacyTab from "./tabs/PrivacyTab";
import ProfileTab from "./Tabs/ProfileTabs";

export default function ProfileContent({ activeTab, user }) {
  switch (activeTab) {
    case "profile":
      return <ProfileTab user={user} />;
    case "account":
      return <AccountTab user={user} />;
    case "notifications":
      return <NotificationsTab user={user} />;
    case "privacy":
      return <PrivacyTab user={user} />;
    default:
      return <ProfileTab user={user} />;
  }
}