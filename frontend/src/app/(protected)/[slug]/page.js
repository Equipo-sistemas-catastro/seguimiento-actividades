"use client";

import { Card, Typography } from "antd";
import { useParams } from "next/navigation";

const { Title, Paragraph } = Typography;

function titleCase(s = "") {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function GenericModulePage() {
  // En cliente, usa el hook de Next para leer los params
  const { slug } = useParams(); // string para [slug]

  const name = titleCase(slug || "Módulo");

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        <Title level={4}>{name}</Title>
        <Paragraph>Vista en construcción. Próximamente funcionalidad.</Paragraph>
      </Card>
    </div>
  );
}
