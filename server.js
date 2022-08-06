const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        port: '3306',
        user: "root",
        password: "root1234",
        database: "employee_db"
    },
);

function mainPrompt(){
    const question = [
        {
            type: "list",
            name: "main",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "Add Employee",
                "Update Employee Role",
                "View All Roles",
                "Add Roles",
                "View All Departments",
                "Add Department",
                "Update Employee Managers",
                "View Employees by Manager",
                "View Employees by Department",
                "Delete Departments",
                "Delete Roles",
                "Delete Employees",
                "View the Total Salary for a Department"
            ],
        }
    ];

    inquirer.prompt(question).then(({main}) => {
        if (main == "View All Employees"){
            viewEmployee();
        } else if(main == "Add Employee"){
            addEmployee();
        } else if(main == "Update Employee Role"){
            updateEmployee();
        } else if(main == "View All Roles"){
            viewRole();
        } else if(main == "Add Roles"){
            addRole();
        } else if(main == "View All Departments"){
            viewDepartment();
        } else if(main == "Add Department"){
            addDepartment();
        } else if(main == "Update Employee Managers"){
            updateManager();
        } else if(main ==  "View Employees by Manager"){
            viewEmployeeByManager();
        } else if(main == "View Employees by Department"){
            viewEmployeeByDepartment();
        } else if(main == "Delete Departments"){
            deleteDepartment();
        } else if(main == "Delete Roles"){
            deleteRole();
        } else if(main == "Delete Employees"){
            deleteEmployee();
        } else if(main == "View the Total Salary for a Department"){
            viewTotalSalaryByDepartment();
        } else {
            console.log("Please select below");
            mainPrompt();
        }
    })
}

// View all employees
function viewEmployee() {
    let sql = `SELECT employees.id, employees.first_name, employees.last_name, role_table.title, department.department_name, role_table.salary, CONCAT(m.first_name, " ", m.last_name) as manager FROM employees
    JOIN role_table ON employees.role_id = role_table.id
    JOIN department ON department.id = role_table.department_id
    LEFT JOIN employees m on m.id = employees.manager_id;`

    db.query(sql, (err, res)=> {
        if (err) throw err;
        console.log(`\n`);
        console.table(res);
        mainPrompt();
    })
    
}

