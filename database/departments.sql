-- Department-management procedures.

CREATE OR REPLACE PROCEDURE list_departments_sp (
  p_recordset OUT SYS_REFCURSOR
)
AS
BEGIN
  OPEN p_recordset FOR
    SELECT department_id,
           department_name,
           manager_id,
           location_id
      FROM hr_departments
     ORDER BY department_id;
END;
/

CREATE OR REPLACE PROCEDURE create_department_sp (
  p_department_name IN hr_departments.department_name%TYPE,
  p_manager_id      IN hr_departments.manager_id%TYPE,
  p_location_id     IN hr_departments.location_id%TYPE
)
AS
BEGIN
  INSERT INTO hr_departments (
    department_id,
    department_name,
    manager_id,
    location_id
  ) VALUES (
    hr_departments_seq.NEXTVAL,
    p_department_name,
    p_manager_id,
    p_location_id
  );

  COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE update_department_sp (
  p_department_id   IN hr_departments.department_id%TYPE,
  p_department_name IN hr_departments.department_name%TYPE,
  p_manager_id      IN hr_departments.manager_id%TYPE,
  p_location_id     IN hr_departments.location_id%TYPE
)
AS
BEGIN
  UPDATE hr_departments
     SET department_name = p_department_name,
         manager_id      = p_manager_id,
         location_id     = p_location_id
   WHERE department_id = p_department_id;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20010, 'No department found with this department_id.');
  END IF;

  COMMIT;
END;
/
