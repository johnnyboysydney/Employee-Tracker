// Dependencies
const chalk = require('chalk');
const inquirer = require("inquirer");
const mysql = require('mysql');
const cTable = require('console.table');
const clear = require('console-clear');
const figlet = require('figlet');

// MySQL DB Connection Information (remember to change this with your specific credentials)
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Terror301",
    database: "employeesdb"
  });

  // Initiate MySQL Connection.
connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);
    startApp()
});

//-----start the Employee Tracker
function startApp(){
    clear();
    renderImage()
    menuPrompt();
}

// render image
function renderImage(){
    console.log(chalk.hex("	#228B22")(String.raw`
#######                                                    #######                                           
#       #    # #####  #       ####  #   # ###### ######       #    #####    ##    ####  #    # ###### #####  
#       ##  ## #    # #      #    #  # #  #      #            #    #    #  #  #  #    # #   #  #      #    # 
#####   # ## # #    # #      #    #   #   #####  #####        #    #    # #    # #      ####   #####  #    # 
#       #    # #####  #      #    #   #   #      #            #    #####  ###### #      #  #   #      #####  
#       #    # #      #      #    #   #   #      #            #    #   #  #    # #    # #   #  #      #   #  
####### #    # #      ######  ####    #   ###### ######       #    #    # #    #  ####  #    # ###### #    # `));
   console.log(chalk.dim("  Database\n"));
}

//render table data and menu prompt
function renderScreen(tableTitle, tableData){
    clear();
    renderImage();
    //log table title to console in inverse colors
    console.log(chalk.inverse.bold(tableTitle));
    //log table to console
    console.table(tableData);
    //menu prompt
    menuPrompt();
}

//initial prompt - which type of query?
function menuPrompt(){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Make a selection:",
            choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", chalk.red("Exit Program")]
          })
        .then(answer => {
            switch(answer.promptChoice){
                case "View All Employees":
                queryEmployeesAll();
                break;

                case "View All Employees by Department":
                queryDepartments();
                break;

                case "View All Employees by Manager":
                queryManagers();
                break;

                case "Add Employee":
                addEmployee();
                break;

                case "Remove Employee":
                removeEmployee();
                break;

                case "Update Employee Role":
                updateEmployeeRole();
                break;

                case "Update Employee Manager":
                updateEmployeeManager();
                break;

                case "\u001b[31mExit Program\u001b[39m":
                clear();
                process.exit();                
            }             
        });
}

//department prompt
function promptDepartments(departments){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Select Department:",
            choices: departments
          })
        .then(answer => {
            queryEmployeesByDepartment(answer.promptChoice);            
        });
}

//manager prompt
function promptManagers(managers){
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Select Manager:",
            choices: managers
          })
        .then(answer => {
            queryEmployeesByManager(answer.promptChoice);            
        });
}

//query all employees
function queryEmployeesAll(){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON department.id = role.department_id
	LEFT JOIN employee as manager ON employee.manager_id = manager.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //build table data array from query result
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({ 
                "ID": res[i].id, 
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary, 
                "Department": res[i].department_name,
                "Manager": res[i].manager_full_name
            });
        }
        //render screen
        renderScreen("All Employees", tableData);
    });
}

//query all departments
function queryDepartment(){
    const query = `SELECT department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const departments = [];
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        //prompt for department selection
        promptDepartments(departments)
    });
}