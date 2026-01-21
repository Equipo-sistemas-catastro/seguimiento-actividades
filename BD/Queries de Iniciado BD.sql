--DEFINE EL ESQUEMA DE LA BD
SET search_path TO sgto_actividades;


/*************************
1. LLENAR ROLES INICIALES
***************************/
DO $$
BEGIN
  INSERT INTO tbl_roles_sgto_act (id_role, rol_name, create_at) VALUES
    (1, 'Administrador', CURRENT_DATE),
    (2, 'Coordinador', CURRENT_DATE),
    (3, 'Funcionario', CURRENT_DATE);
END $$;

SELECT * FROM tbl_roles_sgto_act

/*************************
2. LLENAR USUARIOS INICIALES
***************************/
INSERT INTO tbl_usuarios_sgto_act(
	id_user, 
	name_user,
	email_user,
	user_password,
	id_role_user,
	create_at,
	cedula_user
	)
	VALUES (
	gen_random_uuid(),
	'Victor Gonzalez',
	'victorge08@gmail.com',
	'123456',
	1,
	CURRENT_DATE,
	3383821);


SELECT * FROM tbl_usuarios_sgto_act

-- USUARIO FUNCIONARIO
INSERT INTO tbl_usuarios_sgto_act(
	id_user,
	name_user,
	email_user,
	user_password,
	id_role_user,
	create_at
	cedula_user
	) 
	VALUES (
	gen_random_uuid(), 
	"Usuario Funcionario",
	"victorge08@gmail.com",
	"123456",
	3,
	CURRENT_DATE,
	123456);


/*************************
3. LLENAR MENÚ APLICACIÓN
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

--SE HACE INSERT
-- Reemplaza este UUID por uno válido de tu tabla de usuarios
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_menu_app_actividades (code, descripcion, orden, id_user_auditoria) VALUES
    ('OBLIGACIONES',       'Oblig. Contractuales',  1,  v_user_id),
    ('ACTIVIDADES',        'Actividades',           4,  v_user_id),
    ('PERFILES',           'Perfiles',              5,  v_user_id),
    ('ENTIDADES',          'Entidades',             8,  v_user_id),
    ('CONTRATOS',          'Contratos',             9,  v_user_id),
    ('REQUERIMIENTOS',     'Requerimientos',       10,  v_user_id),
    ('ACCCIONES',          'Acciones',             11,  v_user_id),
    ('SGTO_ACCIONES',      'Seguimiento Acciones', 12,  v_user_id),
    ('EMPLEADOS',          'Empleados',            13,  v_user_id),
    ('COMPONENTES',        'Componentes',          14,  v_user_id),
    ('MIS_ACTIVIDADES',    'Mis Actividades',      15,  v_user_id),
    ('MIS_REQUERIMIENTOS', 'Mis Requerimientos',   16,  v_user_id),
    ('INFORME_ACTIVIDADES','Informe Actividades',  17,  v_user_id),
    ('VER_INFORMES',       'Ver Informes',         18,  v_user_id);
END $$;

SELECT * FROM tbl_menu_app_actividades 


/*************************
4. LLENAR PERMISOS MENÚ APLICACIÓN POR ROL
OJO: Se debe de validar primero cuales son los ID de menú para 
asignarloscorrectamente al rol
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_rol_menu_actividades (id_role, id_menu, id_user_auditoria) VALUES
    (1, 1,  v_user_id),
    (1, 3,  v_user_id),
    (1, 9, v_user_id),
    (1, 5,  v_user_id),
    (1, 6, v_user_id),
    (1, 11, v_user_id),
    (1, 12, v_user_id),
    (1, 13, v_user_id),
    (1, 14, v_user_id),
    (3, 12, v_user_id),
    (3, 11, v_user_id),
    (3, 13, v_user_id);
END $$;

SELECT * FROM tbl_rol_menu_actividades 

/*************************
5. INICIAR RUTA EVIDENCIAS 
OJO: Se debe solictar la ruta a Bibiana
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_evidencias (url_evidencia, id_user_auditoria) VALUES
    ('\\\\nas1\\Alcaldia\\229-GCT\\22920-S-Cat\\U-Gest-E-InvInfCat\\Cmn-Gest-E-InvInfCat\\Administrativa\\2025\\COORDINACIÒN ITM VIGENCIAS FUTURAS\\EVIDENCIAS', v_user_id);
END $$;

SELECT * FROM tbl_evidencias 

/*************************
6. INSERTAR EL TIPO DE CONTRATO 
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_tipos_contrato (
    contrato,
    id_user_auditoria
  ) VALUES (
    'PRESTACIÓN DE SERVICIOS',
    v_user_id
  );
END $$;

SELECT * FROM tbl_tipos_contrato

/*************************
7. INSERTAR LA ENTIDAD CONTRATANTE 
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_entidad_contratante (
    entidad,
    id_user_auditoria
  ) VALUES (
    'ITM',
    v_user_id
  );
END $$;

SELECT * FROM tbl_entidad_contratante 


/*************************
8. INSERTAR LOS ESTADOS DE ACTIVIDADES
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_estados (estado, id_user_auditoria) VALUES
    ('POR HACER',     v_user_id),
    ('EN EJECUCIÓN',  v_user_id),
    ('FINALIZADO',    v_user_id);
END $$;

SELECT * FROM tbl_estados

/*************************
9. LLENAR PERFILES LABORALES
OJO: Se debe solictar el listado de perfiles a Bibiana
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza este UUID por uno válido existente en tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_perfiles (perfil, descripcion_perfil, id_user_auditoria) VALUES
    ('PROFESIONAL', 'Funcionario con título profesional', v_user_id),
    ('TECNÓLOGO', 'Funcionario con título de tecnólogo', v_user_id),
    ('AUXILIAR',     'Funcionario con título bachiller', v_user_id);
END $$;

SELECT * FROM tbl_perfiles 


/*************************
10. LLENAR COMPONETES LABORALES (ÁREAS)
OJO: Se debe solictar el listado de componentes a Bibiana
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_componentes (componente, id_user_auditoria) VALUES
    ('SISTEMAS',   v_user_id),
    ('JURIDICA',   v_user_id),
    ('MUTACIONES', v_user_id);
END $$;

SELECT * FROM tbl_componentes 


/*************************
11. LLENAR OBLIGACIONES CONTRACTUALES 
OJO: Se debe solictar el listado de obligaciones por perfil a Bibiana
Cargarlos desde la aplicación
***************************/



