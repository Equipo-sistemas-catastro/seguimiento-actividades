"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Input, Button, Typography, App } from "antd";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const app = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email?.trim(),
        password: values.password,
        email_user: values.email?.trim(),
        user_password: values.password,
      };

      const { data } = await api.post("/auth/login", payload);
      const token = data?.token || data?.Token || data?.access_token;
      if (!token) throw new Error("Token no recibido del backend");

      setToken(token);
      app.message.success("Bienvenido");

      const rawNext = search.get("next");
      const next =
        rawNext && rawNext.startsWith("/dashboard") ? "/home" : rawNext;

      router.replace(next || "/home");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error de autenticación";
      console.error("Login error:", e?.response?.data || e);
      app.message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <Card style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Ingreso</Title>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input autoFocus /></Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true }]}><Input.Password /></Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Ingresar</Button>
        </Form>
      </Card>
    </div>
  );
}
