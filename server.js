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
                "Add department",
                "Update Employee Managers",
                "View Employees by Manager",
                "View Employees by Department",
                "Delete Departments, Roles, and Employees",
                "View the Total Salary for a Department"
            ],
        }
    ];

    inquirer.prompt(question).then(({main}) => {
        console.log(main);
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
        } else if(main == "Delete Departments, Roles, and Employees"){
            deleteKey();
        } else if(main == "View the Total Salary for a Department"){
            viewTotalSalaryByDepartment();
        } else {
            console.log("Please select below");
            mainPrompt();
        }
    })
}

// Work done
function viewEmployee() {
    let sql = `SELECT employees.id, employees.first_name, employees.last_name, role_table.title, department.department_name, role_table.salary, CONCAT(m.first_name, " ", m.last_name) as manager FROM employees
    JOIN role_table ON employees.role_id = role_table.id
    JOIN department ON department.id = role_table.department_id
    LEFT JOIN employees m on m.id = employees.manager_id;`

    db.query(sql, (err, res)=> {
        if (err){
            console.log(err);
        }
        console.log(`\n`);
        console.table(res);
        console.log(`\n`);
    })
    
    mainPrompt();
}

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
        },
        {
            name: "role",
            type: "list",
            message: "Please select their role.",
            choices: selectRole()
        },
        {
            name: 'manager',
            type: 'list',
            message: "Please select their manager.",
            choices: selectManager()
        }
    ]
    inquirer.prompt(question).then((res)=>{
        let sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
        VALUES (${res.first_name}, ${res.last_name}, ${res.role}, ${res.manager})`

        db.query(sql, (err, res)=>{
            console.log("======Employee Added=====")
            console.table(res);
            console.log("\n");
        })

    })

    mainPrompt();
}

function updateEmployee() {
    const question = [
        {
            name: "id",
            type: "number",
            message: "Please enter the employee's id you would like to update."
        },
        {
            name: "first",
            type: "input",
            message: "Please enter the employee's first name."
        },
        {
            name: "last",
            type: "input",
            message: "Please enter the employee's last name."
        },
        {
            name: "role",
            type: "list",
            message: "Please select their role.",
            choices: selectRole()
        },
        {
            name: 'manager',
            type: 'list',
            message: "Please select their manager.",
            choices: selectManager()
        }
    ]

    inquirer.prompt(question).then((res)=>{
        let sql = `UPDATE employees SET first_name = ${res.first},
        last_name = ${res.last}, role_id = ${res.role}, manager_id = ${res.manager} where id = ${res.id};`

        db.query(sql, (err, res)=>{
            console.log('========Updating employees========\n');
            console.table(res);
            console.log(`\n`);
        })
    })
    mainPrompt();
}
//Word done
function viewRole() {
    let sql = `SELECT role_table.id, role_table.title, department.department_name, role_table.salary FROM role_table
    JOIN department on department.id = role_table.department_id;`
    db.query(sql, (err, res)=> {
        if (err){
            console.log(err);
        }
        console.log(`\n`);
        console.table(res);
        console.log(`\n`);
    })

    mainPrompt();
}
function addRole() {
    const question = [
        {
            name: "title",
            type: "input",
            message: "Please enter a tile of new role."
        },
        {
            name: "salary",
            type: "number",
            message: "Please enter a salary of new role."
        },
        {
            name: "department_id",
            type: "number",
            message: "Please enter a department id of new role."
        }
    ]

    inquirer.prompt(question).then((res)=>{
        let sql = `INSERT INTO role_table(title, salary, department_id)
        VALUES (${res.title}, ${res.salary}, ${res.department_id});`

        db.query(sql, (err, res)=>{
            console.table(res);
        })

        // let sql = `SELECT role.id, role.title, department.department_name, role.salary FROM role_table role
        // JOIN department on department.id = role.department_id;`

    })
    mainPrompt();
}
//Word done
function viewDepartment() {
    let sql = `SELECT department.id, department.department_name FROM department;`

    db.query(sql, (err, res)=> {
        if (err){
            console.log(err);
        }
        console.log(`\n`);
        console.table(res);
        console.log(`\n`);
    })
    mainPrompt();
}
function addDepartment() {
    const question = [
        {
            name: "department_name",
            type: "input",
            message: "Please enter a new department name."
        }
    ]
    inquirer.prompt(question).then((res)=>{
        let sql = `INSERT INTO department(department_name) VALUES (res.department_name);`

        db.query(sql, (err, res) => {
            console.table(res);
        })

    })

    mainPrompt();
}

function updateManager(){
    const question = [
        {
            name: "employee",
            type: "input",
            message: "Please enter employee's id."
        },
        {
            name: "manager",
            type: "number",
            message: "Please enter new manager's id."
        }
    ]

    inquirer.prompt(question).then((res)=>{
        let sql = `UPDATE employees SET manager_id = ${res.manager} where id = ${res.employee}`

        db.query(sql, (err, res)=>{
            console.log(res);
        })

    })

    mainPrompt();
}
function viewEmployeeByManager(){
    const question = [
        {
            name: "manager",
            type: "number",
            message: "Please enter a Manager ID to see employees working under them."
        }
    ]
    let sql = `SELECT FROM`
    mainPrompt();
}
function viewEmployeeByDepartment(){
    let sql = `SELECT FROM`
    mainPrompt();
}
function deleteKey(){
    let sql = `SELECT FROM`
    mainPrompt();
}
function viewTotalSalaryByDepartment(){
    let sql = `SELECT FROM`
    mainPrompt();
}

mainPrompt();
