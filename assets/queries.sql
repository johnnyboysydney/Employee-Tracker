-- Used queries in the application

-- Queries to add new Employees, Departments and Roles:
-- Query to insert new Employees
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (?, ?, ?, ?);

-- Query to insert departments
INSERT INTO department (id, name)
VALUES (?, ?);

-- Query to insert Roles
INSERT INTO role (id, title, salary, department_id)
VALUES (?, ?, ?, ?);


-- Queries to View Employees, Departments and Roles:
-- Query to view Employees
SELECT * FROM employee where employee_id like 2;

-- Query to view Departments
SELECT * FROM department where department_id like 3;

-- Query to view Roles
SELECT * FROM role where role_id like 4;

-- Queries to update employee Roles
UPDATE employees SET role = 3 WHERE employee_id like 2;


-- Bonus criteria:
-- Update employee managers
UPDATE employee SET mananger_id = 2 WHERE employee_id like 1;

-- View employees by manager
 SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name 
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
  WHERE manager.first_name like "John" and department.name like 'Management';

-- View Employees by Department
SELECT first_name AS 'First Name', last_name AS 'Last Name', department.name AS 'Department Name' FROM 
    ((employee INNER JOIN role ON role_id = role.id) 
    INNER JOIN department ON department_id = department.id)
    ORDER BY employee.id ASC

-- Queries to Delete Employees, Departments and Roles
-- Query to delete Employees
DELETE FROM employee WHERE first_name like 'John' AND last_name like 'Doe';

-- Query to Delete Departments
DELETE FROM department WHERE name like 'Q&A';

-- Query to Delete Roles
DELETE FROM role WHERE role_id like 8;

-- View the total utilized budget of a department
select name, sum(r.salary) from  employeesdb.department d
inner join employeesdb.role r on d.id = r.department_id
where d.id like 1;


