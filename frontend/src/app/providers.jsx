"use client";

import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import { ConfigProvider, theme, App as AntdApp } from "antd";

export default function Providers({ children }) {
  return (
    <ConfigProvider
      theme={{ algorithm: theme.defaultAlgorithm, token: { borderRadius: 8 } }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
