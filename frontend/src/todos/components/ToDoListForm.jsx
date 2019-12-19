import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import AddIcon from '@material-ui/icons/Add'
import Typography from '@material-ui/core/Typography'
import { TextField } from '../../shared/FormFields'
import DatePicker, { registerLocale } from  "react-datepicker";
import { format, differenceInDays } from 'date-fns'
import sv from 'date-fns/locale/sv';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('sv', sv)

const useStyles = makeStyles({
	card: {
		margin: '1rem'
	},
	todoLine: {
		display: 'flex',
		alignItems: 'center'
	},
	daysLeft: {
		marginRight: "10px",
		fontWeight: "bold"
	},
	textField: {
		flexGrow: 1
	},
	standardSpace: {
		margin: '8px'
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1
	}
})
	
// this is the actual detailed view of each to do list where a new todo can be added as well
export const ToDoListForm = ({ toDoList, saveToDoList }) => {
	const classes = useStyles()
	const [todos, setTodos] = useState(toDoList.todos)
	let changeTriggered = useRef(-1);
	let timer = useRef(null);
	const handleSubmit = event => {
		event.preventDefault()
		saveToDoList(toDoList.id, { todos })
	}
	
	// updates the data base at after rendering if a change has been made
	useEffect(
		() => {
			if(changeTriggered.current >= 0) {
				if(timer.current !== null) {
					clearTimeout(timer.current);
					timer.current = null;
				}
				timer.current = setTimeout(
					() => {
						timer.current = null;
						saveToDoList(toDoList.id, { todos });
					}, changeTriggered.current
				);
				changeTriggered.current = -1;
			}
		}, [toDoList, todos, changeTriggered, saveToDoList, timer])
		
	// text to represent how much time is left for a given todo
	const DaysLeft = 
		({ date }) => {
			const daysLeft = differenceInDays(date, new Date());
			let color = daysLeft <= 0 ? "red": "green";
			let textInfo = daysLeft <= 0 ? "days overdue": "days left to complete";
			return <span className={classes.daysLeft} style={{color: color}}>{Math.abs(daysLeft)} {textInfo}</span>;
		}

	// the done / finished box for a todo
	const TodoFinished = (props) => { 
		if(!props.isFinished) {
			return (
				<Button
					size='small'
					style={{ color: "green" }} 
					className={classes.standardSpace}
					onClick={
						(event) => {
							setTodos([ // immutable done mark
								...todos.slice(0, props.index),
								[todos[props.index][0], true, null],
								...todos.slice(props.index + 1)
							])
							changeTriggered.current = 0;
						}
					}						
				>
					<CheckBoxOutlineBlankIcon />
				</Button>
			)
		}
		else {
			return (
				<Button
					size='small'
					style={{ color: "green" }} 
					className={classes.standardSpace}				
				>
					<CheckBoxIcon />
				</Button>
			)			
		}
	}

	return (
		<Card className={classes.card}>
			<CardContent>
				<Typography component='h2'>
					{toDoList.title}
				</Typography>
				<form onSubmit={handleSubmit} className={classes.form}>
					{todos.map(
						(todoItem, index) => (
							<div key={index} className={classes.todoLine}>
								<Typography className={classes.standardSpace} variant='h6'>
									{index + 1}
								</Typography>
								
								{/*below is the line with text which can be changed whereupon a change event is triggered */}
								<TextField
									label='What to do?'
									value={todoItem[0]}
									onChange={
										event => {
											setTodos([ // immutable update
												...todos.slice(0, index),
												[event.target.value, todos[index][1], todos[index][2]],
												...todos.slice(index + 1)
											])
											changeTriggered.current = 2000;
										}
									}
									onFocusOut={
										event => {
											setTodos([ // immutable update
												...todos.slice(0, index),
												[event.target.value, todos[index][1], todos[index][2]],
												...todos.slice(index + 1)
											])
											changeTriggered.current = 0;
										}
									}									
									className={classes.textField}
								/>
								{!todoItem[1] && <DaysLeft date={new Date(todoItem[2])} />}
								{!todoItem[1] && <DatePicker 
									dateFormat="yyyy-MM-dd" 
									locale="sv"
									selected={new Date(todoItem[2])} 
									onChange={
										date => {
											setTodos([ // immutable update
												...todos.slice(0, index),
												[todos[index][0], todos[index][1], format(date, "yyyy-MM-dd")],
												...todos.slice(index + 1)
											]);
											changeTriggered.current = 0;
										}
									}	
								/>}
								<TodoFinished isFinished={todoItem[1]} index={index} />
								
								{/* below is the delete icon for a todo */ }
								<Button
									size='small'
									color='secondary'
									className={classes.standardSpace}
									onClick={
										(event) => {
											setTodos([ // immutable delete
												...todos.slice(0, index),
												...todos.slice(index + 1)
											])
											changeTriggered.current = 0;
										}
									}
								>
									<DeleteIcon />
								</Button>
							</div>
						)
					)}
					
					{ /* adds a new todo in the form of an empty line of input which can / should be changed by the user */ }
					<CardActions>
						<Button
							type='button'
							color='primary'
							onClick={
								(event) => {
									setTodos([...todos, ['', false, format(new Date(), "yyyy-MM-dd")]])
									changeTriggered.current = 2000;
								}
							}
						>
							Add Todo <AddIcon />
						</Button>
						{false && <Button type='submit' variant='contained' color='primary'>
							Save
						</Button>}
					</CardActions>
				</form>
			</CardContent>
		</Card>
	)
}