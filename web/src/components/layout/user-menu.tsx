import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

import { CONSOLE_URL } from "@/constant/env";
import { logout } from "@/services/api/auth";
import { useUserStore } from "@/stores/use-user-store";
import { cn } from "@/lib/utils";

type UserMenuProps = {
    className?: string;
    style?: React.CSSProperties;
};

export function UserMenu({ className, style }: UserMenuProps) {
    const user = useUserStore((state) => state.user);
    const label = user?.displayName || user?.username || "用户";

    return (
        <Dropdown
            trigger={["click"]}
            menu={{
                items: [
                    { key: "details", icon: <UserOutlined />, label: "用户详情", onClick: () => window.open(CONSOLE_URL, "_blank", "noopener,noreferrer") },
                    { key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: () => void logout() },
                ],
            }}
        >
            <button
                type="button"
                className={cn("inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-black/5 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white", className)}
                style={style}
                aria-label={label}
                title={label}
            >
                <UserOutlined className="text-sm" />
                <span>{label}</span>
                <DownOutlined className="text-[10px]" />
            </button>
        </Dropdown>
    );
}
