"use client";
import { Card, Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        <Title level={4}>Aplicación de seguimiento de actividades</Title>
        <Paragraph>Bienvenido. Usa el menú lateral para navegar.</Paragraph>
      </Card>
    </div>
  );
}
