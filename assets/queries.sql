-- Used queries in the application

-- Queries to add new Employees, Departments and Roles:
-- Query to insert new Employees
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, "John", "Doe", 1, 1);

-- Query to insert departments
INSERT INTO department (id, name)
VALUES (1, "Management");

-- Query to insert Roles
INSERT INTO role (id, title, salary, department_id)
VALUES (1, "CEO", 120000, 1);


-- Queries to View Employees, Departments and Roles:
-- Query to view Employees
SELECT * FROM employee;

-- Query to view Departments
SELECT * FROM department;

-- Query to view Roles
SELECT * FROM role;


-- Bonus criteria:
-- Update employee managers

-- View employees by manager

-- Queries to Delete Employees, Departments and Roles

-- View the total utilized budget of a department



