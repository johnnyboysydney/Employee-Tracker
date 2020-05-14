// Dependencies
const chalk = require('chalk');
const inquirer = require("inquirer");
const mysql = require('mysql');
const cTable = require('console.table');
const clear = require('console-clear');

// MySQL DB Connection Information (remember to change this with your specific credentials)
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
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
            choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "View Roles", "View Departments", "Add Employee", "Add Roles", "Add Departments", "Remove Employee", "Remove Role", "Remove Department", "Update Employee Role", "Update Employee Manager", "View Total Utilized Budget By Department", chalk.red("Exit Program")]
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

                case "View Roles":
                queryRolesOnly();
                break;

                case "View Departments":
                queryDepartmentsOnly();
                break;

                case "Add Employee":
                addEmployee();
                break;

                case "Add Roles":
                addRole();
                break;

                case "Add Departments":
                addDepartment();
                break;

                case "Remove Employee":
                removeEmployee();
                break;

                case "Remove Role":
                removeRole();
                break;

                case "Remove Department":
                removeDepartment();
                break;

                case "Update Employee Role":
                updateEmployeeRole();
                break;

                case "Update Employee Manager":
                updateEmployeeManager();
                break;

                case "View Total Utilized Budget By Department":
                viewTotalBudgetByDepartment();
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
function queryDepartments(){
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

function queryDepartmentsCallBack(callback){
    const query = `SELECT department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const departments = [];
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        //prompt for department selection
       callback(departments)
    });
}



// Query the departments without employees
function queryDepartmentsOnly(){
    const query = `SELECT id, department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const  tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({
                "ID": res[i].id,
                "Departments": res[i].name
            });
        }
        // Show the departments
        renderScreen(`All Departments`, tableData);
    });
}

// Query the Roles only and display them for viewing
function queryRolesOnly() {
    const query = `SELECT id, title FROM employeesdb.role;`;
    //build table data array from query result
    connection.query(query, (err, res) => {
        if (err) throw err;
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({ 
                "ID": res[i].id,
                "Roles": res[i].title
            });
        }
        // Show the Roles
        renderScreen("All Roles", tableData);
    });   
}

//query all managers
function queryManagers(){
    const query = `
    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name
    FROM employee
    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract manager names to array
        const managers = [];
        for (let i = 0; i < res.length; i++) {
            managers.push(res[i].full_name);
        }
        //prompt for manager selection
        promptManagers(managers);
    });
}

//query employees by department
function queryEmployeesByDepartment(department){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, concat(manager.first_name, " ", manager.last_name) AS manager_full_name
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
    WHERE department.name = "${department}";`;
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
                "Manager": res[i].manager_full_name
            });
        }
        //render screen
        renderScreen(`${department} Department`, tableData);
    });
}