/*************************
12. INICIAR EMPLEADOS 
IMPORTANTE: Esto se hace desde la aplicación. 
Para carga masiva se debe construir el archivo plano 
para importar los empleados
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_empleados_app_sgt_act (
    cedula_empleado,
    primer_nombre_empl,
    segundo_nombre_empl,
    primer_apellido_empl,
    segundo_apellido_empl,
    fecha_nacimiento_empl,
    email_empleado,
    movil_empleado,
    estado,
    id_user_auditoria
  ) VALUES (
    3383821,
    'Victor',
    'Javier',
    'Gonzalez',
    'Escobar',
    '1980-08-17',
    'victorge08@gmail.com',
    3216276709,
    'activo',
    v_user_id
  );
END $$;

SELECT * FROM tbl_empleados_app_sgt_act 

/*************************
13. RELACIONAR EMPLEADOS CON PERFIL LABORAL 
IMPORTANTE: Esto se hace desde la aplicación. 
Para carga masiva se debe construir el archivo plano 
para importar la relación empleado con perfil laboral
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_empleado_perfil (
    id_empleado,
    id_perfil,
    estado,
    id_user_auditoria
  ) VALUES (
    1,  -- id_empleado
    1,  -- id_perfil
    'activo',
    v_user_id
  );
END $$;



/*************************
14. RELACIONAR EMPLEADOS CON COMPONENTE (ÁREA) 
IMPORTANTE: Esto se hace desde la aplicación. 
Para carga masiva se debe construir el archivo plano 
para importar la relación empleado con el componente (área)
***************************/

--PRIMERO SE DEBE CONSUTAR EL ID DEL USUARIO ADMON
SELECT * FROM tbl_usuarios_sgto_act 

-- Reemplaza con un UUID válido de tbl_usuarios_sgto_act
DO $$
DECLARE
  v_user_id UUID := 'fa03035b-3e4f-4117-be55-58bcb0506e49';
BEGIN
  INSERT INTO tbl_empleado_componente (
    id_empleado,
    id_componente,
    estado,
    id_user_auditoria
  ) VALUES (
    1,  -- id_empleado
    1,  -- id_componente
    'activo',
    v_user_id
  );
END $$;







