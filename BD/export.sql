--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tbl_actividad_obligacion; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_actividad_obligacion (
    id_actividad bigint NOT NULL,
    id_obligacion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_actividad_obligacion OWNER TO postgres;

--
-- Name: tbl_actividades; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_actividades (
    id_actividad bigint NOT NULL,
    actividad text NOT NULL,
    fecha_inicio_actividad date NOT NULL,
    fecha_fin_programada date NOT NULL,
    fecha_fin_actividad date,
    id_req bigint,
    id_empleado bigint,
    id_estado bigint,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_fecha_fin_actividad CHECK (((fecha_fin_actividad IS NULL) OR (fecha_fin_actividad >= fecha_inicio_actividad))),
    CONSTRAINT chk_fecha_fin_programada CHECK ((fecha_fin_programada >= fecha_inicio_actividad))
);


ALTER TABLE dev.tbl_actividades OWNER TO postgres;

--
-- Name: tbl_actividades_id_actividad_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_actividades ALTER COLUMN id_actividad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_actividades_id_actividad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_asigna_requerimiento; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_asigna_requerimiento (
    id_req bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    id_empleado bigint NOT NULL
);


ALTER TABLE dev.tbl_asigna_requerimiento OWNER TO postgres;

--
-- Name: tbl_componentes; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_componentes (
    id_componente bigint NOT NULL,
    componente text NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_componentes OWNER TO postgres;

--
-- Name: tbl_componentes_id_componente_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_componentes ALTER COLUMN id_componente ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_componentes_id_componente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_contratos; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_contratos (
    id_contrato bigint NOT NULL,
    num_contrato character varying(20) NOT NULL,
    fecha_inicio_contrato date,
    fecha_fin_contrato date,
    valor_contrato numeric(12,0),
    supervisor_contrato text,
    id_tipo_contrato bigint NOT NULL,
    id_entidad bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    id_empleado bigint NOT NULL,
    objeto_contrato text NOT NULL,
    CONSTRAINT chk_contrato_fechas CHECK (((fecha_fin_contrato IS NULL) OR (fecha_fin_contrato >= fecha_inicio_contrato)))
);


ALTER TABLE dev.tbl_contratos OWNER TO postgres;

--
-- Name: tbl_contratos_id_contrato_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_contratos ALTER COLUMN id_contrato ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_contratos_id_contrato_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_empleado_componente; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_empleado_componente (
    id_empl_comp bigint NOT NULL,
    id_empleado bigint NOT NULL,
    id_componente bigint NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT now() NOT NULL,
    fecha_fin timestamp without time zone,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_rec_estado CHECK ((estado = ANY (ARRAY['activo'::text, 'inactivo'::text])))
);


ALTER TABLE dev.tbl_empleado_componente OWNER TO postgres;

--
-- Name: tbl_empleado_componente_id_empl_comp_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_empleado_componente ALTER COLUMN id_empl_comp ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_empleado_componente_id_empl_comp_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_empleado_perfil; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_empleado_perfil (
    id_empl_perf bigint NOT NULL,
    id_empleado bigint NOT NULL,
    id_perfil bigint NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT now() NOT NULL,
    fecha_fin timestamp without time zone,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_rep_estado CHECK ((estado = ANY (ARRAY['activo'::text, 'inactivo'::text])))
);


ALTER TABLE dev.tbl_empleado_perfil OWNER TO postgres;

--
-- Name: tbl_empleado_perfil_id_empl_perf_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_empleado_perfil ALTER COLUMN id_empl_perf ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_empleado_perfil_id_empl_perf_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_empleados_app_sgt_act; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_empleados_app_sgt_act (
    id_empleado bigint NOT NULL,
    cedula_empleado bigint NOT NULL,
    primer_nombre_empl text NOT NULL,
    segundo_nombre_empl text,
    primer_apellido_empl text NOT NULL,
    segundo_apellido_empl text,
    fecha_nacimiento_empl date,
    email_empleado text NOT NULL,
    movil_empleado bigint,
    estado text DEFAULT 'activo'::text NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_empleado_estado CHECK ((estado = ANY (ARRAY['activo'::text, 'inactivo'::text]))),
    CONSTRAINT ck_fecha_nacimiento_valida CHECK (((fecha_nacimiento_empl IS NULL) OR ((fecha_nacimiento_empl >= '1900-01-01'::date) AND (fecha_nacimiento_empl <= CURRENT_DATE))))
);


ALTER TABLE dev.tbl_empleados_app_sgt_act OWNER TO postgres;

--
-- Name: tbl_empleados_app_sgt_act_id_empleado_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_empleados_app_sgt_act ALTER COLUMN id_empleado ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_empleados_app_sgt_act_id_empleado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_entidad_contratante; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_entidad_contratante (
    id_entidad bigint NOT NULL,
    entidad character varying(100) NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_entidad_contratante OWNER TO postgres;

--
-- Name: tbl_entidad_contratante_id_entidad_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_entidad_contratante ALTER COLUMN id_entidad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_entidad_contratante_id_entidad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_estados; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_estados (
    id_estado bigint NOT NULL,
    estado character varying(100) NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_estados OWNER TO postgres;

--
-- Name: tbl_estados_id_estado_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_estados ALTER COLUMN id_estado ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_estados_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_evidencia_componentes; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_evidencia_componentes (
    id_evidencia bigint NOT NULL,
    id_componente bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_evidencia_componentes OWNER TO postgres;

--
-- Name: tbl_evidencias; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_evidencias (
    id_evidencia bigint NOT NULL,
    url_evidencia character varying(300) NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_evidencias OWNER TO postgres;

--
-- Name: tbl_evidencias_id_evidencia_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_evidencias ALTER COLUMN id_evidencia ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_evidencias_id_evidencia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_menu_app_actividades; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_menu_app_actividades (
    id_menu bigint NOT NULL,
    code text NOT NULL,
    descripcion text,
    orden integer,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_menu_app_actividades OWNER TO postgres;

--
-- Name: tbl_menu_app_actividades_id_menu_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_menu_app_actividades ALTER COLUMN id_menu ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_menu_app_actividades_id_menu_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_obligacion_contractual; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_obligacion_contractual (
    id_obligacion bigint NOT NULL,
    obligacion_contractual text NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_obligacion_contractual OWNER TO postgres;

--
-- Name: tbl_obligacion_contractual_id_obligacion_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_obligacion_contractual ALTER COLUMN id_obligacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_obligacion_contractual_id_obligacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_perfil_obligaciones; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_perfil_obligaciones (
    id_perfil bigint NOT NULL,
    id_obligacion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_perfil_obligaciones OWNER TO postgres;

--
-- Name: tbl_perfiles; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_perfiles (
    id_perfil bigint NOT NULL,
    perfil text NOT NULL,
    descripcion_perfil text,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_perfiles OWNER TO postgres;

--
-- Name: tbl_perfiles_id_perfil_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_perfiles ALTER COLUMN id_perfil ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_perfiles_id_perfil_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_requerimiento; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_requerimiento (
    id_req bigint NOT NULL,
    descripcion_req text NOT NULL,
    fecha_inicio_req date,
    fecha_fin_req date,
    id_estado bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_req_fechas CHECK (((fecha_fin_req IS NULL) OR (fecha_fin_req >= fecha_inicio_req)))
);


ALTER TABLE dev.tbl_requerimiento OWNER TO postgres;

--
-- Name: tbl_requerimiento_id_req_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_requerimiento ALTER COLUMN id_req ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_requerimiento_id_req_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_rol_menu_actividades; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_rol_menu_actividades (
    id_role integer NOT NULL,
    id_menu bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_rol_menu_actividades OWNER TO postgres;

--
-- Name: tbl_role; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_role (
    id_role integer NOT NULL,
    rol_name character varying,
    create_at date
);


ALTER TABLE dev.tbl_role OWNER TO postgres;

--
-- Name: tbl_sgto_accion_oblig; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_sgto_accion_oblig (
    id_sgto_accion bigint NOT NULL,
    id_obligacion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_sgto_accion_oblig OWNER TO postgres;

--
-- Name: tbl_sgto_acciones; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_sgto_acciones (
    id_sgto_accion bigint NOT NULL,
    descripcion_sgto text NOT NULL,
    fecha_sgto date,
    id_accion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_sgto_acciones OWNER TO postgres;

--
-- Name: tbl_sgto_acciones_id_sgto_accion_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_sgto_acciones ALTER COLUMN id_sgto_accion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_sgto_acciones_id_sgto_accion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_tipos_contrato; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_tipos_contrato (
    id_tipo_contrato bigint NOT NULL,
    contrato character varying(30) NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_tipos_contrato OWNER TO postgres;

--
-- Name: tbl_tipos_contrato_id_tipo_contrato_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_tipos_contrato ALTER COLUMN id_tipo_contrato ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_tipos_contrato_id_tipo_contrato_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: tbl_actividad_obligacion; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_actividad_obligacion (id_actividad, id_obligacion, id_user_auditoria, fecha_auditoria) FROM stdin;
2	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-22 16:28:01.640492
2	4	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-22 16:28:01.640492
2	3	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-22 16:28:01.640492
3	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
3	4	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
3	10	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
3	3	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
3	8	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
3	9	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
6	9	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:18:52.756755
4	8	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:24:48.194824
4	9	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:24:48.194824
4	10	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:24:48.194824
1	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:44:30.33478
1	4	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:44:30.33478
7	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:30:19.436803
7	16	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:30:19.436803
7	30	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:30:19.436803
7	33	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:30:19.436803
8	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
8	18	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
8	17	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
8	20	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
8	37	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
9	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 14:32:06.914205
9	37	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 14:32:06.914205
10	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 15:54:36.60875
10	12	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 15:54:36.60875
5	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:40:45.998314
11	37	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:11.711874
14	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:13.698693
13	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:14.770155
12	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:16.004876
15	11	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:18.819792
16	34	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 16:43:17.381776
\.


--
-- Data for Name: tbl_actividades; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_actividades (id_actividad, actividad, fecha_inicio_actividad, fecha_fin_programada, fecha_fin_actividad, id_req, id_empleado, id_estado, id_user_auditoria, fecha_auditoria) FROM stdin;
2	Prueba crear actividad.	2025-10-01	2025-11-01	\N	10	4	1	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-22 16:28:01.640492
6	Prueba crear act. desde mis activ.	2025-09-10	2025-09-10	\N	10	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:18:52.756755
4	Mis Actividades A1	2025-09-10	2025-09-10	\N	1	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:24:48.194824
3	Prueba 2 crear actividad.	2025-09-20	2025-10-01	2025-10-02	10	4	3	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-09-23 10:17:51.989002
5	Prueba update 3 crear actividad desde mis requerimientos	2025-09-30	2025-10-02	\N	10	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:40:45.998314
1	Plan de trabajo inicial	2025-09-10	2025-09-13	\N	10	4	1	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-01 11:44:30.33478
7	Prueba Actividad Admón	2025-09-01	2025-09-03	\N	13	1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:30:19.436803
8	Actividad Prueba Admón	2025-10-21	2025-10-31	\N	10	1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:31:07.270156
9	Actividad Prueba Error	2025-10-21	2025-10-31	\N	10	4	1	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 14:32:06.914205
10	Actividad Pedro	2025-10-22	2025-10-22	\N	15	4	1	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-21 15:54:36.60875
11	Act >Pedro 2	2025-10-31	2025-10-31	\N	15	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:11.711874
14	Act Pedro 3.\nkasuafuons aovns vi niks voas	2025-10-25	2025-10-29	\N	15	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:13.698693
13	Act Pedro 2. uahf alicas cain sfavnis visnvk svins vks ksvknsikkviks msvk njsvjksj	2025-10-23	2025-10-29	\N	10	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:14.770155
12	Act Pedro 1	2025-10-23	2025-10-29	\N	15	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:16.004876
15	Act Pedro 4.\nuianfqi vi kjf cia qka vkae	2025-10-24	2025-10-25	\N	15	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 11:21:18.819792
16	Reunion	2025-10-23	2025-10-23	\N	15	4	2	3059b6c4-e784-4fc7-a316-f9e3becfc580	2025-10-23 16:43:17.381776
\.


--
-- Data for Name: tbl_asigna_requerimiento; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_asigna_requerimiento (id_req, id_user_auditoria, fecha_auditoria, id_empleado) FROM stdin;
1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-09 13:21:38.39567	2
1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-09 13:21:38.39567	1
1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-09 13:21:38.39567	3
9	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 10:37:15.041919	2
10	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 11:45:34.166293	1
10	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 14:11:22.176218	4
11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 14:12:04.399732	3
12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 15:25:44.049999	2
12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 15:25:44.049999	1
13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 15:30:29.359467	1
10	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-11 09:25:32.099046	3
1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-17 10:02:10.284862	4
1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-23 14:32:39.237571	5
14	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:44:05.148827	1
14	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:44:42.725179	6
15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 15:52:49.284993	6
15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 15:52:49.284993	5
15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 15:52:49.284993	4
15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 15:52:49.284993	1
\.


--
-- Data for Name: tbl_componentes; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_componentes (id_componente, componente, id_user_auditoria, fecha_auditoria) FROM stdin;
1	SISTEMAS	\N	2025-08-28 11:47:23.329229
2	JURIDICA	\N	2025-08-28 12:59:04.40598
3	MUTACIONES	\N	2025-08-28 14:23:01.824224
\.


--
-- Data for Name: tbl_contratos; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_contratos (id_contrato, num_contrato, fecha_inicio_contrato, fecha_fin_contrato, valor_contrato, supervisor_contrato, id_tipo_contrato, id_entidad, id_user_auditoria, fecha_auditoria, id_empleado, objeto_contrato) FROM stdin;
1	P-1990	2025-09-04	2025-12-31	32435322	Pepe	1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 13:05:49.046983	1	Sin descripción
2	p-125	2025-03-31	2025-08-31	32423212	\N	1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 13:07:00.145361	4	Sin descripción
3	P-13242	2025-09-04	2025-12-31	39438399	Chucho	1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 14:37:43.063954	4	Prestación de servicios como contratista independiente, sin vínculo laboral por su propia cuenta y riesgo para realizar la gestión de Apoyo Profesional en gestión de Sistema de Información Catastral en ejecución del Contrato Interadministrativo No.4600105480 de 2025, celebrado entre EL DISTRITO ESPECIAL DE CIENCIA TECNOLOGÍA E INNOVACIÓN DE MEDELLÍN, SECRETARÍA DE GESTIÓN Y CONTROL TERRITORIAL y el ITM.
\.


--
-- Data for Name: tbl_empleado_componente; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_empleado_componente (id_empl_comp, id_empleado, id_componente, estado, fecha_inicio, fecha_fin, id_user_auditoria, fecha_auditoria) FROM stdin;
1	1	1	inactivo	2025-08-28 13:08:41.106384	2025-08-28 13:10:55.343236	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 13:10:55.343236
2	1	2	inactivo	2025-08-28 13:10:55.343236	2025-08-28 14:23:41.689126	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 14:23:41.689126
3	1	3	activo	2025-08-28 14:23:41.689126	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 14:23:41.689126
4	4	1	activo	2025-08-29 17:41:46.62559	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:41:46.62559
5	3	2	inactivo	2025-08-29 17:42:50.913359	2025-08-29 17:43:36.532894	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:43:36.532894
6	3	3	activo	2025-08-29 17:43:36.532894	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:43:36.532894
7	6	3	activo	2025-10-21 14:43:01.836337	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:43:01.836337
\.


--
-- Data for Name: tbl_empleado_perfil; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_empleado_perfil (id_empl_perf, id_empleado, id_perfil, estado, fecha_inicio, fecha_fin, id_user_auditoria, fecha_auditoria) FROM stdin;
1	1	4	inactivo	2025-08-28 13:07:54.489954	2025-08-28 13:09:52.934905	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 13:09:52.934905
2	1	5	inactivo	2025-08-28 13:09:52.934905	2025-08-28 14:22:30.098663	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 14:22:30.098663
3	1	2	activo	2025-08-28 14:22:30.098663	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 14:22:30.098663
5	3	4	activo	2025-08-29 17:42:15.965174	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:42:15.965174
4	4	2	inactivo	2025-08-29 17:41:46.558913	2025-08-29 17:53:01.612832	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:53:01.612832
6	4	5	inactivo	2025-08-29 17:53:01.612832	2025-10-01 13:09:56.499898	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-01 13:09:56.499898
8	6	2	activo	2025-10-21 14:43:01.788819	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:43:01.788819
7	4	10	inactivo	2025-10-01 13:09:56.499898	2025-10-23 11:13:45.362066	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-23 11:13:45.362066
9	4	2	activo	2025-10-23 11:13:45.362066	\N	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-23 11:13:45.362066
\.


--
-- Data for Name: tbl_empleados_app_sgt_act; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_empleados_app_sgt_act (id_empleado, cedula_empleado, primer_nombre_empl, segundo_nombre_empl, primer_apellido_empl, segundo_apellido_empl, fecha_nacimiento_empl, email_empleado, movil_empleado, estado, id_user_auditoria, fecha_auditoria) FROM stdin;
1	3383821	Victor	Javier	Gonzalez	Escobar	1980-08-17	victorge08@gmail.com	3216276709	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 15:51:33.011208
2	9876543210	Laura	Marcela	Ramirez	Lopez	1992-03-12	victorge08@gmail.com	3008262691	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 15:52:53.318247
3	43168001	Martha	\N	Chores	\N	\N	victorge08@gmail.com	\N	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 17:43:36.520023
5	654321	Juanito	\N	Alimaña	\N	\N	victorge08@gmail.com	\N	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-23 14:31:54.505664
6	66666	Diablo	Negro	Belzebuth	Malak	2000-05-05	victorge08@gmail.com	\N	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:43:01.767794
4	123456	Pedro	\N	Navajas	\N	\N	victorge08@gmail.com	\N	activo	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-23 11:13:45.350764
\.


--
-- Data for Name: tbl_entidad_contratante; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_entidad_contratante (id_entidad, entidad, id_user_auditoria, fecha_auditoria) FROM stdin;
1	ITM	\N	2025-09-08 09:43:14.548505
\.


--
-- Data for Name: tbl_estados; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_estados (id_estado, estado, id_user_auditoria, fecha_auditoria) FROM stdin;
1	POR HACER	\N	2025-08-29 10:06:33.298808
3	FINALIZADO	\N	2025-08-29 10:06:51.25158
2	EN EJECUCIÓN	\N	2025-08-29 10:06:44.21653
\.


--
-- Data for Name: tbl_evidencia_componentes; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_evidencia_componentes (id_evidencia, id_componente, id_user_auditoria, fecha_auditoria) FROM stdin;
\.


--
-- Data for Name: tbl_evidencias; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_evidencias (id_evidencia, url_evidencia, id_user_auditoria, fecha_auditoria) FROM stdin;
1	\\\\nas1\\Alcaldia\\229-GCT\\22920-S-Cat\\U-Gest-E-InvInfCat\\Cmn-Gest-E-InvInfCat\\Administrativa\\2025\\COORDINACIÒN ITM VIGENCIAS FUTURAS\\EVIDENCIAS	\N	2025-08-29 10:09:22.656672
\.


--
-- Data for Name: tbl_menu_app_actividades; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_menu_app_actividades (id_menu, code, descripcion, orden, id_user_auditoria, fecha_auditoria) FROM stdin;
4	ACTIVIDADES	Actividades	4	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:20:08.912412
5	PERFILES	Perfiles	5	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:22:20.256621
8	ENTIDADES	Entidades	8	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:23:05.664945
9	CONTRATOS	Contratos	9	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:23:19.081644
10	REQUERIMIENTOS	Requerimientos	10	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:23:42.0028
11	ACCCIONES	Acciones	11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:24:02.43012
12	SGTO_ACCIONES	Seguimiento Acciones	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:24:19.45212
13	EMPLEADOS	Empleados	13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 10:57:46.529071
14	COMPONENTES	Componentes	14	\N	2025-08-29 13:16:29.826071
15	MIS_ACTIVIDADES	Mis Actividades	15	\N	2025-09-08 15:24:26.21758
16	MIS_REQUERIMIENTOS	Mis Requerimientos	16	\N	2025-09-22 08:58:43.836576
18	VER_INFORMES	Ver Informes	\N	\N	2025-10-27 14:11:40.755098
1	OBLIGACIONES	Oblig. Contractuales	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:17:35.431709
17	INFORME_ACTIVIDADES	Informe Actividades	17	\N	2025-10-14 10:21:18.665121
\.


--
-- Data for Name: tbl_obligacion_contractual; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_obligacion_contractual (id_obligacion, obligacion_contractual, id_user_auditoria, fecha_auditoria) FROM stdin;
2	Entregar informe mensual	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-19 11:09:47.55437
3	Plan de mejora mensual	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-26 10:09:03.401371
8	Prueba 1 de asociación con perfil	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-27 12:45:12.816027
9	Prueba 2 de asociación con perfil	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-27 12:45:21.75416
4	Entregar informe trimestral 	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 18:24:07.793863
10	Entregar informe trimestral 2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-29 18:24:17.539104
11	Brindar asesoría sobre la plataforma SAP y sus transacciones.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
12	Analizar los requerimientos funcionales y no funcionales de la plataforma con las áreas interesadas.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
13	Preparar información alfanumérica y geoespacial para reportes de entes de control.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
14	Realizar auditorías de integridad en bases de datos y corregir inconsistencias.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
15	Realizar pruebas de calidad y seguridad de la información antes de la puesta en producción.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
16	Diseñar y optimizar ETL para la gestión de modelos de datos catastrales (MODELO RIC).	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
17	Automatizar la generación de reportes periódicos (diarios, mensuales o anuales) mediante pipelines ETL.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
18	Apoyar en la formulación e implementación de proyectos tecnológicos.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
19	Generar scripts y consultas SQL para producción de informes.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
20	Diseñar e implementar sistemas de almacenamiento en la nube.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
21	Implementar mapas interactivos utilizando QGIS, Mapbox o Leaflet para representar datos geográficos.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
22	Participar en la capacitación y documentación de procesos.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
23	Realizar pruebas de calidad y seguridad en plataformas catastrales.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
24	Configurar permisos y accesos diferenciados según los roles de los usuarios en el sistema.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
25	Protección de datos sensibles y la implementación de normativas como ISO 27001 o GDPR.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
26	Presentación y entrega de productos en los tiempos requeridos por la Subsecretaría.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
27	Apoyar a los distintos grupos de trabajo en la elaboración de reportes y en la solución de inquietudes relacionadas al funcionamiento de las plataformas catastrales.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
28	Participar y asistir a las diferentes reuniones y/o capacitaciones realizadas en la Subsecretaría por parte del Contratante y/o el coordinador del contrato.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
29	Disponer de horarios asignados para la realización de las actividades contratadas, asegurando la interacción necesaria y fluida entre todos los actores del proceso catastral.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
30	Realizar las actividades asignadas verificando calidad y oportunidad en tiempos de entrega.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
31	Investigar y consultar los diferentes sistemas de información de la Subsecretaría de Catastro.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
32	Reportar las actividades e informes realizados mensualmente.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
33	Realizar las demás actividades que le sean asignadas de acuerdo a la naturaleza del contrato.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
34	Participar y asistir a reuniones y/o capacitaciones realizadas en la Subsecretaría.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
35	Disponer de herramientas y recursos tecnológicos necesarios para el cumplimiento de sus actividades contractuales.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
36	Garantizar la integralidad del expediente catastral y la cadena de custodia de este.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
37	Disponer de horarios asignados para la ejecución sucesiva y oportuna del proceso catastral.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:41:26.463232
\.


--
-- Data for Name: tbl_perfil_obligaciones; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_perfil_obligaciones (id_perfil, id_obligacion, id_user_auditoria, fecha_auditoria) FROM stdin;
10	11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 09:36:11.639328
10	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 09:36:11.639328
10	37	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 09:36:11.639328
7	3	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:33:49.897182
7	4	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:33:49.897182
11	11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 14:28:05.806342
11	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 14:28:05.806342
11	13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 14:28:05.806342
2	11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	14	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	16	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	17	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	18	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	19	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	20	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	21	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	22	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	23	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
8	11	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	12	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	14	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	15	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	16	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	17	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	18	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	19	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	20	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	21	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	22	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	23	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	24	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	25	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	26	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	27	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	28	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	29	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	30	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	31	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	32	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	33	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	34	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	35	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	36	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
8	37	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.021596
2	24	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	25	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	26	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	27	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	28	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	29	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	30	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	31	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	32	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	33	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	34	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	35	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	36	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
2	37	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.126684
5	2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
5	3	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
5	4	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
5	8	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
5	9	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
5	10	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.732375
\.


--
-- Data for Name: tbl_perfiles; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_perfiles (id_perfil, perfil, descripcion_perfil, id_user_auditoria, fecha_auditoria) FROM stdin;
4	Tecnólogo Sistemas	Tecnólogo Sistemas Catastro	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-20 10:02:08.696917
5	Profesional de gestión de sistemas de información catastral	Profesional de gestión de sistemas de información catastral	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-21 11:33:43.700531
6	Perfil para asociar obligación	Perfil para asociar obligación descrip.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:20:41.714188
7	Prueba perfil	Prueba	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 09:33:49.883434
8	Perfil con Excel	Perfil con prueba de relación de obligaciones con excel.	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-05 11:45:06.008987
10	New Profile B	New Profile B	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 09:36:11.628849
11	Nuevo perfil Julio	Nuevo perfil Julio	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-08 14:28:05.793256
2	Analista de sistemas	Analista de sistemas catastro 2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-15 15:12:47.094764
\.


--
-- Data for Name: tbl_requerimiento; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_requerimiento (id_req, descripcion_req, fecha_inicio_req, fecha_fin_req, id_estado, id_user_auditoria, fecha_auditoria) FROM stdin;
11	Prueba R4	2025-09-10	2025-10-31	2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 14:13:50.410119
9	Prueba R2 (editada)	2025-09-10	2025-10-20	3	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 14:21:01.671374
12	Prueba R5	2025-10-01	2025-11-19	3	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-10 15:26:05.335649
10	Prueba R3	2025-09-10	2025-11-30	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-11 09:25:32.099046
1	Prueba R1	2025-09-09	2025-09-10	2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-09-23 14:32:39.237571
13	Prueba R6	2025-09-01	2025-10-31	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:23:53.534781
14	Prueba New	2025-10-01	2025-10-03	2	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 14:44:42.725179
15	Req julio	2025-10-21	2025-10-31	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-10-21 15:52:49.284993
\.


--
-- Data for Name: tbl_rol_menu_actividades; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_rol_menu_actividades (id_role, id_menu, id_user_auditoria, fecha_auditoria) FROM stdin;
1	1	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:18:31.739709
1	5	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-19 10:12:44.049712
1	13	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-28 10:58:44.981331
1	9	\N	2025-08-29 10:13:20.424735
1	10	\N	2025-08-29 10:13:20.425648
1	15	\N	2025-09-08 15:24:40.446802
3	16	d4de7f10-dec2-4a64-b2b8-de8dcc38000e	2025-08-13 10:20:47.251384
1	16	\N	2025-09-22 09:03:28.244029
3	15	\N	2025-09-29 11:02:26.951115
1	17	\N	2025-10-14 10:21:36.956519
3	17	\N	2025-10-15 17:05:26.472135
1	18	\N	2025-10-27 14:12:07.70469
\.


--
-- Data for Name: tbl_role; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_role (id_role, rol_name, create_at) FROM stdin;
1	admon	\N
2	coordinador	\N
3	funcionario	\N
\.


--
-- Data for Name: tbl_sgto_accion_oblig; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_sgto_accion_oblig (id_sgto_accion, id_obligacion, id_user_auditoria, fecha_auditoria) FROM stdin;
\.


--
-- Data for Name: tbl_sgto_acciones; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_sgto_acciones (id_sgto_accion, descripcion_sgto, fecha_sgto, id_accion, id_user_auditoria, fecha_auditoria) FROM stdin;
\.


--
-- Data for Name: tbl_tipos_contrato; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.tbl_tipos_contrato (id_tipo_contrato, contrato, id_user_auditoria, fecha_auditoria) FROM stdin;
1	PRESTACIÓN DE SERVICIOS	\N	2025-08-29 10:08:18.849461
\.


--
-- Name: tbl_actividades_id_actividad_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_actividades_id_actividad_seq', 16, true);


--
-- Name: tbl_componentes_id_componente_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_componentes_id_componente_seq', 3, true);


--
-- Name: tbl_contratos_id_contrato_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_contratos_id_contrato_seq', 3, true);


--
-- Name: tbl_empleado_componente_id_empl_comp_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_empleado_componente_id_empl_comp_seq', 7, true);


--
-- Name: tbl_empleado_perfil_id_empl_perf_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_empleado_perfil_id_empl_perf_seq', 9, true);


--
-- Name: tbl_empleados_app_sgt_act_id_empleado_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_empleados_app_sgt_act_id_empleado_seq', 6, true);


--
-- Name: tbl_entidad_contratante_id_entidad_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_entidad_contratante_id_entidad_seq', 1, true);


--
-- Name: tbl_estados_id_estado_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_estados_id_estado_seq', 3, true);


--
-- Name: tbl_evidencias_id_evidencia_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_evidencias_id_evidencia_seq', 1, true);


--
-- Name: tbl_menu_app_actividades_id_menu_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_menu_app_actividades_id_menu_seq', 18, true);


--
-- Name: tbl_obligacion_contractual_id_obligacion_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_obligacion_contractual_id_obligacion_seq', 37, true);


--
-- Name: tbl_perfiles_id_perfil_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_perfiles_id_perfil_seq', 11, true);


--
-- Name: tbl_requerimiento_id_req_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_requerimiento_id_req_seq', 15, true);


--
-- Name: tbl_sgto_acciones_id_sgto_accion_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_sgto_acciones_id_sgto_accion_seq', 1, false);


--
-- Name: tbl_tipos_contrato_id_tipo_contrato_seq; Type: SEQUENCE SET; Schema: dev; Owner: postgres
--

SELECT pg_catalog.setval('dev.tbl_tipos_contrato_id_tipo_contrato_seq', 1, true);


--
-- Name: tbl_actividad_obligacion tbl_actividad_obligacion_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividad_obligacion
    ADD CONSTRAINT tbl_actividad_obligacion_pkey PRIMARY KEY (id_actividad, id_obligacion);


--
-- Name: tbl_actividades tbl_actividades_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividades
    ADD CONSTRAINT tbl_actividades_pkey PRIMARY KEY (id_actividad);


--
-- Name: tbl_asigna_requerimiento tbl_asigna_requerimiento_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_asigna_requerimiento
    ADD CONSTRAINT tbl_asigna_requerimiento_pkey PRIMARY KEY (id_req, id_empleado);


--
-- Name: tbl_componentes tbl_componentes_componente_key; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_componentes
    ADD CONSTRAINT tbl_componentes_componente_key UNIQUE (componente);


--
-- Name: tbl_componentes tbl_componentes_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_componentes
    ADD CONSTRAINT tbl_componentes_pkey PRIMARY KEY (id_componente);


--
-- Name: tbl_contratos tbl_contratos_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_contratos
    ADD CONSTRAINT tbl_contratos_pkey PRIMARY KEY (id_contrato);


--
-- Name: tbl_empleado_componente tbl_empleado_componente_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_componente
    ADD CONSTRAINT tbl_empleado_componente_pkey PRIMARY KEY (id_empl_comp);


--
-- Name: tbl_empleado_perfil tbl_empleado_perfil_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_perfil
    ADD CONSTRAINT tbl_empleado_perfil_pkey PRIMARY KEY (id_empl_perf);


--
-- Name: tbl_empleados_app_sgt_act tbl_empleados_app_sgt_act_cedula_empleado_key; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleados_app_sgt_act
    ADD CONSTRAINT tbl_empleados_app_sgt_act_cedula_empleado_key UNIQUE (cedula_empleado);


--
-- Name: tbl_empleados_app_sgt_act tbl_empleados_app_sgt_act_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleados_app_sgt_act
    ADD CONSTRAINT tbl_empleados_app_sgt_act_pkey PRIMARY KEY (id_empleado);


--
-- Name: tbl_entidad_contratante tbl_entidad_contratante_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_entidad_contratante
    ADD CONSTRAINT tbl_entidad_contratante_pkey PRIMARY KEY (id_entidad);


--
-- Name: tbl_estados tbl_estados_estado_key; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_estados
    ADD CONSTRAINT tbl_estados_estado_key UNIQUE (estado);


--
-- Name: tbl_estados tbl_estados_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_estados
    ADD CONSTRAINT tbl_estados_pkey PRIMARY KEY (id_estado);


--
-- Name: tbl_evidencia_componentes tbl_evidencia_componentes_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencia_componentes
    ADD CONSTRAINT tbl_evidencia_componentes_pkey PRIMARY KEY (id_evidencia, id_componente);


--
-- Name: tbl_evidencias tbl_evidencias_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencias
    ADD CONSTRAINT tbl_evidencias_pkey PRIMARY KEY (id_evidencia);


--
-- Name: tbl_menu_app_actividades tbl_menu_app_actividades_code_key; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_menu_app_actividades
    ADD CONSTRAINT tbl_menu_app_actividades_code_key UNIQUE (code);


--
-- Name: tbl_menu_app_actividades tbl_menu_app_actividades_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_menu_app_actividades
    ADD CONSTRAINT tbl_menu_app_actividades_pkey PRIMARY KEY (id_menu);


--
-- Name: tbl_obligacion_contractual tbl_obligacion_contractual_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_obligacion_contractual
    ADD CONSTRAINT tbl_obligacion_contractual_pkey PRIMARY KEY (id_obligacion);


--
-- Name: tbl_perfil_obligaciones tbl_perfil_obligaciones_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfil_obligaciones
    ADD CONSTRAINT tbl_perfil_obligaciones_pkey PRIMARY KEY (id_perfil, id_obligacion);


--
-- Name: tbl_perfiles tbl_perfiles_perfil_key; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfiles
    ADD CONSTRAINT tbl_perfiles_perfil_key UNIQUE (perfil);


--
-- Name: tbl_perfiles tbl_perfiles_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfiles
    ADD CONSTRAINT tbl_perfiles_pkey PRIMARY KEY (id_perfil);


--
-- Name: tbl_requerimiento tbl_requerimiento_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_requerimiento
    ADD CONSTRAINT tbl_requerimiento_pkey PRIMARY KEY (id_req);


--
-- Name: tbl_rol_menu_actividades tbl_rol_menu_actividades_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_rol_menu_actividades
    ADD CONSTRAINT tbl_rol_menu_actividades_pkey PRIMARY KEY (id_role, id_menu);


--
-- Name: tbl_role tbl_role_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_role
    ADD CONSTRAINT tbl_role_pkey PRIMARY KEY (id_role);


--
-- Name: tbl_sgto_accion_oblig tbl_sgto_accion_oblig_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_accion_oblig
    ADD CONSTRAINT tbl_sgto_accion_oblig_pkey PRIMARY KEY (id_sgto_accion, id_obligacion);


--
-- Name: tbl_sgto_acciones tbl_sgto_acciones_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_acciones
    ADD CONSTRAINT tbl_sgto_acciones_pkey PRIMARY KEY (id_sgto_accion);


--
-- Name: tbl_tipos_contrato tbl_tipos_contrato_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_tipos_contrato
    ADD CONSTRAINT tbl_tipos_contrato_pkey PRIMARY KEY (id_tipo_contrato);


--
-- Name: tbl_empleado_componente uq_tbl_empleado_componente_inicio; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_componente
    ADD CONSTRAINT uq_tbl_empleado_componente_inicio UNIQUE (id_empleado, id_componente, fecha_inicio);


--
-- Name: tbl_empleado_perfil uq_tbl_empleado_perfil_inicio; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_perfil
    ADD CONSTRAINT uq_tbl_empleado_perfil_inicio UNIQUE (id_empleado, id_perfil, fecha_inicio);


--
-- Name: idx_act_obl_acc; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_act_obl_acc ON dev.tbl_actividad_obligacion USING btree (id_actividad);


--
-- Name: idx_act_obl_obl; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_act_obl_obl ON dev.tbl_actividad_obligacion USING btree (id_obligacion);


--
-- Name: idx_act_obl_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_act_obl_user_aud ON dev.tbl_actividad_obligacion USING btree (id_user_auditoria);


--
-- Name: idx_asig_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_asig_empleado ON dev.tbl_asigna_requerimiento USING btree (id_empleado);


--
-- Name: idx_asig_req; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_asig_req ON dev.tbl_asigna_requerimiento USING btree (id_req);


--
-- Name: idx_asig_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_asig_user_aud ON dev.tbl_asigna_requerimiento USING btree (id_user_auditoria);


--
-- Name: idx_cedula_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_cedula_empleado ON dev.tbl_empleados_app_sgt_act USING btree (cedula_empleado);


--
-- Name: idx_componentes_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_componentes_user_aud ON dev.tbl_componentes USING btree (id_user_auditoria);


--
-- Name: idx_contratos_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_contratos_empleado ON dev.tbl_contratos USING btree (id_empleado);


--
-- Name: idx_contratos_ent; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_contratos_ent ON dev.tbl_contratos USING btree (id_entidad);


--
-- Name: idx_contratos_tipo; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_contratos_tipo ON dev.tbl_contratos USING btree (id_tipo_contrato);


--
-- Name: idx_contratos_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_contratos_user_aud ON dev.tbl_contratos USING btree (id_user_auditoria);


--
-- Name: idx_ec_id_componente; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_ec_id_componente ON dev.tbl_empleado_componente USING btree (id_componente);


--
-- Name: idx_ec_id_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_ec_id_empleado ON dev.tbl_empleado_componente USING btree (id_empleado);


--
-- Name: idx_ec_id_user_auditoria_empleado_componente; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_ec_id_user_auditoria_empleado_componente ON dev.tbl_empleado_componente USING btree (id_user_auditoria);


--
-- Name: idx_email_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_email_empleado ON dev.tbl_empleados_app_sgt_act USING btree (email_empleado);


--
-- Name: idx_entidad_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_entidad_user_aud ON dev.tbl_entidad_contratante USING btree (id_user_auditoria);


--
-- Name: idx_estado_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_estado_empleado ON dev.tbl_empleados_app_sgt_act USING btree (estado);


--
-- Name: idx_estados_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_estados_user_aud ON dev.tbl_estados USING btree (id_user_auditoria);


--
-- Name: idx_evid_comp_comp; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_evid_comp_comp ON dev.tbl_evidencia_componentes USING btree (id_componente);


--
-- Name: idx_evid_comp_evid; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_evid_comp_evid ON dev.tbl_evidencia_componentes USING btree (id_evidencia);


--
-- Name: idx_evid_comp_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_evid_comp_user_aud ON dev.tbl_evidencia_componentes USING btree (id_user_auditoria);


--
-- Name: idx_evid_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_evid_user_aud ON dev.tbl_evidencias USING btree (id_user_auditoria);


--
-- Name: idx_id_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_id_empleado ON dev.tbl_empleado_perfil USING btree (id_empleado);


--
-- Name: idx_id_perfil; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_id_perfil ON dev.tbl_empleado_perfil USING btree (id_perfil);


--
-- Name: idx_id_user_auditoria; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_id_user_auditoria ON dev.tbl_empleados_app_sgt_act USING btree (id_user_auditoria);


--
-- Name: idx_id_user_auditoria_empleado_perfil; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_id_user_auditoria_empleado_perfil ON dev.tbl_empleado_perfil USING btree (id_user_auditoria);


--
-- Name: idx_menu_user_auditoria; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_menu_user_auditoria ON dev.tbl_menu_app_actividades USING btree (id_user_auditoria);


--
-- Name: idx_obl_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_obl_user_aud ON dev.tbl_obligacion_contractual USING btree (id_user_auditoria);


--
-- Name: idx_perfil_obl_oblig; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_perfil_obl_oblig ON dev.tbl_perfil_obligaciones USING btree (id_obligacion);


--
-- Name: idx_perfil_obl_perfil; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_perfil_obl_perfil ON dev.tbl_perfil_obligaciones USING btree (id_perfil);


--
-- Name: idx_perfil_obl_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_perfil_obl_user_aud ON dev.tbl_perfil_obligaciones USING btree (id_user_auditoria);


--
-- Name: idx_perfiles_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_perfiles_user_aud ON dev.tbl_perfiles USING btree (id_user_auditoria);


--
-- Name: idx_primer_apellido_empl; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_primer_apellido_empl ON dev.tbl_empleados_app_sgt_act USING btree (primer_apellido_empl);


--
-- Name: idx_primer_nombre_empl; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_primer_nombre_empl ON dev.tbl_empleados_app_sgt_act USING btree (primer_nombre_empl);


--
-- Name: idx_req_estado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_req_estado ON dev.tbl_requerimiento USING btree (id_estado);


--
-- Name: idx_req_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_req_user_aud ON dev.tbl_requerimiento USING btree (id_user_auditoria);


--
-- Name: idx_rol_menu_menu; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_rol_menu_menu ON dev.tbl_rol_menu_actividades USING btree (id_menu);


--
-- Name: idx_rol_menu_role; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_rol_menu_role ON dev.tbl_rol_menu_actividades USING btree (id_role);


--
-- Name: idx_rol_menu_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_rol_menu_user_aud ON dev.tbl_rol_menu_actividades USING btree (id_user_auditoria);


--
-- Name: idx_sgto_accion_acc; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_sgto_accion_acc ON dev.tbl_sgto_acciones USING btree (id_accion);


--
-- Name: idx_sgto_accion_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_sgto_accion_user_aud ON dev.tbl_sgto_acciones USING btree (id_user_auditoria);


--
-- Name: idx_sgto_obl_obl; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_sgto_obl_obl ON dev.tbl_sgto_accion_oblig USING btree (id_obligacion);


--
-- Name: idx_sgto_obl_sgto; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_sgto_obl_sgto ON dev.tbl_sgto_accion_oblig USING btree (id_sgto_accion);


--
-- Name: idx_sgto_obl_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_sgto_obl_user_aud ON dev.tbl_sgto_accion_oblig USING btree (id_user_auditoria);


--
-- Name: idx_tbl_actividades_id_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_tbl_actividades_id_empleado ON dev.tbl_actividades USING btree (id_empleado);


--
-- Name: idx_tbl_actividades_id_estado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_tbl_actividades_id_estado ON dev.tbl_actividades USING btree (id_estado);


--
-- Name: idx_tbl_actividades_id_req; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_tbl_actividades_id_req ON dev.tbl_actividades USING btree (id_req);


--
-- Name: idx_tbl_actividades_id_user_auditoria; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_tbl_actividades_id_user_auditoria ON dev.tbl_actividades USING btree (id_user_auditoria);


--
-- Name: idx_tipos_contrato_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_tipos_contrato_user_aud ON dev.tbl_tipos_contrato USING btree (id_user_auditoria);


--
-- Name: uq_tbl_empleado_componente_activo; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE UNIQUE INDEX uq_tbl_empleado_componente_activo ON dev.tbl_empleado_componente USING btree (id_empleado, id_componente) WHERE ((fecha_fin IS NULL) AND (estado = 'activo'::text));


--
-- Name: uq_tbl_empleado_perfil_activo; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE UNIQUE INDEX uq_tbl_empleado_perfil_activo ON dev.tbl_empleado_perfil USING btree (id_empleado, id_perfil) WHERE ((fecha_fin IS NULL) AND (estado = 'activo'::text));


--
-- Name: tbl_actividad_obligacion fk_act_obl_acc; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividad_obligacion
    ADD CONSTRAINT fk_act_obl_acc FOREIGN KEY (id_actividad) REFERENCES dev.tbl_actividades(id_actividad) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_actividad_obligacion fk_act_obl_obl; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividad_obligacion
    ADD CONSTRAINT fk_act_obl_obl FOREIGN KEY (id_obligacion) REFERENCES dev.tbl_obligacion_contractual(id_obligacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_actividad_obligacion fk_act_obl_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividad_obligacion
    ADD CONSTRAINT fk_act_obl_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_asigna_requerimiento fk_asig_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_asigna_requerimiento
    ADD CONSTRAINT fk_asig_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_asigna_requerimiento fk_asig_req; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_asigna_requerimiento
    ADD CONSTRAINT fk_asig_req FOREIGN KEY (id_req) REFERENCES dev.tbl_requerimiento(id_req) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_asigna_requerimiento fk_asig_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_asigna_requerimiento
    ADD CONSTRAINT fk_asig_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_componentes fk_componente_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_componentes
    ADD CONSTRAINT fk_componente_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_contratos fk_contrato_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_contratos
    ADD CONSTRAINT fk_contrato_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_contratos fk_contrato_ent; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_contratos
    ADD CONSTRAINT fk_contrato_ent FOREIGN KEY (id_entidad) REFERENCES dev.tbl_entidad_contratante(id_entidad) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_contratos fk_contrato_tipo; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_contratos
    ADD CONSTRAINT fk_contrato_tipo FOREIGN KEY (id_tipo_contrato) REFERENCES dev.tbl_tipos_contrato(id_tipo_contrato) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_contratos fk_contrato_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_contratos
    ADD CONSTRAINT fk_contrato_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_empleado_componente fk_ec_componente; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_componente
    ADD CONSTRAINT fk_ec_componente FOREIGN KEY (id_componente) REFERENCES dev.tbl_componentes(id_componente) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_empleado_componente fk_ec_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_componente
    ADD CONSTRAINT fk_ec_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_empleado_componente fk_ec_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_componente
    ADD CONSTRAINT fk_ec_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_empleado_perfil fk_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_perfil
    ADD CONSTRAINT fk_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_actividades fk_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividades
    ADD CONSTRAINT fk_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_entidad_contratante fk_entidad_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_entidad_contratante
    ADD CONSTRAINT fk_entidad_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_actividades fk_estado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividades
    ADD CONSTRAINT fk_estado FOREIGN KEY (id_estado) REFERENCES dev.tbl_estados(id_estado) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_estados fk_estado_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_estados
    ADD CONSTRAINT fk_estado_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_evidencia_componentes fk_evid_comp_comp; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencia_componentes
    ADD CONSTRAINT fk_evid_comp_comp FOREIGN KEY (id_componente) REFERENCES dev.tbl_componentes(id_componente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_evidencia_componentes fk_evid_comp_evid; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencia_componentes
    ADD CONSTRAINT fk_evid_comp_evid FOREIGN KEY (id_evidencia) REFERENCES dev.tbl_evidencias(id_evidencia) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_evidencia_componentes fk_evid_comp_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencia_componentes
    ADD CONSTRAINT fk_evid_comp_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_evidencias fk_evid_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_evidencias
    ADD CONSTRAINT fk_evid_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_menu_app_actividades fk_menu_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_menu_app_actividades
    ADD CONSTRAINT fk_menu_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_obligacion_contractual fk_obl_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_obligacion_contractual
    ADD CONSTRAINT fk_obl_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_empleado_perfil fk_perfil; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_perfil
    ADD CONSTRAINT fk_perfil FOREIGN KEY (id_perfil) REFERENCES dev.tbl_perfiles(id_perfil) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_perfil_obligaciones fk_perfil_obl_oblig; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfil_obligaciones
    ADD CONSTRAINT fk_perfil_obl_oblig FOREIGN KEY (id_obligacion) REFERENCES dev.tbl_obligacion_contractual(id_obligacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_perfil_obligaciones fk_perfil_obl_perfil; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfil_obligaciones
    ADD CONSTRAINT fk_perfil_obl_perfil FOREIGN KEY (id_perfil) REFERENCES dev.tbl_perfiles(id_perfil) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_perfil_obligaciones fk_perfil_obl_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfil_obligaciones
    ADD CONSTRAINT fk_perfil_obl_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_perfiles fk_perfil_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_perfiles
    ADD CONSTRAINT fk_perfil_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_actividades fk_req; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividades
    ADD CONSTRAINT fk_req FOREIGN KEY (id_req) REFERENCES dev.tbl_requerimiento(id_req) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_requerimiento fk_req_estado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_requerimiento
    ADD CONSTRAINT fk_req_estado FOREIGN KEY (id_estado) REFERENCES dev.tbl_estados(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_requerimiento fk_req_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_requerimiento
    ADD CONSTRAINT fk_req_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_rol_menu_actividades fk_rol_menu_menu; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_rol_menu_actividades
    ADD CONSTRAINT fk_rol_menu_menu FOREIGN KEY (id_menu) REFERENCES dev.tbl_menu_app_actividades(id_menu) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_rol_menu_actividades fk_rol_menu_role; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_rol_menu_actividades
    ADD CONSTRAINT fk_rol_menu_role FOREIGN KEY (id_role) REFERENCES dev.tbl_role(id_role) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_rol_menu_actividades fk_rol_menu_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_rol_menu_actividades
    ADD CONSTRAINT fk_rol_menu_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_sgto_acciones fk_sgto_accion_acc; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_acciones
    ADD CONSTRAINT fk_sgto_accion_acc FOREIGN KEY (id_accion) REFERENCES dev.tbl_acciones(id_accion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_sgto_acciones fk_sgto_accion_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_acciones
    ADD CONSTRAINT fk_sgto_accion_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_sgto_accion_oblig fk_sgto_obl_obl; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_accion_oblig
    ADD CONSTRAINT fk_sgto_obl_obl FOREIGN KEY (id_obligacion) REFERENCES dev.tbl_obligacion_contractual(id_obligacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_sgto_accion_oblig fk_sgto_obl_sgto; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_accion_oblig
    ADD CONSTRAINT fk_sgto_obl_sgto FOREIGN KEY (id_sgto_accion) REFERENCES dev.tbl_sgto_acciones(id_sgto_accion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_sgto_accion_oblig fk_sgto_obl_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_sgto_accion_oblig
    ADD CONSTRAINT fk_sgto_obl_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_tipos_contrato fk_tipo_contrato_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_tipos_contrato
    ADD CONSTRAINT fk_tipo_contrato_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_actividades fk_user; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_actividades
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_empleados_app_sgt_act fk_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleados_app_sgt_act
    ADD CONSTRAINT fk_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_empleado_perfil fk_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_empleado_perfil
    ADD CONSTRAINT fk_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