//query employees by manager
function queryEmployeesByManager(manager){
    //sql query
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name 
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
    WHERE concat(manager.first_name, " ", manager.last_name) = "${manager}";`;
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
                "Department": res[i].department_name
            });
        }
        //render screen
        renderScreen(`Employees managed by ${manager}`, tableData);
    });
}

//-----add / remove / update functions

//add employee
function addEmployee(){
    //initialize newEmployee object
    const newEmployee = {
        firstName: "",
        lastName: "", 
        roleID: 0, 
        managerID: 0
    };
    //new employee name prompt
    inquirer
        .prompt([{
            name: "firstName",
            message: "Enter first name: ",
            validate: async(input) => {
                if(!input.match(/^[A-Z][A-Z ]{0,}/i)) {
                    return "Sorry, the employee's first name must contain at least 1 character and must only contain letters and spaces!".yellow; 
                }
                    return true;
            }
            }, {
            name: "lastName",
            message: "Enter last name: ",
            validate: async(input) => {
                if(!input.match(/^[A-Z][A-Z ]{0,}/i)) {
                    return "Sorry, the employee's last name must contain at least 1 character and must only contain letters and spaces!".yellow; 
                }
                    return true;
            }
            }])
        .then(answers => {
            //set newEmployee name
            newEmployee.firstName = answers.firstName;
            newEmployee.lastName = answers.lastName;
            //sql query for roles
            const query = `SELECT role.title, role.id FROM role;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract role names and ids to arrays
                const roles = [];
                const rolesNames = [];
                for (let i = 0; i < res.length; i++) {
                    roles.push({
                        id: res[i].id,
                        title: res[i].title
                    });
                    rolesNames.push(res[i].title);
                }
                //prompt for role selection
                inquirer
                .prompt({
                    type: "list",
                    name: "rolePromptChoice",
                    message: "Select Role:",
                    choices: rolesNames
                  })
                .then(answer => {
                    //get id of chosen role
                    const chosenRole = answer.rolePromptChoice;
                    let chosenRoleID;
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === chosenRole){
                            chosenRoleID = roles[i].id;
                        }
                    }
                    //set newEmployee role ID 
                    newEmployee.roleID = chosenRoleID;
                    //sql query for managers
                    const query = `
                    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name, manager.id
                    FROM employee
                    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        //extract manager names and ids to arrays
                        const managers = [];
                        const managersNames = [];
                        for (let i = 0; i < res.length; i++) {
                            managersNames.push(res[i].full_name);
                            managers.push({
                                id: res[i].id,
                                fullName: res[i].full_name
                            });
                        }
                        //prompt for manager selection
                        inquirer
                        .prompt({
                            type: "list",
                            name: "managerPromptChoice",
                            message: "Select Manager:",
                            choices: managersNames
                          })
                        .then(answer => {
                            //get id of chosen manager
                            const chosenManager = answer.managerPromptChoice;   
                            let chosenManagerID;
                            for (let i = 0; i < managers.length; i++) {
                                if (managers[i].fullName === chosenManager){
                                    chosenManagerID = managers[i].id;
                                    break;
                                }
                            }
                            //set newEmployee manager ID
                            newEmployee.managerID = chosenManagerID;
                            //add employee insert sql query
                            const query = "INSERT INTO employee SET ?";
                            connection.query(query, {
                                first_name: newEmployee.firstName,
                                last_name: newEmployee.lastName,
                                role_id: newEmployee.roleID || 0,
                                manager_id: newEmployee.managerID || 0
                                }, (err, res) => {
                                if (err) throw err;
                                console.log("Employee Added");
                                //show updated employee table
                                setTimeout(queryEmployeesAll, 500);
                            });                            
                        });
                    });
                });
            });            
        });
}

function addDepartment() {
    inquirer
      .prompt([
        {
          name: "dName",
          type: "input",
          message: "Enter new Department title:",
          validate: async function confirmStringInput(input) {
            if (input.trim() != "" && input.trim().length <= 30) {
              return true;
            }
            return "Invalid input. Please limit your input to 30 characters or less.";
          },
        },
      ])
      .then((answer) => {
        const query = `INSERT INTO department (name) VALUES (?);`;
        connection.query(query, [answer.dName], (err, res) => {
            if (err) throw err;
            console.log("  New Department added successfully!")
            queryDepartmentsCallBack(function(departments) {
                renderScreen("departments", departments);
            } )
        })
        
    });
}

function addRole() {
     //initialize 
    const departments = [];
    const departmentsName = [];
     //sql query
    const query = `SELECT id, name FROM department`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        for (let i=0;i<res.length;i++) {
            departments.push({
               id:res[i].id,
               name:res[i].name});
            departmentsName.push(res[i].name);   
        }
    inquirer
        .prompt([
            {
            name: "rName",
            type: "input",
            message: "Enter new role title:",
            validate: async function confirmStringInput(input) {
                if (input.trim() != "" && input.trim().length <= 30) {
                return true;
                }
                return "Invalid input. Please limit your input to 30 characters or less.";
            },
            },
            {
            name: "salNum",
            type: "input",
            message: "Enter role salary:",
            validate: (input) => {
                if(!input.match(/^[0-9]+$/)) {
                    return "Please enter a number".yellow;
                }
                return true;
                }  
            },
            {
            type: "list",
            name: "roleDept",
            message: "Select department:",
            choices: departmentsName
            },
        ])
        .then((answer) => {
        
            let deptID = departments.find((obj) => obj.name === answer.roleDept).id;
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
            [answer.rName, answer.salNum, deptID], (err, res) => {
                if (err) throw err; 
                console.log(
                    `${answer.rName} was added to the ${answer.roleDept} department.`);
                    queryRolesOnly();
            });
           
        });
    });
} 
// Remove an employee from the database
function removeEmployee() {
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids
        let employees = [];
        let employeesNames = [];
        for (let i=0; i < res.length; i++) {
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to remove
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to delete:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            const query = "DELETE FROM employee WHERE ?";
            connection.query(query, {id: chosenEmployeeID}, (err, res) => {
                if (err) throw err;
                console.log("Employee Removed");
                //show updated employee table
                setTimeout(queryEmployeesAll, 500);
            });       
        });
    });
}

// Remove a role from the database
function removeRole() {
    const query = `
    SELECT id, role.title FROM role;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const roles = [];
        const rolesNames = [];
        for (let i = 0; i < res.length; i++) {
            roles.push({
                id: res[i].id,
                title: res[i].title});
            rolesNames.push(res[i].title);   
        }
        //prompt for role to remove
        inquirer
        .prompt({
            type: "list",
            name: "rolesPromptChoice",
            message: "Select Role to delete",
            choices: rolesNames
          })
        .then(answer => {
             //get id of chosen department
             const chosenRole = answer.rolesPromptChoice;
             let chosenRoleID;
             for (let i = 0; i < roles.length; i++) {
               if (roles[i].title === chosenRole) {
                 chosenRoleID = roles[i].id;
                 break;
               }
             }
             const query = "DELETE FROM role WHERE ?";
             connection.query(query, {id: chosenRoleID}, (err, res) => {
                if (err) throw err;
                console.log("Role Removed");
                //show updated Role table
                setTimeout(queryRolesOnly, 500);
            });
        }); 
    });
 }


