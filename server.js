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
    database: "seinfeld"
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

// figlet('Welcome to the Employee Tracker', function(err, data){
//     if (err) {
//         console.log('Something went wrong...');
//         console.dir(err);
//         return;
//     }
//     console.log(data)
// });

