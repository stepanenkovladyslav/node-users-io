const http = require("http");
const fs = require("fs");
const { CLIENT_RENEG_LIMIT } = require("tls");
const app = http
	.createServer((req, res) => {
		res.setHeader("Content-Type", "application/json");
		if (req.url === "/api/users") {
			fs.readFile("users.json", "utf-8", (err, data) => {
				if (err) throw err;
				res.setHeader("Content-Type", "application/json");
				res.write(data);
				res.end();
			});
		} else if (req.url == "/favicon.ico") {
			res.end();
		} else if (req.url.includes("?")) {
			const userData = req.url.split("?").slice(-1).join("");
			if (
				userData.split("&")[0].split("=")[0] == "name" &&
				userData.split("&")[1].split("=")[0] == "age"
			) {
				const age = userData.split("&")[1].split("=")[1];
				const name = userData.split("&")[0].split("=")[1];
				fs.readFile("users.json", "utf-8", (err, data) => {
					if (err) throw err;
					const obj = JSON.parse(data);
					const lastId = obj.users.slice(-1)[0].id;
					obj.users.push({
						id: lastId + 1,
						name: name,
						age: age,
					});
					fs.writeFileSync("users.json", JSON.stringify(obj));
					res.write(
						JSON.stringify({ message: "Successfully added user" })
					);
					res.end();
				});
			} else {
				res.statusCode = 404;
				res.statusMessage = "Bad Request";
				res.end();
			}
		} else {
			const id = parseInt(req.url.split("/").slice(-1).join());
			if (req.method === "GET") {
				if (!isNaN(id)) {
					fs.readFile("users.json", "utf-8", (err, data) => {
						if (err) throw err;
						const user = JSON.parse(data).users.find(
							(user) => user.id === id
						);
						if (!user) {
							res.statusCode = 404;
							res.statusMessage = "User not found";
							res.write(JSON.stringify({}));
						} else {
							res.write(JSON.stringify(user));
						}
						res.end();
					});
				} else {
					res.statusCode = 404;
					res.statusMessage = "Request not found";
					res.write(JSON.stringify({}));
					res.end();
				}
			} else if (req.method === "DELETE") {
				fs.readFile("users.json", "utf-8", (err, data) => {
					if (err) throw err;
					const userData = JSON.parse(data);
					const user = userData.users.find((user) => user.id === id);
					if (user) {
						const newUserList = userData.users.filter(
							(user) => user.id !== id
						);
						userData.users = newUserList;
						fs.writeFile(
							"users.json",
							JSON.stringify(userData),
							() => {
								res.end("Deletion completed");
							}
						);
					} else {
						res.statusCode = 404;
						res.statusMessage = "Request not found";
						res.write(JSON.stringify({}));
						res.end();
					}
				});
			} else {
				res.statusCode = 404;
				res.statusMessage = "Request not found";
				res.write(JSON.stringify({}));
				res.end();
			}
		}
	})
	.listen(3500, function () {
		console.log("Started listening");
	});
