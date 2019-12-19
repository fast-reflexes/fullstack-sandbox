const express = require('express')
const cors = require('cors')
const loki = require("lokijs")
const app = express()
const PORT = 3001

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded( {extended: true} )); // to support URL-encoded bodies
app.use(cors())

db = new loki("todos");
db.loadDatabase({}, err => {
						if(err) console.log("Something went wrong, exiting: " + err);
						else {
							todolists = db.getCollection("todolists");
							if(todolists == null) setupDb();
							app.get('/', (req, res) => res.send(getTodoLists()));
							app.post("/", (req, res) => {
								if(typeof req.body.id === "undefined") return res.send("0");
								const id = parseInt(req.body.id);
								if(id == NaN) return res.send(0);
								if(typeof req.body.data === "undefined") return res.send("0");
								const data = JSON.parse(req.body.data);
								if(typeof data.todos === "undefined") return res.send("0");
								const todos = JSON.parse(req.body.data).todos;
								updateTodos(id, todos, () => res.send("1"), () => res.send("0"));
							});
							app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
						}
					}
);
				
function setupDb() {
	console.log("Records not found, setting up data base and adding initial items ...");
	todolists = db.addCollection("todolists", { indices: ['$loki'] })
	todolists.insert({title: 'First List', todos: [['First todo of first list!', false, "2019-12-31"]]});
	todolists.insert({title: 'Second List', todos: [['First todo of second list!', false, "2019-12-31"]]});
}

function getTodoLists() {
	todolists = db.getCollection("todolists");
	posts = todolists.chain().find({}).simplesort("$loki").data();
	postsItem = {}
	for(post of posts) {
		postsItem[post.$loki] = {id: post.$loki, title: post.title, todos: post.todos};
	}
	return postsItem;
}

function updateTodos(listId, todos, success, error) {
	const toUpdate = todolists.findOne({'$loki': listId});
	if(toUpdate === null) return error();
	toUpdate.todos = todos;
	todolists.update(toUpdate);
	db.saveDatabase(
		err => {
			if(err) error();
			else success();
		}
	);
}
