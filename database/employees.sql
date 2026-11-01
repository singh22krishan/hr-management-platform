-- Employee lifecycle procedures for the HR Management Platform.

CREATE OR REPLACE PROCEDURE employee_hire_sp (
  p_first_name      IN hr_employees.first_name%TYPE,
  p_last_name       IN hr_employees.last_name%TYPE,
  p_email           IN hr_employees.email%TYPE,
  p_salary          IN hr_employees.salary%TYPE,
  p_hire_date       IN hr_employees.hire_date%TYPE,
  p_phone           IN hr_employees.phone_number%TYPE,
  p_job_id          IN hr_employees.job_id%TYPE,
  p_manager_id      IN hr_employees.manager_id%TYPE,
  p_department_id   IN hr_employees.department_id%TYPE
)
AS
BEGIN
  INSERT INTO hr_employees (
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    hire_date,
    job_id,
    salary,
    manager_id,
    department_id,
    emp_status
  ) VALUES (
    hr_employees_seq.NEXTVAL,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_hire_date,
    p_job_id,
    p_salary,
    p_manager_id,
    p_department_id,
    'ACTIVE'
  );
  COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE employee_update_sp (
  p_employee_id    IN hr_employees.employee_id%TYPE,
  p_first_name     IN hr_employees.first_name%TYPE,
  p_last_name      IN hr_employees.last_name%TYPE,
  p_email          IN hr_employees.email%TYPE,
  p_phone          IN hr_employees.phone_number%TYPE,
  p_job_id         IN hr_employees.job_id%TYPE,
  p_salary         IN hr_employees.salary%TYPE,
  p_manager_id     IN hr_employees.manager_id%TYPE,
  p_department_id  IN hr_employees.department_id%TYPE
)
AS
BEGIN
  UPDATE hr_employees
     SET first_name    = p_first_name,
         last_name     = p_last_name,
         email         = p_email,
         phone_number  = p_phone,
         job_id        = p_job_id,
         salary        = p_salary,
         manager_id    = p_manager_id,
         department_id = p_department_id
   WHERE employee_id = p_employee_id;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20002, 'No employee found with this employee_id.');
  END IF;

  COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE employee_terminate_sp (
  p_employee_id IN hr_employees.employee_id%TYPE
)
AS
BEGIN
  UPDATE hr_employees
     SET emp_status = 'TERMINATED'
   WHERE employee_id = p_employee_id;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'No employee found for termination.');
  END IF;

  COMMIT;
END;
/
