// src/config/menu-map.js
import {
  HomeOutlined,
  IdcardOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  BankOutlined,
  FileTextOutlined,
  ProfileOutlined,
  FileDoneOutlined,
  FlagOutlined,
  TeamOutlined,
  FolderOutlined,
  UsergroupAddOutlined,
  AuditOutlined,
  PushpinOutlined,
  CarryOutOutlined,
  ScheduleOutlined,
  FormOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

// Mapa opcional de íconos por código (puedes ampliar sin tocar el layout)
export const ICON_BY_CODE = {
  HOME: <HomeOutlined />,
  PERFILES: <IdcardOutlined />,
  OBLIGACIONES: <CheckSquareOutlined />,
  COMPONENTES: <DatabaseOutlined />,
  EVIDENCIAS: <FileSearchOutlined />,
  TIPOS_CONTRATO: <FileProtectOutlined />,
  ENTIDADES: <BankOutlined />,
  CONTRATOS: <FileTextOutlined />,
  ESTADOS: <FlagOutlined />,
  REQUERIMIENTOS: <FormOutlined />,
  ACCIONES: <TeamOutlined />,
  SEGUIMIENTO: <FolderOutlined />,

  // === Nuevos ===
  EMPLEADOS: <UsergroupAddOutlined />,
  SGTO_ACCIONES: <AuditOutlined />,
  MIS_ASIGNACIONES: <PushpinOutlined />,
  ACTIVIDADES: <CarryOutOutlined />,
  MIS_ACTIVIDADES: <ScheduleOutlined />,
  MIS_REQUERIMIENTOS: <AuditOutlined />,
  INFORME_ACTIVIDADES: <ProfileOutlined />,
  VER_INFORMES: <FileDoneOutlined />,
};

// Ícono por defecto si no hay mapeo
export const DEFAULT_ICON = <FolderOutlined />;

// Convierte el código del backend a ruta: "TIPOS_CONTRATO" -> "/tipos-contrato"
export function routeFromCode(code = "") {
  return (
    "/" +
    String(code)
      .toLowerCase()
      .replace(/_/g, "-")
      .trim()
  );
}
