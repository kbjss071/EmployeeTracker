const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

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

// View employees
function viewEmployee() {
    let sql = `SELECT employees.id, employees.first_name, employees.last_name, role_table.title, department.department_name, role_table.salary, CONCAT(m.first_name, " ", m.last_name) as manager FROM employees
    JOIN role_table ON employees.role_id = role_table.id
    JOIN department ON department.id = role_table.department_id
    LEFT JOIN employees m on m.id = employees.manager_id;`

    db.query(sql, (err, results)=> {
        if (err){
            console.log(err);
        }
        console.log(`\n`);
        console.table(results);
        console.log(`\n`);
    })
    
    mainPrompt();
}
function addEmployee() {
    let sql = `SELECT FROM`
    mainPrompt();
}
function updateEmployee() {
    let sql = `SELECT FROM`
    mainPrompt();
}
function viewRole() {
    let sql = `SELECT FROM`
    mainPrompt();
}
function addRole() {
    let sql = `SELECT FROM`
    mainPrompt();
}
function viewDepartment() {
    let sql = `SELECT FROM`
    mainPrompt();
}
function addDepartment() {
    let sql = `SELECT FROM`
    mainPrompt();
}

function updateManager(){
    let sql = `SELECT FROM`
    ainPrompt();
}
function viewEmployeeByManager(){
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
