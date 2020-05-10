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
    renderHeader();
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