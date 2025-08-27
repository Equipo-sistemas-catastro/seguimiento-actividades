"use client";
import React from "react";
import { Card, Typography } from "antd";
const { Text } = Typography;

export default function DebugPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <Card title="Debug">
        <Text>React version: {React.version}</Text>
      </Card>
    </div>
  );
}
