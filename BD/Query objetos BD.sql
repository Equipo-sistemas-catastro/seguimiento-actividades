--DEFINE EL ESQUEMA DE LA BD
SET search_path TO sgto_actividades;


/*************************
1. CREA LA TABLA DE ROLES 
*************************/
CREATE TABLE IF NOT EXISTS tbl_roles_sgto_act
(
    id_role integer NOT NULL,
    rol_name character varying COLLATE pg_catalog."default",
    create_at date,
    CONSTRAINT tbl_roles_sgto_act_pkey PRIMARY KEY (id_role)
)

/*************************
2. CREA LA TABLA tbl_usuarios_sgto_act 
***************************/
CREATE TABLE tbl_usuarios_sgto_act (
    id_user uuid NOT NULL,
    name_user character(100) COLLATE pg_catalog."default",
    email_user character(100) COLLATE pg_catalog."default",
    user_password character(50) COLLATE pg_catalog."default",
    id_role_user integer,
    id_programm_user integer,
    id_dependency_user integer,
    create_at date,
    sap_user character(100) COLLATE pg_catalog."default",
    reset_token text COLLATE pg_catalog."default",
    reset_token_expires timestamp without time zone,
    cedula_user bigint,
    CONSTRAINT tbl_users_pkey PRIMARY KEY (id_user),
    CONSTRAINT fk_user_role FOREIGN KEY (id_role_user)
        REFERENCES tbl_roles_sgto_act (id_role) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_users_cedula_user
    ON tbl_users USING btree
    (cedula_user ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_users_id_role_user
    ON tbl_users USING btree
    (id_role_user ASC NULLS LAST);


/*************************
3. CREA LA TABLA DE MENÚ DE LA APLICACIÓN
*************************/
CREATE TABLE tbl_menu_app_actividades (
  id_menu BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  descripcion     TEXT,
  orden           INTEGER,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_menu_user_auditoria
    FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_menu_user_auditoria ON tbl_menu_app_actividades(id_user_auditoria);


/*************************
4. CREA LA TABLA LA RELACIÓN MENÚ y ROL (para perfilar la aplicación)
*************************/
CREATE TABLE tbl_rol_menu_actividades (
  id_role integer NOT NULL,
  id_menu BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
   PRIMARY KEY(id_role,id_menu),
  CONSTRAINT fk_rol_menu_role FOREIGN KEY (id_role)
    REFERENCES tbl_roles_sgto_act(id_role)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_rol_menu_menu FOREIGN KEY (id_menu)
    REFERENCES tbl_menu_app_actividades(id_menu)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_rol_menu_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_rol_menu_role ON tbl_rol_menu_actividades(id_role);
CREATE INDEX IF NOT EXISTS idx_rol_menu_menu ON tbl_rol_menu_actividades(id_menu);
CREATE INDEX IF NOT EXISTS idx_rol_menu_user_aud ON tbl_rol_menu_actividades(id_user_auditoria);



/*************************
5. CREA LA TABLA tbl_perfiles
***************************/
CREATE TABLE tbl_perfiles (
  id_perfil BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  perfil           TEXT NOT NULL UNIQUE,
  descripcion_perfil TEXT,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_perfil_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_perfiles_user_aud ON tbl_perfiles(id_user_auditoria);


/*************************
6. CREA LA TABLA tbl_componentes
***************************/
CREATE TABLE tbl_componentes (
  id_componente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  componente       TEXT NOT NULL UNIQUE,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_componente_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_componentes_user_aud ON tbl_componentes(id_user_auditoria);


/*************************
7. CREA LA TABLA tbl_obligacion_contractual
***************************/
CREATE TABLE tbl_obligacion_contractual (
  id_obligacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  obligacion_contractual TEXT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_obl_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_obl_user_aud ON tbl_obligacion_contractual(id_user_auditoria);


/*************************
8. CREA LA TABLA tbl_perfil_obligaciones
***************************/
CREATE TABLE tbl_perfil_obligaciones (
  id_perfil BIGINT NOT NULL,
  id_obligacion BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_perfil, id_obligacion),
  CONSTRAINT fk_perfil_obl_perfil FOREIGN KEY (id_perfil)
    REFERENCES tbl_perfiles(id_perfil)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_perfil_obl_oblig FOREIGN KEY (id_obligacion)
    REFERENCES tbl_obligacion_contractual(id_obligacion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_perfil_obl_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_perfil_obl_perfil   ON tbl_perfil_obligaciones(id_perfil);
CREATE INDEX IF NOT EXISTS idx_perfil_obl_oblig    ON tbl_perfil_obligaciones(id_obligacion);
CREATE INDEX IF NOT EXISTS idx_perfil_obl_user_aud ON tbl_perfil_obligaciones(id_user_auditoria);


/*************************
9. CREA LA TABLA tbl_evidencias
***************************/
CREATE TABLE tbl_evidencias (
  id_evidencia BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url_evidencia VARCHAR(300) NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_evid_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_evid_user_aud ON tbl_evidencias(id_user_auditoria);


/*************************
10. CREA LA TABLA tbl_evidencia_componentes
***************************/
CREATE TABLE tbl_evidencia_componentes (
  id_evidencia BIGINT,
  id_componente BIGINT,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_evidencia, id_componente),
  CONSTRAINT fk_evid_comp_evid FOREIGN KEY (id_evidencia)
    REFERENCES tbl_evidencias(id_evidencia)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_evid_comp_comp FOREIGN KEY (id_componente)
    REFERENCES tbl_componentes(id_componente)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_evid_comp_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_evid_comp_evid     ON tbl_evidencia_componentes(id_evidencia);
CREATE INDEX IF NOT EXISTS idx_evid_comp_comp     ON tbl_evidencia_componentes(id_componente);
CREATE INDEX IF NOT EXISTS idx_evid_comp_user_aud ON tbl_evidencia_componentes(id_user_auditoria);


/*************************
11. CREA LA TABLA tbl_empleados_app_sgt_act
***************************/
CREATE TABLE tbl_empleados_app_sgt_act (
    id_empleado bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cedula_empleado bigint NOT NULL UNIQUE,
    primer_nombre_empl text NOT NULL,
    segundo_nombre_empl text,
    primer_apellido_empl text NOT NULL,
    segundo_apellido_empl text,
    fecha_nacimiento_empl date,
    email_empleado text NOT NULL UNIQUE,
    movil_empleado bigint,
    estado text NOT NULL DEFAULT 'activo',
    id_user_auditoria uuid,
    fecha_auditoria timestamp NOT NULL DEFAULT now(),
    -- Constraints
    CONSTRAINT ck_empleado_estado CHECK (
        estado IN ('activo', 'inactivo')
    ),
    CONSTRAINT ck_fecha_nacimiento_valida CHECK (
        fecha_nacimiento_empl IS NULL
        OR (
            fecha_nacimiento_empl >= DATE '1900-01-01'
            AND fecha_nacimiento_empl <= CURRENT_DATE
        )
    ),
    -- Foreign Key
    CONSTRAINT fk_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Índices adicionales (si se desea optimizar búsqueda)
CREATE INDEX idx_cedula_empleado ON tbl_empleados_app_sgt_act (cedula_empleado);
CREATE INDEX idx_primer_nombre_empl ON tbl_empleados_app_sgt_act (primer_nombre_empl);
CREATE INDEX idx_primer_apellido_empl ON tbl_empleados_app_sgt_act (primer_apellido_empl);
CREATE INDEX idx_email_empleado ON tbl_empleados_app_sgt_act (email_empleado);
CREATE INDEX idx_estado_empleado ON tbl_empleados_app_sgt_act (estado);
CREATE INDEX idx_id_user_auditoria ON tbl_empleados_app_sgt_act (id_user_auditoria);



/*************************
12. CREA LA TABLA tbl_empleado_perfil
***************************/
CREATE TABLE tbl_empleado_perfil (
    id_empl_perf bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empleado bigint NOT NULL,
    id_perfil bigint NOT NULL,
    estado text NOT NULL DEFAULT 'activo',
    fecha_inicio timestamp NOT NULL DEFAULT now(),
    fecha_fin timestamp,
    id_user_auditoria uuid,
    fecha_auditoria timestamp NOT NULL DEFAULT now(),
    -- Constraints
    CONSTRAINT ck_rep_estado CHECK (
        estado IN ('activo', 'inactivo')
    ),
    CONSTRAINT uq_tbl_empleado_perfil_inicio UNIQUE (
        id_empleado, id_perfil, fecha_inicio
    ),
    -- Foreign Keys
    CONSTRAINT fk_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_perfil FOREIGN KEY (id_perfil)
        REFERENCES tbl_perfiles (id_perfil)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_id_empleado ON tbl_empleado_perfil (id_empleado);
CREATE INDEX idx_id_perfil ON tbl_empleado_perfil (id_perfil);
CREATE INDEX idx_id_user_auditoria_empleado_perfil ON tbl_empleado_perfil (id_user_auditoria);

-- Evitar múltiples asignaciones activas del mismo perfil al mismo empleado
CREATE UNIQUE INDEX IF NOT EXISTS uq_tbl_empleado_perfil_activo
ON tbl_empleado_perfil (id_empleado, id_perfil)
WHERE fecha_fin IS NULL AND estado = 'activo';



/*************************
13. CREA LA TABLA tbl_empleado_componente
***************************/
CREATE TABLE tbl_empleado_componente (
    id_empl_comp bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empleado bigint NOT NULL,
    id_componente bigint NOT NULL,
    estado text NOT NULL DEFAULT 'activo',
    fecha_inicio timestamp NOT NULL DEFAULT now(),
    fecha_fin timestamp,
    id_user_auditoria uuid,
    fecha_auditoria timestamp NOT NULL DEFAULT now(),
    -- Constraints
    CONSTRAINT ck_rec_estado CHECK (
        estado IN ('activo', 'inactivo')
    ),
    CONSTRAINT uq_tbl_empleado_componente_inicio UNIQUE (
        id_empleado, id_componente, fecha_inicio
    ),
    -- Foreign Keys
    CONSTRAINT fk_ec_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ec_componente FOREIGN KEY (id_componente)
        REFERENCES tbl_componentes (id_componente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ec_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_ec_id_empleado ON tbl_empleado_componente (id_empleado);
CREATE INDEX idx_ec_id_componente ON tbl_empleado_componente (id_componente);
CREATE INDEX idx_ec_id_user_auditoria_empleado_componente ON tbl_empleado_componente (id_user_auditoria);

-- Evitar múltiples asignaciones activas del mismo componente
CREATE UNIQUE INDEX IF NOT EXISTS uq_tbl_empleado_componente_activo
ON tbl_empleado_componente (id_empleado, id_componente)
WHERE fecha_fin IS NULL AND estado = 'activo';



/*************************
14. CREA LA TABLA tbl_entidad_contratante
***************************/
CREATE TABLE tbl_entidad_contratante (
  id_entidad BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entidad VARCHAR(100) NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_entidad_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_entidad_user_aud ON tbl_entidad_contratante(id_user_auditoria);


/*************************
15. CREA LA TABLA tbl_tipos_contrato
***************************/
CREATE TABLE tbl_tipos_contrato (
  id_tipo_contrato BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contrato VARCHAR(30) NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_tipo_contrato_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_tipos_contrato_user_aud ON tbl_tipos_contrato(id_user_auditoria);



/*************************
16. CREA LA TABLA tbl_contratos
***************************/
CREATE TABLE tbl_contratos
(
    id_contrato bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    num_contrato character varying(20) COLLATE pg_catalog."default" NOT NULL,
    fecha_inicio_contrato date,
    fecha_fin_contrato date,
    valor_contrato numeric(12,0),
    supervisor_contrato text COLLATE pg_catalog."default",
    id_tipo_contrato bigint NOT NULL,
    id_entidad bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone NOT NULL DEFAULT now(),
    id_empleado bigint NOT NULL,
	objeto_contrato text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tbl_contratos_pkey PRIMARY KEY (id_contrato),
    CONSTRAINT fk_contrato_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_ent FOREIGN KEY (id_entidad)
        REFERENCES tbl_entidad_contratante (id_entidad) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_tipo FOREIGN KEY (id_tipo_contrato)
        REFERENCES tbl_tipos_contrato (id_tipo_contrato) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_contrato_fechas CHECK (fecha_fin_contrato IS NULL OR fecha_fin_contrato >= fecha_inicio_contrato)
);

CREATE INDEX IF NOT EXISTS idx_contratos_empleado
    ON tbl_contratos USING btree
    (id_empleado ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contratos_ent
    ON tbl_contratos USING btree
    (id_entidad ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contratos_tipo
    ON tbl_contratos USING btree
    (id_tipo_contrato ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contratos_user_aud
    ON tbl_contratos USING btree
    (id_user_auditoria ASC NULLS LAST)
    TABLESPACE pg_default;


/*************************
17. CREA LA TABLA tbl_estados
***************************/
CREATE TABLE tbl_estados (
  id_estado BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado VARCHAR(100) NOT NULL UNIQUE,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_estado_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_estados_user_aud ON tbl_estados(id_user_auditoria);



/*************************
18. CREA LA TABLA tbl_requerimiento
***************************/
CREATE TABLE tbl_requerimiento (
  id_req BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion_req TEXT NOT NULL,
  fecha_inicio_req DATE,
  fecha_fin_req DATE,
  id_estado BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_req_estado FOREIGN KEY (id_estado)
    REFERENCES tbl_estados(id_estado)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_req_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_req_fechas CHECK (fecha_fin_req IS NULL OR fecha_fin_req >= fecha_inicio_req)
);
CREATE INDEX IF NOT EXISTS idx_req_estado     ON tbl_requerimiento(id_estado);
CREATE INDEX IF NOT EXISTS idx_req_user_aud   ON tbl_requerimiento(id_user_auditoria);


/*************************
19. CREA LA TABLA tbl_asigna_requerimiento
***************************/
CREATE TABLE tbl_asigna_requerimiento
(
    id_req bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone NOT NULL DEFAULT now(),
    id_empleado bigint NOT NULL,
    CONSTRAINT tbl_asigna_requerimiento_pkey PRIMARY KEY (id_req, id_empleado),
    CONSTRAINT fk_asig_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_asig_req FOREIGN KEY (id_req)
        REFERENCES tbl_requerimiento (id_req) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_asig_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_asig_empleado
    ON tbl_asigna_requerimiento USING btree
    (id_empleado ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_asig_req
    ON tbl_asigna_requerimiento USING btree
    (id_req ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_asig_user_aud
    ON tbl_asigna_requerimiento USING btree
    (id_user_auditoria ASC NULLS LAST)
    TABLESPACE pg_default;

/*************************
20. CREA LA TABLA tbl_acciones
***************************/
CREATE TABLE tbl_acciones
(
    id_accion bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    accion text COLLATE pg_catalog."default" NOT NULL,
    fecha_inicio_accion date,
    fecha_fin_programada date,
    fecha_fin_accion date,
    id_req bigint NOT NULL,
    id_estado bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone NOT NULL DEFAULT now(),
    id_empleado bigint NOT NULL,
    CONSTRAINT tbl_acciones_pkey PRIMARY KEY (id_accion),
    CONSTRAINT fk_accion_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_accion_estado FOREIGN KEY (id_estado)
        REFERENCES tbl_estados (id_estado) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_accion_req FOREIGN KEY (id_req)
        REFERENCES tbl_requerimiento (id_req) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_accion_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_accion_fechas CHECK ((fecha_fin_programada IS NULL OR fecha_fin_programada >= fecha_inicio_accion) AND (fecha_fin_accion IS NULL OR fecha_fin_accion >= fecha_inicio_accion))
);


CREATE INDEX IF NOT EXISTS idx_acciones_empleado
    ON tbl_acciones USING btree
    (id_empleado ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_acciones_estado
    ON tbl_acciones USING btree
    (id_estado ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_acciones_req
    ON tbl_acciones USING btree
    (id_req ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_acciones_user_aud
    ON tbl_acciones USING btree
    (id_user_auditoria ASC NULLS LAST)
    TABLESPACE pg_default;


/*************************
21. CREA LA TABLA tbl_accion_obligacion
***************************/
CREATE TABLE tbl_accion_obligacion (
  id_accion BIGINT NOT NULL,
  id_obligacion BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_accion, id_obligacion),
  CONSTRAINT fk_acc_obl_acc FOREIGN KEY (id_accion)
    REFERENCES tbl_acciones(id_accion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_acc_obl_obl FOREIGN KEY (id_obligacion)
    REFERENCES tbl_obligacion_contractual(id_obligacion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_acc_obl_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_acc_obl_acc       ON tbl_accion_obligacion(id_accion);
CREATE INDEX IF NOT EXISTS idx_acc_obl_obl       ON tbl_accion_obligacion(id_obligacion);
CREATE INDEX IF NOT EXISTS idx_acc_obl_user_aud  ON tbl_accion_obligacion(id_user_auditoria);


/*************************
22. CREA LA TABLA tbl_sgto_acciones
***************************/
CREATE TABLE tbl_sgto_acciones (
  id_sgto_accion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion_sgto TEXT NOT NULL,
  fecha_sgto DATE,
  id_accion BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_sgto_accion_acc FOREIGN KEY (id_accion)
    REFERENCES tbl_acciones(id_accion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_sgto_accion_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sgto_accion_acc      ON tbl_sgto_acciones(id_accion);
CREATE INDEX IF NOT EXISTS idx_sgto_accion_user_aud ON tbl_sgto_acciones(id_user_auditoria);


/*************************
23. CREA LA TABLA tbl_sgto_accion_oblig
***************************/
CREATE TABLE tbl_sgto_accion_oblig (
  id_sgto_accion BIGINT NOT NULL,
  id_obligacion BIGINT NOT NULL,
  id_user_auditoria UUID,
  fecha_auditoria TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_sgto_accion, id_obligacion),
  CONSTRAINT fk_sgto_obl_sgto FOREIGN KEY (id_sgto_accion)
    REFERENCES tbl_sgto_acciones(id_sgto_accion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_sgto_obl_obl FOREIGN KEY (id_obligacion)
    REFERENCES tbl_obligacion_contractual(id_obligacion)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_sgto_obl_user_auditoria FOREIGN KEY (id_user_auditoria)
    REFERENCES tbl_usuarios_sgto_act(id_user)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sgto_obl_sgto      ON tbl_sgto_accion_oblig(id_sgto_accion);
CREATE INDEX IF NOT EXISTS idx_sgto_obl_obl       ON tbl_sgto_accion_oblig(id_obligacion);
CREATE INDEX IF NOT EXISTS idx_sgto_obl_user_aud  ON tbl_sgto_accion_oblig(id_user_auditoria);


/*************************
24. CREA LA TABLA tbl_actividades
***************************/
CREATE TABLE tbl_actividades (
    id_actividad BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actividad TEXT NOT NULL,
    fecha_inicio_actividad DATE NOT NULL,
    fecha_fin_programada DATE NOT NULL,
    fecha_fin_actividad DATE,
    id_req BIGINT,
    id_empleado BIGINT,
    id_estado BIGINT,
    id_user_auditoria UUID,
    fecha_auditoria TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_req FOREIGN KEY (id_req)
        REFERENCES tbl_requerimiento (id_req)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_empleado FOREIGN KEY (id_empleado)
        REFERENCES tbl_empleados_app_sgt_act (id_empleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_estado FOREIGN KEY (id_estado)
        REFERENCES tbl_estados (id_estado)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_user FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_fecha_fin_programada CHECK (fecha_fin_programada >= fecha_inicio_actividad),
    CONSTRAINT chk_fecha_fin_actividad CHECK (
        fecha_fin_actividad IS NULL OR fecha_fin_actividad >= fecha_inicio_actividad
    )
);


CREATE INDEX idx_tbl_actividades_id_req ON tbl_actividades(id_req);
CREATE INDEX idx_tbl_actividades_id_empleado ON tbl_actividades(id_empleado);
CREATE INDEX idx_tbl_actividades_id_estado ON tbl_actividades(id_estado);
CREATE INDEX idx_tbl_actividades_id_user_auditoria ON tbl_actividades(id_user_auditoria);


/*************************
25. CREA LA TABLA tbl_actividad_obligacion
***************************/
CREATE TABLE tbl_actividad_obligacion
(
    id_actividad bigint NOT NULL,
    id_obligacion bigint NOT NULL,
    id_user_auditoria uuid,
    fecha_auditoria timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT tbl_actividad_obligacion_pkey PRIMARY KEY (id_actividad, id_obligacion),
    CONSTRAINT fk_act_obl_acc FOREIGN KEY (id_actividad)
        REFERENCES tbl_actividades (id_actividad) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_act_obl_obl FOREIGN KEY (id_obligacion)
        REFERENCES tbl_obligacion_contractual (id_obligacion) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_act_obl_user_auditoria FOREIGN KEY (id_user_auditoria)
        REFERENCES tbl_usuarios_sgto_act (id_user) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_act_obl_acc
    ON tbl_actividad_obligacion USING btree
    (id_actividad ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_act_obl_obl
    ON tbl_actividad_obligacion USING btree
    (id_obligacion ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_act_obl_user_aud
    ON tbl_actividad_obligacion USING btree
    (id_user_auditoria ASC NULLS LAST)
    TABLESPACE pg_default;