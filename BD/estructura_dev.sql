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
-- Name: tbl_accion_obligacion; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_accion_obligacion (
    id_accion bigint NOT NULL,
    id_obligacion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE dev.tbl_accion_obligacion OWNER TO postgres;

--
-- Name: tbl_acciones; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.tbl_acciones (
    id_accion bigint NOT NULL,
    accion text NOT NULL,
    fecha_inicio_accion date,
    fecha_fin_programada date,
    fecha_fin_accion date,
    id_req bigint NOT NULL,
    id_estado bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone DEFAULT now() NOT NULL,
    id_empleado bigint NOT NULL,
    CONSTRAINT chk_accion_fechas CHECK ((((fecha_fin_programada IS NULL) OR (fecha_fin_programada >= fecha_inicio_accion)) AND ((fecha_fin_accion IS NULL) OR (fecha_fin_accion >= fecha_inicio_accion))))
);


ALTER TABLE dev.tbl_acciones OWNER TO postgres;

--
-- Name: tbl_acciones_id_accion_seq; Type: SEQUENCE; Schema: dev; Owner: postgres
--

ALTER TABLE dev.tbl_acciones ALTER COLUMN id_accion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dev.tbl_acciones_id_accion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
-- Name: tbl_accion_obligacion tbl_accion_obligacion_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_accion_obligacion
    ADD CONSTRAINT tbl_accion_obligacion_pkey PRIMARY KEY (id_accion, id_obligacion);


--
-- Name: tbl_acciones tbl_acciones_pkey; Type: CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_acciones
    ADD CONSTRAINT tbl_acciones_pkey PRIMARY KEY (id_accion);


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
-- Name: idx_acc_obl_acc; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acc_obl_acc ON dev.tbl_accion_obligacion USING btree (id_accion);


--
-- Name: idx_acc_obl_obl; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acc_obl_obl ON dev.tbl_accion_obligacion USING btree (id_obligacion);


--
-- Name: idx_acc_obl_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acc_obl_user_aud ON dev.tbl_accion_obligacion USING btree (id_user_auditoria);


--
-- Name: idx_acciones_empleado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acciones_empleado ON dev.tbl_acciones USING btree (id_empleado);


--
-- Name: idx_acciones_estado; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acciones_estado ON dev.tbl_acciones USING btree (id_estado);


--
-- Name: idx_acciones_req; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acciones_req ON dev.tbl_acciones USING btree (id_req);


--
-- Name: idx_acciones_user_aud; Type: INDEX; Schema: dev; Owner: postgres
--

CREATE INDEX idx_acciones_user_aud ON dev.tbl_acciones USING btree (id_user_auditoria);


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
-- Name: tbl_accion_obligacion fk_acc_obl_acc; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_accion_obligacion
    ADD CONSTRAINT fk_acc_obl_acc FOREIGN KEY (id_accion) REFERENCES dev.tbl_acciones(id_accion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_accion_obligacion fk_acc_obl_obl; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_accion_obligacion
    ADD CONSTRAINT fk_acc_obl_obl FOREIGN KEY (id_obligacion) REFERENCES dev.tbl_obligacion_contractual(id_obligacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_accion_obligacion fk_acc_obl_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_accion_obligacion
    ADD CONSTRAINT fk_acc_obl_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tbl_acciones fk_accion_empleado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_acciones
    ADD CONSTRAINT fk_accion_empleado FOREIGN KEY (id_empleado) REFERENCES dev.tbl_empleados_app_sgt_act(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_acciones fk_accion_estado; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_acciones
    ADD CONSTRAINT fk_accion_estado FOREIGN KEY (id_estado) REFERENCES dev.tbl_estados(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tbl_acciones fk_accion_req; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_acciones
    ADD CONSTRAINT fk_accion_req FOREIGN KEY (id_req) REFERENCES dev.tbl_requerimiento(id_req) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tbl_acciones fk_accion_user_auditoria; Type: FK CONSTRAINT; Schema: dev; Owner: postgres
--

ALTER TABLE ONLY dev.tbl_acciones
    ADD CONSTRAINT fk_accion_user_auditoria FOREIGN KEY (id_user_auditoria) REFERENCES dev.tbl_users(id_user) ON UPDATE CASCADE ON DELETE SET NULL;


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

