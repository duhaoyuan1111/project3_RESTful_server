// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
		    }
});



app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/codes',(req,res)=>{
	
	db.all("SELECT * FROM Codes ORDER BY code",function(err,rows){
		var object ={};
		var limit; 		
		
		if(req.query.code != null){
			limit = req.query.code.split(",");
		}else{
			limit = [rows[0].code,rows[rows.length-1].code];
		}
		for(var i=0;i<rows.length;i++){
			if(rows[i].code>= limit[0] && rows[i].code<=limit[1]){
				var code = 'C'+rows[i].code;
				object[code] = rows[i].incident_type;
			}
		}
		if(req.query.format == null){
			var sentJson = JSON.stringify(object,null,4);
			res.type('json').send(sentJson);
		}else{
			var xmlString = "";
			for(var i=0;i<rows.length;i++){
				var code = 'C'+rows[i].code;
				xmlString = xmlString +"<code>"+code+"</code>\n";
				xmlString = xmlString + "<incident_type>"+rows[i].incident_type+"</incident_type>\n";
			}
			xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n'+"<Codes>\n"+xmlString+"</Codes>";
			res.type('xml').send(xmlString);
		}
		
		
		
	});
	
	
	
	
	
	
});





function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}


var server = app.listen(port);
