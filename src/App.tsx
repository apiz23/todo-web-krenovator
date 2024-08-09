import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast, Toaster } from "sonner";
import { Button } from "./components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./components/ui/table";
import { Input } from "./components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "./components/ui/dialog";

export default function App() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [tasks, setTasks] = useState<Array<{ id: number; task: string }>>([]);
	const [newTask, setNewTask] = useState<string>("");
	const [editTask, setEditTask] = useState<{ id: number; task: string } | null>(
		null
	);

	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		checkUser();
		if (user) {
			fetchTasks();
		}
	}, [user]);

	async function checkUser() {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		setUser(user);
		if (user) {
			fetchTasks();
		}
	}

	async function signUp() {
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) {
			toast.error("Error signing up: " + error.message);
		} else {
			toast.error("Check your email for verification link!");
		}
	}

	async function signIn() {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			toast.error("Error signing in: " + error.message);
		} else {
			checkUser();
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		setUser(null);
		setTasks([]);
	}

	async function fetchTasks() {
		if (!user) return;
		const { data: tasks, error } = await supabase
			.from("todo")
			.select("*")
			.eq("user_id", user.id);

		if (error) {
			toast.error("Error fetching tasks: " + error.message);
		} else {
			setTasks(tasks || []);
		}
	}

	async function addTask() {
		if (!newTask || !user) return;
		const { error } = await supabase
			.from("todo")
			.insert({ task: newTask, user_id: user.id });

		if (error) {
			toast.error("Error adding task: " + error.message);
		} else {
			setNewTask("");
			fetchTasks();
		}
	}

	async function updateTask() {
		if (!editTask || !user) return;
		const { error } = await supabase
			.from("todo")
			.update({ task: editTask.task })
			.eq("id", editTask.id)
			.eq("user_id", user.id);

		if (error) {
			toast.error("Error updating task: " + error.message);
		} else {
			setEditTask(null);
			fetchTasks();
		}
	}

	async function deleteTask(id: number) {
		const { error } = await supabase.from("todo").delete().eq("id", id);

		if (error) {
			toast.error("Error deleting task: " + error.message);
		} else {
			fetchTasks();
		}
	}

	return (
		<>
			<Toaster />
			{!user ? (
				<div className="min-h-screen flex items-start justify-center pt-32">
					<div className="max-w-3xl w-full">
						<h2 className="text-center text-5xl font-semibold mb-10">
							Todo List Authenticate
						</h2>

						<Tabs defaultValue="login" className="w-full bg-black rounded-xl">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="login">Login</TabsTrigger>
								<TabsTrigger value="signup">Sign Up</TabsTrigger>
							</TabsList>
							<TabsContent value="login">
								<Card className="border-none">
									<CardHeader>
										<CardTitle>Login</CardTitle>
										<CardDescription>
											Enter your email and password to log in.
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="login-email">Email</Label>
											<Input
												id="login-email"
												type="email"
												placeholder="Email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="login-password">Password</Label>
											<Input
												id="login-password"
												type="password"
												placeholder="Password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
										</div>
										<Button className="bg-blue-500" onClick={signIn}>
											Log In
										</Button>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="signup">
								<Card className="border-none">
									<CardHeader>
										<CardTitle>Sign Up</CardTitle>
										<CardDescription>
											Create a new account by providing your email and password.
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="signup-email">Email</Label>
											<Input
												id="signup-email"
												type="email"
												placeholder="Email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="signup-password">Password</Label>
											<Input
												id="signup-password"
												type="password"
												placeholder="Password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
										</div>
										<Button className="bg-blue-500" onClick={signUp}>
											Sign Up
										</Button>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			) : (
				<div className="min-h-screen flex items-start justify-center pt-20">
					<div className="max-w-3xl w-full mt-4">
						<h2 className="text-center text-5xl font-semibold mb-10">Todo List</h2>
						<div className="flex justify-between">
							<Input
								type="text"
								placeholder="New Task"
								className="px-2 w-full me-2 rounded-lg"
								value={newTask}
								onChange={(e) => setNewTask(e.target.value)}
							/>
							<div className="flex space-x-2">
								<Button className="bg-blue-500" onClick={addTask}>
									Add Task
								</Button>
								<Button className="bg-red-600" onClick={signOut}>
									Sign Out
								</Button>
							</div>
						</div>
						<Table className="my-10">
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">No</TableHead>
									<TableHead>Task</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tasks.map((task, idx) => (
									<Dialog key={task.id} onOpenChange={() => setEditTask(task)}>
										<TableRow>
											<TableCell className="w-[100px]">
												<DialogTrigger className="bg-green-500 rounded-xl text-black py-2 px-5">
													{idx + 1}
												</DialogTrigger>
											</TableCell>
											<TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
												{task.task}
											</TableCell>
											<TableCell className="text-right">
												<span
													onClick={() => deleteTask(task.id)}
													style={{ cursor: "pointer", color: "red" }}
												>
													❌
												</span>
											</TableCell>
										</TableRow>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit Task</DialogTitle>
												<DialogDescription>
													Make changes to your task below.
												</DialogDescription>
											</DialogHeader>
											<Input
												type="text"
												placeholder="Task"
												className="px-2 w-full me-2 rounded-lg"
												value={editTask?.task || ""}
												onChange={(e) => {
													if (editTask) {
														setEditTask({ ...editTask, task: e.target.value });
													}
												}}
											/>

											<DialogFooter>
												<Button onClick={updateTask} className="bg-blue-500">
													Save
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</>
	);
}
