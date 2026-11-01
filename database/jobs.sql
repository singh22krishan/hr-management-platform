-- Job-management procedures and lookup function.

CREATE OR REPLACE PROCEDURE new_job_sp (
  p_job_id     IN hr_jobs.job_id%TYPE,
  p_job_title  IN hr_jobs.job_title%TYPE,
  p_min_salary IN hr_jobs.min_salary%TYPE,
  p_max_salary IN hr_jobs.max_salary%TYPE
)
AS
BEGIN
  IF p_min_salary > p_max_salary THEN
    RAISE_APPLICATION_ERROR(-20004, 'Minimum salary cannot exceed maximum salary.');
  END IF;

  INSERT INTO hr_jobs (job_id, job_title, min_salary, max_salary)
  VALUES (UPPER(p_job_id), p_job_title, p_min_salary, p_max_salary);

  COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE update_job_sp (
  p_job_id     IN hr_jobs.job_id%TYPE,
  p_job_title  IN hr_jobs.job_title%TYPE,
  p_min_salary IN hr_jobs.min_salary%TYPE,
  p_max_salary IN hr_jobs.max_salary%TYPE
)
AS
BEGIN
  IF p_min_salary > p_max_salary THEN
    RAISE_APPLICATION_ERROR(-20004, 'Minimum salary cannot exceed maximum salary.');
  END IF;

  UPDATE hr_jobs
     SET job_title  = p_job_title,
         min_salary = p_min_salary,
         max_salary = p_max_salary
   WHERE job_id = UPPER(p_job_id);

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20003, 'No job found with this job_id.');
  END IF;

  COMMIT;
END;
/

CREATE OR REPLACE FUNCTION get_job (
  p_job_id IN hr_jobs.job_id%TYPE
)
RETURN hr_jobs.job_title%TYPE
AS
  v_job_title hr_jobs.job_title%TYPE;
BEGIN
  SELECT job_title
    INTO v_job_title
    FROM hr_jobs
   WHERE job_id = UPPER(p_job_id);

  RETURN v_job_title;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/
