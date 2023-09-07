const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const usernameField = document.getElementById("usernameField");
const passwordField = document.getElementById("passwordField");

loginBtn?.addEventListener("click", login);
registerBtn?.addEventListener("click", register);

function login(e) {
	e.preventDefault();
	try {
		fetch("http://localhost:3000/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: usernameField.value,
				password: passwordField.value,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					localStorage.setItem("username", data.data.username);
					localStorage.setItem(
						"highScore",
						JSON.stringify(data.data.highScore)
					);
					window.location.href = "../snake_game_v10.html";
					alert("Entering...");
				} else {
					alert("Login Failed!!!\n\n" + data.message);
				}
			});
	} catch (err) {
		console.log("Error: ", err);
	}
}

function register() {
	try {
		fetch("http://localhost:3000/new-user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: usernameField.value,
				password: passwordField.value,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(data.message);
				} else {
					alert("Login Failed!!!\n\n" + data.message);
				}
			});
	} catch (err) {
		console.log("Error: ", err);
	}
}