// Add a new employee
function addEmployee() {    
    const question = [
        {
            name: "first_name",
            type: "input",
            message: "Please enter new employee's first name"
        },
        {
            name: "last_name",
            type: "input",
            message: "Please enter new employee's last name"
        }
    ]
    inquirer.prompt(question).then((res)=>{
        let roleSQL = `SELECT id, title FROM role_table`;

        const params = [res.first_name, res.last_name]

        db.query(roleSQL, (err, res)=>{
            if(err) throw err;
            let roleTable = res.map(({id, title}) => ({name: title, value: id}));
            const question = [
                {
                    type: 'list',
                    name: 'role',
                    message: "Please select a role of new employee.",
                    choices: roleTable
                }
            ]

            inquirer.prompt(question).then((res)=>{
                params.push(res.role);

                let employeeSQL = `SELECT id, CONCAT(first_name, " ", last_name) as manager FROM employees`;
                
                db.query(employeeSQL, (err, res) => {
                    let employeeTable = res.map(({id, manager}) => ({name: manager, value: id}));
                    const question = [{
                        type: 'list',
                        name: 'manager',
                        message: "Please select an employee's manager.",
                        choices: employeeTable
                    }]

                    inquirer.prompt(question).then((res)=>{
                        params.push(res.manager);

                        let sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`

                        db.query(sql, params, (err, res)=>{
                            viewEmployee();
                        })
                    })
                })
            })
                        
        })

    })

}

// Update employee's name or role
function updateEmployee() {
    let idSQL = `SELECT id, first_name, last_name FROM employees`

    db.query(idSQL, (err, res)=> {
        let employeeTable = res.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value: id}))

        const question = [
            {
                name: "id",
                type: "list",
                message: "Please enter the employee's id you would like to update.",
                choices: employeeTable
            },
            {
                name: "first",
                type: "input",
                message: "Please enter the employee's first name to update."
            },
            {
                name: "last",
                type: "input",
                message: "Please enter the employee's last name to update."
            },
        ]

        inquirer.prompt(question).then((res)=> {
            const params = [res.first, res.last]
            const id = res.id;

            let roleSQL = `SELECT id, title FROM role_table`

            db.query(roleSQL, (err, res) =>{
                let roleTable = res.map(({id, title}) => ({name: title, value: id}));

                const question = [
                    {
                        type: 'list',
                        name: 'role',
                        message: "Please select their role",
                        choices: roleTable,
                    }
                ]

                inquirer.prompt(question).then((res) => {
                    params.push(res.role)
                    params.push(id)

                    let sql = `UPDATE employees SET first_name=?, last_name=?, role_id=? WHERE id=?`

                    db.query(sql, params, (err, res)=>{
                        if(err) throw err;
                        
                        viewEmployee();                    
                    })
                })

            })
        })
    })
}

// View all role
function viewRole() {
    let sql = `SELECT role_table.id, role_table.title, department.department_name, role_table.salary FROM role_table
    JOIN department on department.id = role_table.department_id;`
    db.query(sql, (err, res)=> {
        if (err) throw err;
        console.log(`\n`);
        console.table(res);
        mainPrompt();
    })

}

// Add a new role
function addRole() {
    const question = [
        {
            name: "title",
            type: "input",
            message: "Please enter a title of new role."
        },
        {
            name: "salary",
            type: "number",
            message: "Please enter a salary of new role."
        },
    ]

    inquirer.prompt(question).then((res)=>{
        let sql = `SELECT id, department_name FROM department;`

        let params = [res.title, res.salary];

        db.query(sql, (err, res) => {
            let table = res.map(({department_name, id}) => ({name: department_name, value: id}));

            const question = [
                {
                    type: 'list',
                    name: 'department_id',
                    message: "Please select the department where the role is in.",
                    choices: table
                }
            ]

            inquirer.prompt(question).then((res) => {
                const deptId = res.department_id;
                params.push(deptId);

                let sql = `INSERT INTO role_table (title, salary, department_id) 
                VALUES (?,?,?)`;

                db.query(sql, params, (err, res) => {
                    viewRole();

                })
            })
            
        })
        
    })
}

// View all departments
function viewDepartment() {
    let sql = `SELECT department.id, department.department_name FROM department;`

    db.query(sql, (err, res)=> {
        if (err){
            console.log(err);
        }
        console.log(`\n`);
        console.table(res);
        mainPrompt();
    })
}

// Add a new department
function addDepartment() {
    const question = [
        {
            name: "department_name",
            type: "input",
            message: "Please enter a new department name."
        }
    ];
    inquirer.prompt(question).then((res)=>{
        let sql = `INSERT INTO department(department_name) VALUES (?)`;

        db.query(sql, res.department_name ,(err, res) => {
            if(err) throw err;
            viewDepartment();
        })

        mainPrompt();
    })

}

// Bonus: Update an employee's manager
function updateManager(){
    let employeeSQL = `SELECT id, CONCAT(first_name, " " ,last_name) as employee FROM employees`

    db.query(employeeSQL, (err, res)=>{
        if (err) throw err;

        let employeeTable = res.map(({id, employee})=>(({name: employee, value: id})))

        const question = [
            {
                type: 'list',
                name: 'employee_id',
                message: "Please select an employee to update their manager",
                choices: employeeTable
            }
        ]

        inquirer.prompt(question).then((res)=>{
            const params = [res.employee_id];
            
            let managerSQL = `SELECT id, CONCAT(first_name, " ", last_name) as manager FROM employees WHERE employees.id != ?`;

            db.query(managerSQL, params, (err, res)=> {
                let managerTable = res.map(({id, manager}) => ({name: manager, value: id}));
                const question = [
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Please select manager of the employee.",
                        choices: managerTable
                    }
                ]

                inquirer.prompt(question).then((res) =>{
                    let sql = `UPDATE employees SET manager_id = ? where id = ?`;
                    
                    params.unshift(res.manager_id);
    
                    db.query(sql, params, (err, res) => {
                        viewEmployee();
                    })
                })

            })
        })
    })
}

// Bonus: View all employees under a manager
function viewEmployeeByManager(){
    let sql = `SELECT id, CONCAT(first_name, " ", last_name) AS manager FROM employees`

    db.query(sql, (err, res)=>{
        if(err) throw err;

        let employeeTable = res.map(({id, manager})=>({name: manager, value: id}))
        
        const question = [
            {
                type: "list",
                name: "manager",
                message: "Please select an employee to view who works for them.",
                choices: employeeTable
            }
        ]
        inquirer.prompt(question).then((res)=>{
            let params = [res.manager]

            let sql = `SELECT * FROM employees WHERE manager_id = ?`

            db.query(sql, params, (err, res)=>{
                if (err) throw err;

                console.table(res);
                
                mainPrompt();
            })
        })
    })
}

// Bonus: viewEmployeeByDepartment
function viewEmployeeByDepartment(){
    let sql = `SELECT id, department_name FROM department`

    db.query(sql, (err, res)=>{
        if (err) throw err;

        let deptTable = res.map(({id, department_name})=>({name: department_name, value: id}))
        
        const question = [
            {
                type: 'list',
                name: 'department',
                message: 'Please select a department to view who is in the dept',
                choices: deptTable
            }
        ]

        inquirer.prompt(question).then((res)=>{
            let params = [res.department]

            let sql = `SELECT e.id, e.first_name, e.last_name, CONCAT(m.first_name, " ", m.last_name) AS manager, r.title, r.salary, d.department_name FROM employees e 
            JOIN role_table r ON e.role_id = r.id 
            JOIN department d ON r.department_id = d.id
            LEFT JOIN employees m ON e.manager_id = m.id
            WHERE d.id = ?`

            db.query(sql, params, (err, res)=>{
                if(err) throw err;

                console.table(res);

                mainPrompt();
            })
        })
    })
}
// Bonus: Select and delete department
function deleteDepartment(){
    let sql = `SELECT id, department_name FROM department`
    db.query(sql, (err, res)=>{
        if (err) throw err;
        
        let deptTable = res.map(({id, department_name})=>({name: department_name, value: id}))

        const question = [
            {
                type: 'list',
                name: 'dept',
                message: "Please select a department you want to delete",
                choices: deptTable
            }
        ]

        inquirer.prompt(question).then((res)=>{
            let params = [res.dept]

            let deleteSQL = `DELETE FROM department WHERE id = ?`

            db.query(deleteSQL, params, (err, res)=>{
                viewDepartment();
            })
        })
    })

}

// Select and delete Role
function deleteRole(){
    let sql = `SELECT id, title FROM role_table`
    db.query(sql, (err, res)=>{
        if (err) throw err;
        
        let roleTable = res.map(({id, title})=>({name: title, value: id}))

        const question = [
            {
                type: 'list',
                name: 'role',
                message: "Please select a role you want to delete",
                choices: roleTable
            }
        ]

        inquirer.prompt(question).then((res)=>{
            let params = [res.role]

            let deleteSQL = `DELETE FROM role_table WHERE id = ?`

            db.query(deleteSQL, params, (err, res)=>{
                viewRole()
            })
        })
    })

}

// Select and delete employee
function deleteEmployee(){
    let sql = `SELECT id, CONCAT(first_name, " ", last_name) AS employee FROM employees`
    db.query(sql, (err, res)=>{
        if (err) throw err;
        
        let employeeTable = res.map(({id, employee})=>({name: employee, value: id}))

        const question = [
            {
                type: 'list',
                name: 'employee',
                message: "Please select an employee you want to delete",
                choices: employeeTable
            }
        ]

        inquirer.prompt(question).then((res)=>{
            let params = [res.employee]

            let deleteSQL = `DELETE FROM employees WHERE id = ?`

            db.query(deleteSQL, params, (err, res)=>{
                viewEmployee();
            })
        })
    })



}

// Bonus: view the total salary by department
function viewTotalSalaryByDepartment(){
    let sql = `SELECT r.department_id AS id, department_name, SUM(r.salary) AS Budget
     FROM employees e
     JOIN role_table r ON e.role_id = r.id
     JOIN department d ON d.id = r.department_id 
     GROUP BY r.department_id`

     db.query(sql, (err, res)=>{
        if(err) throw err;

        console.table(res);

        mainPrompt();
     })
}

mainPrompt();