// Remove a department from the database
function removeDepartment() {
    const query = `
    SELECT id, department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract department names to array
        const departments = [];
        const departmentsNames = [];
        for (let i = 0; i < res.length; i++) {
            departments.push({
                id: res[i].id,
                name: res[i].name});
            departmentsNames.push(res[i].name);    
        }
        //prompt for department to remove
        inquirer
        .prompt({
            type: "list",
            name: "departmentsPromptChoice",
            message: "Select Department to delete",
            choices: departmentsNames 
          })
        .then(answer => {
             //get id of chosen department
             const chosenDepartment = answer.departmentsPromptChoice;
             let chosenDepartmentId;
             for (let i = 0; i < departments.length; i++) {
               if (departments[i].name === chosenDepartment) {
                 chosenDepartmentId = departments[i].id;
                 break;
               }
             }
             const query = "DELETE FROM department WHERE ?";
             connection.query(query, {id: chosenDepartmentId}, (err, res) => {
                if (err) throw err;
                console.log("Department Removed");
                //show updated Department table
                setTimeout(queryDepartmentsOnly, 500);    
    
            });
        }); 
    });
}

function updateEmployeeRole(){
    //initialize updatedEmployee object
    const updatedEmployee = {
        id: 0,
        roleID: 0, 
    };
    //sql query for Employees
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids to arrays
        let employees = [];
        let employeesNames = [];
        for (let i=0;i<res.length;i++){
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to update
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to update:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            //set updatedEmployee id
            updatedEmployee.id = chosenEmployeeID;
            //sql query for roles
            const query = `SELECT role.title, role.id FROM role;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract role names and ids to arrays
                const roles = [];
                const rolesNames = [];
                for (let i = 0; i < res.length; i++) {
                    roles.push({
                        id: res[i].id,
                        title: res[i].title
                    });
                    rolesNames.push(res[i].title);
                }
                //prompt for role selection
                inquirer
                .prompt({
                    type: "list",
                    name: "rolePromptChoice",
                    message: "Select Role:",
                    choices: rolesNames
                })
                .then(answer => {
                    //get id of chosen role
                    const chosenRole = answer.rolePromptChoice;
                    let chosenRoleID;
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === chosenRole){
                            chosenRoleID = roles[i].id;
                        }
                    }
                    //set updatedEmployee role ID 
                    updatedEmployee.roleID = chosenRoleID;
                    //sql query to update role
                    const query = `UPDATE employee SET ? WHERE ?`;
                    connection.query(query, [
                        {
                          role_id: updatedEmployee.roleID
                        },
                        {
                          id: updatedEmployee.id
                        }
                        ], (err, res) => {
                        if (err) throw err;
                        console.log("Employee Role Updated");
                        //show updated employee table
                        setTimeout(queryEmployeesAll, 500);
                    });
                });
            });            
        });
    });
}

