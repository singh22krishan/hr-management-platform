-- Salary-range business-rule enforcement.
-- The trigger delegates validation to a reusable procedure.

CREATE OR REPLACE PROCEDURE check_salary (
  p_the_job    IN hr_jobs.job_id%TYPE,
  p_the_salary IN hr_employees.salary%TYPE
)
IS
  v_min_salary hr_jobs.min_salary%TYPE;
  v_max_salary hr_jobs.max_salary%TYPE;
BEGIN
  SELECT min_salary, max_salary
    INTO v_min_salary, v_max_salary
    FROM hr_jobs
   WHERE job_id = UPPER(p_the_job);

  IF p_the_salary NOT BETWEEN v_min_salary AND v_max_salary THEN
    RAISE_APPLICATION_ERROR(
      -20100,
      'Invalid salary. Salary for job ' || UPPER(p_the_job) ||
      ' must be between ' || v_min_salary || ' and ' || v_max_salary || '.'
    );
  END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20101, 'Unknown job_id: ' || UPPER(p_the_job));
END;
/

CREATE OR REPLACE TRIGGER check_salary_trg
BEFORE INSERT OR UPDATE OF job_id, salary
ON hr_employees
FOR EACH ROW
BEGIN
  check_salary(:NEW.job_id, :NEW.salary);
END;
/
