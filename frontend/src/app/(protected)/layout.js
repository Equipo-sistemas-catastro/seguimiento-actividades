"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Typography, Spin, Button, App } from "antd";
import { UserOutlined, LogoutOutlined, HomeOutlined, IdcardOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { ICON_BY_CODE, DEFAULT_ICON, routeFromCode } from "@/config/menu-map";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();

  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  const [menuLoading, setMenuLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  // Guard + usuario
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = getToken();
        if (!t) {
          router.replace("/login?next=" + encodeURIComponent(pathname));
          return;
        }
        setChecking(true);
        const { data } = await api.get("/auth/me");
        if (alive) setUser(data || null);
      } catch (e) {
        // Tratar cualquier fallo como no-autenticado
        clearToken();
        router.replace("/login?next=" + encodeURIComponent(pathname));
        return;
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [pathname, router]);

  // Cargar menú dinámico desde /menu/my  → { items: [...] }
  useEffect(() => {
    if (checking) return;

    // ⬇⬇ EVITA cargar menú si NO hay token (previene 401 y logs en consola)
    const t = getToken();
    if (!t) return;

    let alive = true;
    (async () => {
      try {
        setMenuLoading(true);
        const resp = await api.get("/menu/my"); // => { items: [{ id_menu, code, descripcion, orden }] }
        const arr = Array.isArray(resp?.data?.items) ? resp.data.items : [];

        // Normaliza y construye items de AntD
        let items = arr
          .map((m, idx) => ({
            code: String(m.code || "").toUpperCase(),
            label: m.descripcion || m.code || "Sin nombre",
            order: m.orden ?? idx,
          }))
          .filter((x) => x.code)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((m) => {
            const icon = ICON_BY_CODE[m.code] ?? DEFAULT_ICON;
            const href = routeFromCode(m.code);
            return {
              key: m.code,
              icon,
              label: m.label,
              onClick: () => href && router.push(href),
            };
          });

        // Garantiza que “HOME” esté primero si no vino del backend
        if (!items.some((i) => i.key === "HOME")) {
          items = [
            { key: "HOME", icon: <HomeOutlined />, label: "Home", onClick: () => router.push("/home") },
            ...items,
          ];
        }
        // Si de verdad está vacío, agrega Perfiles como mínimo
        if (items.length === 1) {
          items.push({
            key: "PERFILES",
            icon: <IdcardOutlined />,
            label: "Perfiles",
            onClick: () => router.push("/perfiles"),
          });
        }

        if (alive) setMenuItems(items);
      } catch (e) {
        const status = e?.response?.status;

        // ⬇⬇ Silenciar 401/403 (esperado si no hay sesión)
        if (status === 401 || status === 403) return;

        // Otros errores: warning + fallback mínimo
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.debug("Menú: no se pudo cargar", e?.response?.data || e?.message || e);
        }
        message.warning("No se pudo cargar el menú. Usando predeterminado.");
        if (alive) {
          setMenuItems([
            { key: "HOME", icon: <HomeOutlined />, label: "Home", onClick: () => router.push("/home") },
            { key: "PERFILES", icon: <IdcardOutlined />, label: "Perfiles", onClick: () => router.push("/perfiles") },
          ]);
        }
      } finally {
        if (alive) setMenuLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [checking, router, message]);

  if (checking) return <Spin fullscreen tip="Verificando sesión..." />;

  // Nombre visible en header
  const displayName =
    user?.name || user?.full_name || user?.nombre || user?.username || user?.email || user?.email_user || "Usuario";

  // Selección actual por ruta (primer segmento)
  const currentKey = (() => {
    const seg = pathname.split("/")[1]?.toUpperCase();
    return seg || "HOME";
  })();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        {/* Logo */}
        <div style={{ height: 80, display: "grid", placeItems: "center", padding: 8 }}>
          <img src="/logo-am.png" alt="Logo Alcaldía de Medellín" style={{ height: collapsed ? 36 : 56, objectFit: "contain" }} />
        </div>

        <Spin spinning={menuLoading}>
          <Menu mode="inline" items={menuItems} selectedKeys={[currentKey]} />
        </Spin>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 16,
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: 20 }}>Aplicación de seguimiento de actividades</Title>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <UserOutlined />
            <Text>{displayName}</Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => { clearToken(); router.replace("/login"); }}
            >
              Salir
            </Button>
          </div>
        </Header>

        <Content style={{ padding: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