function updateEmployeeManager(){
    //initialize updatedEmployee object
    const updatedEmployee = {
        id: 0,
        managerID: 0
    };
    //sql query for Employees
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        //extract employee names and ids to arrays
        let employees = [];
        let employeesNames = [];
        for (let i=0;i<res.length;i++){
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name});
            employeesNames.push(res[i].employee_full_name);
        }
        //prompt for employee to update
        inquirer
        .prompt({
            type: "list",
            name: "employeePromptChoice",
            message: "Select employee to update:",
            choices: employeesNames
          })
        .then(answer => {
            //get id of chosen employee
            const chosenEmployee = answer.employeePromptChoice;
            let chosenEmployeeID;
            for (let i = 0; i < employees.length; i++) {
              if (employees[i].fullName === chosenEmployee) {
                chosenEmployeeID = employees[i].id;
                break;
              }
            }
            //set updatedEmployee id
            updatedEmployee.id = chosenEmployeeID;
            //sql query for managers
            const query = `
            SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name, manager.id
            FROM employee
            LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                //extract manager names and ids to arrays
                const managers = [];
                const managersNames = [];
                for (let i = 0; i < res.length; i++) {
                    managersNames.push(res[i].full_name);
                    managers.push({
                        id: res[i].id,
                        fullName: res[i].full_name
                    });
                }
                //prompt for manager selection
                inquirer
                .prompt({
                    type: "list",
                    name: "managerPromptChoice",
                    message: "Select Manager:",
                    choices: managersNames
                  })
                .then(answer => {
                    //get id of chosen manager
                    const chosenManager = answer.managerPromptChoice;   
                    let chosenManagerID;
                    for (let i = 0; i < managers.length; i++) {
                        if (managers[i].fullName === chosenManager){
                            chosenManagerID = managers[i].id;
                            break;
                        }
                    }
                    //set newEmployee manager ID
                    updatedEmployee.managerID = chosenManagerID;
                    //sql query to update manager
                    const query = `UPDATE employee SET ? WHERE ?`;
                    connection.query(query, [
                        {
                          manager_id: updatedEmployee.managerID
                        },
                        {
                          id: updatedEmployee.id
                        }
                        ], (err, res) => {
                        if (err) throw err;
                        console.log("Employee Role Updated");
                        //show updated employee table
                        setTimeout(queryEmployeesAll, 500);
                    });              
                });
            });
        });
    });
}

//  view Total Budget By Department
function viewTotalBudgetByDepartment() {
    const query = 
    `select d.name "Department", SUM(r.salary) "BudgetUtilized" 
    from role r
    JOIN department d 
    JOIN employee e 
    where r.id = e.role_id and r.id = d.id group by r.id;`
    connection.query(query, (err, res) => {
        if (err) throw err;
       //build table data array from query result
       const tableData = [];      
       for (let i = 0; i < res.length; i++) {
           tableData.push({
               "Department": res[i].Department,
               "Budjet Utilized": res[i].BudgetUtilized
           });
        }
        renderScreen(`Total Budjet per Department`, tableData);
    });
}
