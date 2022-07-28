SELECT * FROM  department;

SELECT role_table.id, role_table.title, department.department_name, role_table.salary FROM role_table
JOIN department on department.id = role_table.department_id;

SELECT employees.id, employees.first_name, employees.last_name, role_table.title, department.department_name, role_table.salary, CONCAT(m.first_name, " ", m.last_name) as manager FROM employees
JOIN role_table ON employees.role_id = role_table.id
JOIN department ON department.id = role_table.department_id
LEFT JOIN employees m on m.id = employees.manager_id;