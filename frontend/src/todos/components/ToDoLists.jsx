import React, { Fragment, useState, useEffect } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ReceiptIcon from '@material-ui/icons/Receipt'
import Typography from '@material-ui/core/Typography'
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { ToDoListForm } from './ToDoListForm'

const request = (url, method, data) => new Promise(
										(resolve, reject) => {
											var xhr = new XMLHttpRequest();							
											xhr.onreadystatechange = function () {
												if (xhr.readyState !== 4) return;
												if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
												else Promise.reject("FAILED TO FETCH DATA!");
											};
											xhr.open(method, url);
											if(method === "POST") xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
											if(data !== "") xhr.send(data);
											else xhr.send();
										}
									);

export const ToDoLists = ({ style }) => {
	const [toDoLists, setToDoLists] = useState({})
	const [activeList, setActiveList] = useState()

	// put the initial fetch from database in an effect hook with additional argument the empty array -> only called at first render
	useEffect(
		() => {
			request('http://localhost:3001', 'GET', "").then(setToDoLists)
		}, [])

	if (!Object.keys(toDoLists).length) return null
	return <Fragment>
		<Card style={style}>
			<CardContent>
				<Typography component='h2'>
					My ToDo Lists
				</Typography>
				<List>
					{Object.keys(toDoLists).map(
						(key) => <ListItem
									key={key}
									button
									onClick={() => setActiveList(key)}
								>
								<ListItemIcon>
									<ReceiptIcon />
								</ListItemIcon>
								<ListItemText primary={toDoLists[key].title} />
								{toDoLists[key].todos.reduce((accumulator, currentValue) => accumulator && currentValue[1], true) && 
								<CheckBoxIcon style={{ color: "green" }} />}
							</ListItem>)}
				</List>
			</CardContent>
		</Card>
		{toDoLists[activeList] && <ToDoListForm
			key={activeList} // use key to make React recreate component to reset internal state
			toDoList={toDoLists[activeList]}
			saveToDoList={(id, { todos }) => {
				const listToUpdate = toDoLists[id]
				const nextList = {...toDoLists, [id]: { ...listToUpdate, todos }};
				const saveReq = request('http://localhost:3001', 'POST', "id=" + id + "&data=" + JSON.stringify({ ...listToUpdate, todos }));
				saveReq
					.then(
						(res) => { 
							const status = parseInt(res);
							if(status === 1) setToDoLists(nextList);
							else console.log("failed to add to todolist");
						}
					)
					.catch(
						(rej) => {
							console.log("failed to add to todolist due to failure");
						}
					);
			}}
		/>}
	</Fragment>
}
